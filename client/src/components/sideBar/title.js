import React from 'react';
import { useContext, useRef, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { apiURL } from '../../config';
import Nav from 'react-bootstrap/Nav';
import './dotsMenu.css'

function Title({ cid, title, conversations, setConversations }) {
    const linkRef = useRef(null)
    const titleRef = useRef(null)
    const dotsRef = useRef(null)
    const dropdownRef = useRef(null)
    const { conversationId, setConversationId } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false)
    const active = conversationId === cid
    const handleMouseEnter = () => {
        dotsRef.current.style.display = 'flex'
        if (!active) {
            linkRef.current.style.backgroundColor = '#292e32'
        }
    };

    useEffect(() => {
        if (isEditing && titleRef.current) {
            const range = document.createRange();
            range.selectNodeContents(titleRef.current);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                dropdownRef.current.style.display = 'none';
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef, isEditing]);

    const handleMouseLeave = () => {
        dotsRef.current.style.display = 'none'
        if (!active) {
            linkRef.current.style.backgroundColor = "#1c1d1f"
        }
    };

    const handleTitleClick = (e) => {
        if (cid !== conversationId && !isEditing) {
            setConversationId(cid)
        }
    }
    const bg = active ? "#0d6efd" : "#1c1d1f"

    const handleDotClick = (e) => {
        e.stopPropagation();
        dropdownRef.current.style.display = 'block'
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        let url = `${apiURL}/api/conversation/delete/${cid}`
        try {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.message === 'success') {
                setConversations(conversations.filter(c => c._id !== cid))
                if (cid === conversationId) {
                    setConversationId('NEW')
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleArchive = async (e) => {
        e.stopPropagation();
        let url = `${apiURL}/api/conversation/archive/${cid}`
        try {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.message === 'success') {
                setConversations(conversations.filter(c => c._id !== cid))
                if (cid === conversationId) {
                    setConversationId('NEW')
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleRename = async (e) => {
        e.stopPropagation();
        setIsEditing(true)
        //linkRef.current.focus();
        dropdownRef.current.style.display = 'none';
    }
    const handleBlur = async () => {
        //console.log('link blur')
        setIsEditing(false)
        let new_title = titleRef.current.innerText;
        //console.log(`new title: ${new_title}`)
        try {
            const response = await fetch(`${apiURL}/api/conversation/title-update/${cid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ new_title }),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.message === 'success') {
                setConversations(conversations.map(c => {
                    if (c._id !== cid) {
                        return c
                    } else {
                        return {
                            ...c,
                            title: new_title
                        }
                    }
                }))
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <li key={cid} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Nav.Link as="span" ref={linkRef} className="text-white px-2" style={{ fontSize: "0.9rem", cursor: "pointer", position: "relative", backgroundColor: bg }} onClick={(e) => { handleTitleClick(e) }} contentEditable={isEditing} suppressContentEditableWarning onBlur={handleBlur} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); linkRef.current.blur(); } }}>
                <span ref={titleRef} >{title}</span>
                <Dots rf={dotsRef} handleClick={(e) => { handleDotClick(e) }} />
                <span className='dots-drop-down-menu' style={{ display: "none" }} ref={dropdownRef}>
                    <div className='dots-drop-down-item' onClick={e => { handleDelete(e) }}>Delete</div>
                    <div className='dots-drop-down-item' onClick={e => { handleArchive(e) }}>Archive</div>
                    <div className='dots-drop-down-item' onClick={e => { handleRename(e) }}>Rename</div>
                </span >
            </Nav.Link >


        </li >
    )
}

function Dots({ rf, handleClick }) {
    return (
        <span ref={rf} onClick={handleClick} style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)", width: "1.5rem", height: "80%", display: 'none', alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "inherit" }}>
            ···
        </span>
    )
}

export default Title;