import React from 'react';
import { useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';

function SystemText({ templates, selectedTemplate, setSelectedTemplate }) {
    const textareaRef = useRef();
    const updateSystemHeight = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const textHeight = textarea.scrollHeight;
        textarea.style.height = textHeight + 'px';
    }


    useEffect(() => {
        let template = templates.find(template => template.id === selectedTemplate);
        // if template is not found, use the first template
        if (!template) {
            console.log('template not found')
            setSelectedTemplate(templates[0].id)
        }
    }, [selectedTemplate, templates, setSelectedTemplate]);

    useEffect(() => {
        updateSystemHeight();
        window.addEventListener('resize', updateSystemHeight);
        return () => {
            window.removeEventListener('resize', updateSystemHeight);
        }
    });

    let template = templates.find(template => template.id === selectedTemplate) || templates[0];


    return (
        <Form.Control
            as="textarea"
            id="introText"
            type='text'
            rows="1"
            placeholder='Empty'
            name="introText"
            style={{ height: "auto", overflow: "hidden", maxHeight: "12rem", resize: "none" }}
            value={template.system}
            ref={textareaRef}
            readOnly={true}
        />
    );
}

export default SystemText;