import React from 'react';
import { useState, useRef, useEffect } from 'react'
import mongoObjectId from '../../utils/mongoObjectId';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import SystemText from './systemText';
import ListGroup from 'react-bootstrap/ListGroup';
import Template from './template';

function SystemGroup({ templates, setTemplates, selectedTemplate, setSelectedTemplate }) {
    const [show, setShow] = useState(false)

    const [activeTemplate, setActiveTemplate] = useState(1)
    const [cardWidth, setCardWidth] = useState(0)

    const inputGroupRef = useRef(null);
    const listGroupRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (listGroupRef.current && !listGroupRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
                setShow(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [listGroupRef]);

    const handleClick = () => {
        setShow(!show)
        if (inputGroupRef.current) {
            const windowWidth = window.innerWidth;
            const factor = windowWidth < 500 ? 0.6 : 0.7;
            setCardWidth(inputGroupRef.current.offsetWidth * factor);
        }
    }

    const clickNew = () => {
        const newid = mongoObjectId();
        setTemplates([...templates, { id: newid, title: "Untitled", system: "You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.", message: "" }])
        setActiveTemplate(newid)
    }

    return (
        <InputGroup style={{ position: "relative" }} ref={inputGroupRef}>

            <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "solid 1px #dee2e6" }}>Template</InputGroup.Text>
            <SystemText templates={templates} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
            {show && (
                <div style={{ position: "absolute", right: "0", top: "105%" }}>
                    <ListGroup ref={listGroupRef}>
                        {templates.map((t) => {
                            return (<Template template={t} key={t.id} activeId={activeTemplate} setActiveTemplate={setActiveTemplate} cardWidth={cardWidth} setTemplates={setTemplates} templates={templates} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
                                setShow={setShow}
                            />)
                        })}
                        <ListGroup.Item onClick={clickNew} style={{ textAlign: "center", color: "grey" }}> ㊉ </ListGroup.Item>
                    </ListGroup>
                </div>
            )}
            <Button
                variant="outline-secondary"
                ref={buttonRef} onClick={(e) => { e.preventDefault(); handleClick(); }}
            ><Dropdown.Toggle split as='span' variant="success" id="dropdown-split-basic" /></Button>


        </InputGroup>
    )
}




export default SystemGroup;
