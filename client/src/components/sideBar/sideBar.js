import React from 'react';
import { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Title from './title';
import './sideBar.css'
import avatar from '../../images/1200px-ChatGPT_logo.svg.png'
import { apiURL } from '../../config';

function SideBar({ conversations, setConversations }) {
    //console.log('render sidebar')
    const { user, setUser, setConversationId, windowState } = useContext(AppContext);
    const historyRef = useRef(null);

    useEffect(() => {
        //console.log('sidebar effect')
        let ignore = false;
        const fetchConversations = async () => {
            try {
                //console.log(`fetch ${apiURL}/api`)
                const res = await fetch(`${apiURL}/api`, { credentials: 'include' });
                const data = await res.json();
                //console.log(data)
                if (!ignore) {
                    setConversations([...data.conversations]);
                    setUser({ _id: data.user._id, username: data.user.username })
                } else {
                    console.log('ignore')
                }

            } catch (error) {
                console.log("Error fetching conversations: ", error);
            }
        };

        fetchConversations();
        return () => { ignore = true; }
    }, [setUser, setConversations]);


    return (
        <div id="sidebar"
            style={{
                position: windowState === "large" ? "relative" : "absolute",
                left: windowState === "small" ? "-200px" : "0"
            }}>
            <span className="d-flex align-items-center px-4 mb-0 me-md-auto text-white mx-auto" style={{ cursor: "pointer" }}
                id="newChat" onClick={() => { setConversationId('NEW') }}>
                <span className="fs-5">+ New Chat</span>
            </span>
            <hr />
            <Nav as="ul" id="historyUl" ref={historyRef} onMouseEnter={() => { historyRef.current.classList.remove('scrolling') }} onMouseLeave={() => { historyRef.current.classList.add('scrolling') }} variant="pills" className="flex-column mb-auto px-1 scrolling" style={{ overflowY: "auto", overflowX: "hidden", flexWrap: "nowrap", paddingBottom: "100px" }}>
                {conversations.map(conv => {
                    return (
                        <Title key={conv._id} cid={conv._id} title={conv.title} conversations={conversations} setConversations={setConversations} />
                    )
                })}
            </Nav>
            <hr />
            {user.username === '' ? (
                <Link to='/login' className="mx-auto text-white px-5 py-1 text-decoration-none">
                    <strong>Log in</strong>
                </Link>
            ) : (
                <UserDropDown user={user} />
            )
            }
        </div>
    )
}

const UserDropDown = function ({ user }) {
    const { setUser } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogOut = async function (event) {
        event.preventDefault();
        const response = await fetch(`${apiURL}/api/logout`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();
        console.log(data)
        if (data.message === 'SUCCESS') {
            setUser({ _id: '', username: '' });
            window.location.reload();
        }
    }

    const handleExport = async function (event) {
        event.preventDefault();
        try {
            const response = await fetch(`${apiURL}/api/conversation/export`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                //console.log(data);
                const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.download = 'chats.json';
                a.href = url;
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.log('export error', error);
        }
    }

    const handleUpload = async function (event) {
        event.preventDefault();
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.click();
        fileInput.onchange = async function (event) {
            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch(`${apiURL}/api/conversation/import`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    window.location.reload();
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.log('upload error', error);
                alert('Upload failed');
            }
        }
    }





    return (
        <Dropdown style={{ cursor: "pointer" }}>
            <Dropdown.Toggle as='a' className='d-flex mx-auto  align-items-center text-white text-decoration-none' id="dropdown-basic">
                <img src={avatar} alt="" width="32" height="32" className="rounded-circle me-2" />
                <strong className='ps-4'>{user.username}</strong>
            </Dropdown.Toggle>
            <Dropdown.Menu className="text-small shadow " variant='dark'>
                <Dropdown.Item as="span" onClick={() => { navigate('/usage') }} style={{ cursor: "pointer" }}>
                    Usage
                </Dropdown.Item>
                <Dropdown.Item href="#" onClick={(e) => { handleExport(e) }} >Export History</Dropdown.Item>
                <Dropdown.Item href="#" onClick={(e) => { handleUpload(e) }} >Recover History</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#" onClick={(e) => { handleLogOut(e) }}>Sign out</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown >
    )
}

export default SideBar;