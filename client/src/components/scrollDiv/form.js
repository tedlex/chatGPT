import React from 'react';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import { useState, useContext, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { apiURL } from '../../config';
//import hljs from 'highlight.js';

import PromptText from './bottomText'
import SubmitButton from './submitButton';
import ModelSelect from './modelSelect';
import ConversationSelect from './conversationMode';
import extractURLs from '../../utils/extractURLs';

function PromptForm({ messages, setMessages, systemText, templateMessage, conversations, setConversations, conversationStartIndex, setConversationStartIndex, selectedTemplate }) {
    const { conversationId, setConversationId, windowState } = useContext(AppContext);
    const [prompt, setPrompt] = useState('');
    const [browsing, setBrowsing] = useState(false);
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [conversationMode, setConversationMode] = useState("off");
    const [conversationStart, setConversationStart] = useState('0');
    const [isSending, setIsSending] = useState(false)
    const textareaRef = useRef();
    //console.log(`render form; templateMessage: ${templateMessage}`)
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (prompt !== '' && !isSending) {
            setPrompt(templateMessage)
            setIsSending(true);
            const newMessages = [...messages, { role: 'user', content: prompt, content_md: prompt }]
            setMessages(newMessages)
            const convMessages = [...messages.slice(conversationStartIndex), { role: 'user', content: prompt }].map((element) => {
                return { role: element.role, content: element.content }
            })
            const response = await fetch(`${apiURL}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ convMessages, browsing, model, conversationMode, conversationStart, systemText, conversationId, selectedTemplate }),
                credentials: 'include'
            });
            //console.log(`send template id: ${selectedTemplate}`)
            const data = await response.json();

            //console.log(data);
            setIsSending(false)
            //setMessages([...newMessages, { role: 'assistant', content_md: '<p>received</p>' }])
            if (data.conversationId !== conversationId) {
                setConversationId(data.conversationId)
                setConversations([{ _id: data.conversationId, title: "New Conversation" }, ...conversations])
            }


            let url = `${apiURL}/api/streaming`
            if (browsing) {
                console.log('online')
                url = `${apiURL}/api/streaming?online=1`
                if (extractURLs(prompt).length > 0) {
                    //console.log('url detected')
                    //console.log(extractURLs(prompt))
                    url = `${apiURL}/api/streaming?online=2`
                }
            }
            const EventSource = NativeEventSource || EventSourcePolyfill;
            const evtSource = new EventSource(url, { withCredentials: true });
            console.log('start sse')
            let contentAll_md = ''
            let contentAll = ''
            evtSource.onmessage = (e) => {
                //console.log('sse receive')
                //console.log(e)
                if (JSON.parse(e.data).content === '[DONE]') {
                    //hljs.highlightAll();
                    evtSource.close()
                    //console.log('sse close')
                } else if (JSON.parse(e.data).content === '[TITLE]') {
                    //console.log('[TITLE]')
                    setConversations([{ _id: data.conversationId, title: JSON.parse(e.data).title }, ...conversations])
                } else if (JSON.parse(e.data).content === '[TOKENS]') {
                    //console.log('[TOKENS]')
                    const tokens = JSON.parse(e.data).count
                    setMessages([...newMessages, { role: 'assistant', content: contentAll, content_md: contentAll_md + `[Tokens: ${tokens}]` }])
                } else if (JSON.parse(e.data).content === '[CONTENT]') {
                    //console.log('[CONTENT]')
                    contentAll_md = JSON.parse(e.data).contentAll_md
                    contentAll = JSON.parse(e.data).contentAll
                    setMessages([...newMessages, { role: 'assistant', content: contentAll, content_md: contentAll_md }])
                } else {
                    setMessages([...newMessages, { role: 'assistant', content: JSON.parse(e.data).content, content_md: JSON.parse(e.data).content }])
                }
            }
            evtSource.onerror = (e) => {
                //console.log('sse error')
                setMessages([...newMessages, { role: 'assistant', content_md: 'sse error!' }])
            }
        }
    }
    return (
        <div style={{ position: "fixed", bottom: "0", width: windowState === 'large' ? "calc(100% - 200px)" : "100%" }} id="bottomDiv">
            <Form name="formInput" method="post" id="messageForm" onSubmit={handleSubmit}>
                <Row className='mb-1 mb-md-3 mx-2 justify-content-center align-items-center'>
                    <Col xs={12} md={{ span: true, order: 1 }} className='mb-2 mb-md-0 position-relative p-0'>
                        <InputGroup className="mb-0">
                            <ModelSelect model={model} setModel={setModel} />
                            <PromptText text={prompt} setText={setPrompt} handleSubmit={handleSubmit} isSending={isSending} textareaRef={textareaRef} templateMessage={templateMessage} />
                        </InputGroup>
                        <SubmitButton handleSubmit={handleSubmit} />
                    </Col>
                    <Col xs="auto" md={{ order: 0 }}>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="browse"
                            checked={browsing}
                            onChange={(e) => setBrowsing(e.target.checked)}
                            reverse
                        />
                    </Col>
                    <Col xs="auto" md={{ order: 3 }}>
                        <ConversationSelect conversationMode={conversationMode} conversationStart={conversationStart} setConversationMode={setConversationMode} setConversationStart={setConversationStart} setConversationStartIndex={setConversationStartIndex} messages={messages} />
                    </Col>
                </Row>
            </Form>
        </div>
    )
}



export default PromptForm;