import React from 'react';
import Form from 'react-bootstrap/Form';
import { useEffect } from 'react';

function PromptText({ text, setText, handleSubmit, isSending, textareaRef, templateMessage }) {
    useEffect(() => {
        console.log('effect: resize prompt listener')
        const resizeText = () => {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const textHeight = textarea.scrollHeight;
            textarea.style.height = textHeight + 'px';
        }
        window.addEventListener('resize', resizeText);
        return () => {
            window.removeEventListener('resize', resizeText);
        }
    }, [textareaRef])

    useEffect(() => {
        const resizeText = () => {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const textHeight = textarea.scrollHeight;
            textarea.style.height = textHeight + 'px';
        }
        resizeText();
    })


    useEffect(() => {
        console.log('effect: set prompt text')
        setText(templateMessage);
    }, [templateMessage, setText])

    return (
        <Form.Control
            as="textarea"
            rows="1"
            size="lg"
            type="text" placeholder="Ask AI"
            style={{ paddingRight: "2.5rem", paddingLeft: "0.5rem", resize: "none", maxHeight: "8rem" }}
            ref={textareaRef}
            value={text}
            onChange={(e) => {
                setText(e.target.value);
            }}
            onKeyDown={(e) => {
                // e.preventDefault(); // when pressing a key the order is onKeyDown then onChange. So this prevent will stop onChange receiving this input. 
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                }

            }}
            disabled={isSending}
        />
    )
}

export default PromptText;