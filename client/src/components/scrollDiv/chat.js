import React from 'react';
import { useState, useContext, useEffect } from 'react'
import { AppContext } from '../../contexts/AppContext';

import Container from 'react-bootstrap/Container';

import { apiURL, templates_sample } from '../../config';
import SystemGroup from './SystemGroup';
import PromptForm from './form';
import ChatWindow from './chatWindow';

function Chat({ conversations, setConversations }) {
    const { conversationId, windowState, user } = useContext(AppContext);
    const [messages, setMessages] = useState([])
    const [templates, setTemplates] = useState(templates_sample)
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
    const [conversationStartIndex, setConversationStartIndex] = useState(10000);

    useEffect(() => {
        //console.log('Chat effect')
        let ignore = false;
        const fetchConversation = async () => {
            try {
                const res = await fetch(`${apiURL}/api/conversation/${conversationId}`, { credentials: 'include' });
                const data = await res.json();
                //console.log(data)
                if (!ignore) {
                    setMessages([...data.messages]);
                    if (data.template) {
                        setSelectedTemplate(data.template)
                    }
                } else {
                    console.log('Chat effect ignore')
                }
            } catch (error) {
                console.log("Error fetching conversations: ", error);
                setMessages([{ role: "user", content: "error!", content_md: "error" }])
            }
        };
        if (conversationId !== 'NEW') {
            fetchConversation();
        } else {
            setMessages([])
        }
        return () => { ignore = true; }
    }, [conversationId]);

    // req templates from api server when user._id changes
    useEffect(() => {
        //console.log('template effect')
        let ignore = false;
        const fetchTemplates = async () => {
            try {
                const res = await fetch(`${apiURL}/api/templates`, { credentials: 'include' });
                const data = await res.json();
                if (!ignore) {
                    console.log(data)
                    setTemplates([...data.templates]);
                    setSelectedTemplate(data.templates[0].id)
                } else {
                    console.log('template effect ignore')
                }
            } catch (error) {
                console.log("Error fetching templates: ", error);
            }
        };
        if (user._id) {
            fetchTemplates();
        } else {
            console.log('no user. use sample templates')
        }
        return () => { ignore = true; }
    }, [user._id]);


    let systemText, templateMessage;
    if (templates.length > 0) {
        const selectedTemplateObj = templates.find(template => template.id === selectedTemplate)
        if (selectedTemplateObj) {
            systemText = selectedTemplateObj.system;
            templateMessage = selectedTemplateObj.message;
        } else {
            systemText = templates[0].system;
            templateMessage = templates[0].message;
            setSelectedTemplate(templates[0].id)
        }
    } else {
        setTemplates(templates_sample)
        setSelectedTemplate(templates_sample[0].id)
        systemText = templates_sample[0].system;
        templateMessage = templates_sample[0].message;
    }


    return (
        <div id="scrollDiv" style={{ paddingTop: windowState === "large" ? "0" : "50px" }}>
            <Container className='mt-4'>
                <Container className='my-3'>
                    <SystemGroup templates={templates} setTemplates={setTemplates} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
                </Container>

                <ChatWindow messages={messages} conversationStartIndex={conversationStartIndex} />
            </Container>
            <PromptForm messages={messages} setMessages={setMessages} systemText={systemText} templateMessage={templateMessage} conversations={conversations} setConversations={setConversations} conversationStartIndex={conversationStartIndex} setConversationStartIndex={setConversationStartIndex} selectedTemplate={selectedTemplate} />
        </div>
    )
}

//const messagesInit = [{ role: 'user', content_md: "hello" }, { role: 'assistant', content_md: "<p>Hi, I am your AI assistant. How may I help you?</p>" }, { role: 'user', content_md: "who are you" }, { role: 'assistant', content_md: "I am your father!" }];


export default Chat;