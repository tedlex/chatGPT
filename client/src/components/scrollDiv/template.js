import React from 'react';
import { useState, useRef, useContext } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { apiURL } from '../../config';
import { AppContext } from '../../contexts/AppContext';


function Template({ template, activeId, setActiveTemplate, cardWidth, setTemplates, templates, selectedTemplate, setSelectedTemplate, setShow }) {
    const [isEditing, setIsEditing] = useState(false)
    const { user } = useContext(AppContext);

    const titleRef = useRef(null)
    const systemRef = useRef(null)
    const messageRef = useRef(null)

    const handleEdit = async () => {
        if (!isEditing) {
            setIsEditing(true)
        } else {
            // post the changes to api server
            const titleValue = titleRef.current.innerText.trim().length === 0 ? "Untitled" : titleRef.current.innerText
            const systemValue = (systemRef.current.innerText.toUpperCase() === "NULL" || systemRef.current.innerText.trim().length === 0) ? "" : systemRef.current.innerText
            const messageValue = (messageRef.current.innerText.toUpperCase() === "NULL" || messageRef.current.innerText.trim().length === 0) ? "" : messageRef.current.innerText
            async function updateTemplate() {
                try {
                    const response = await fetch(`${apiURL}/api/templates/${template.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: titleValue,
                            system: systemValue,
                            message: messageValue
                        }),
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        //console.log(data);
                    } else {
                        console.log('update template Response was not OK', response);
                    }
                } catch (error) {
                    console.log('update template error', error);
                }
            }

            if (user._id) {
                await updateTemplate()
            } else {
                console.log("user not logged in [update template]")
            }

            setIsEditing(false)
            setTemplates(templates.map(t => {
                if (t.id !== template.id) {
                    return t
                } else {
                    return {
                        id: t.id,
                        title: titleValue,
                        system: systemValue,
                        message: messageValue
                    }
                }
            }))
        }
    }

    const handleDelete = async () => {
        // req to api server to delete template
        async function deleteTemplate() {
            try {
                const response = await fetch(`${apiURL}/api/templates/delete/${template.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                } else {
                    console.log('delete template Response was not OK', response);
                }
            } catch (error) {
                console.log('delete template error', error);
            }
        }

        if (templates.length > 1) {
            if (user._id) {
                await deleteTemplate()
            } else {
                console.log("user not logged in [delete template]")
            }
            setTemplates(templates.filter(t => t.id !== template.id))
            if (template.id === selectedTemplate) {
                setSelectedTemplate(templates[0].id)
            }
        }
    }

    const handleSelectTemplate = () => {
        setSelectedTemplate(template.id)
        setShow(false)
    }

    return (
        <ListGroup.Item style={{ position: "relative", backgroundColor: activeId === template.id ? "#efefef" : "" }} onMouseEnter={() => { setActiveTemplate(template.id) }} onClick={handleSelectTemplate}>
            <span>{template.title} <span style={{ visibility: template.id === selectedTemplate ? "visible" : "hidden" }}>✔</span> </span>
            {activeId === template.id && (
                <Card style={{ position: "absolute", right: "105%", top: "50%", transform: "translateY(-50%)", width: `${cardWidth}px`, maxHeight: "200px", overflow: "auto" }} onClick={(e) => { e.stopPropagation(); }}>
                    <Card.Body>
                        <Card.Title contentEditable={isEditing} style={{ textDecoration: isEditing ? "underline" : "none" }} suppressContentEditableWarning ref={titleRef}>{template.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">system</Card.Subtitle>
                        <Card.Text
                            contentEditable={isEditing}
                            style={{ textDecoration: isEditing ? "underline" : "none" }}
                            suppressContentEditableWarning
                            ref={systemRef}>
                            {template.system.length > 0 ? template.system : "NULL"}
                        </Card.Text>
                        <Card.Subtitle className="mb-2 text-muted">message</Card.Subtitle>
                        <Card.Text
                            contentEditable={isEditing}
                            style={{ textDecoration: isEditing ? "underline" : "none" }} suppressContentEditableWarning
                            ref={messageRef}>
                            {template.message.length > 0 ? template.message : "NULL"}
                        </Card.Text>
                        <Button onClick={handleEdit} variant="outline-secondary" size="sm">{isEditing ? "Save" : "Edit"}</Button>{' '}
                        <Button onClick={handleDelete} variant="outline-secondary" size="sm">Delete</Button>{' '}
                    </Card.Body>
                </Card>
            )}

        </ListGroup.Item >
    )
}

export default Template;