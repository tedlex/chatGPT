import React from 'react';
import 'highlight.js/styles/a11y-dark.css';
import DOMPurify from 'dompurify';
import Container from 'react-bootstrap/Container';

function ChatWindow({ messages, conversationStartIndex }) {
    return (
        <Container style={{ marginBottom: '10rem' }}>
            {messages.map((message, i) =>
                <Message message={message} i={i} conversationStartIndex={conversationStartIndex} key={i} />
            )}
        </Container>
    )
}

const Message = function ({ message, i, conversationStartIndex }) {
    //console.log('render Message')
    let cls = `p-3 mb-0 border-top ${i >= conversationStartIndex ? "border-primary " : " "}`
    if (message.role === 'user') {
        cls += 'bg-white'
        return (
            <div className={cls} >
                {message.content}
            </div>
        )
    } else if (message.role === 'assistant') {
        cls += 'bg-light';
        let sanitizedHTML = DOMPurify.sanitize(message.content_md);
        return (
            <div className={cls} dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
        )
    } else {
        return null
    }
}



export default ChatWindow;