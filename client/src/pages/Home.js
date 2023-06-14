import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';


import '../App.css';
import SideBar from '../components/sideBar/sideBar'
import TopBar from '../components/topBar'

import Chat from '../components/scrollDiv/chat';

const Home = () => {
    const [conversations, setConversations] = useState([]);
    const { windowState, setWindowState, conversationId } = useContext(AppContext)
    const overlayRef = useRef(null);

    useEffect(() => {
        const checkWindowSize = () => {
            if (window.innerWidth <= 600) {
                setWindowState('small');
                overlayRef.current.style.visibility = "hidden";
            } else {
                setWindowState('large');
                overlayRef.current.style.visibility = "hidden";
            }
        };
        checkWindowSize();
        window.addEventListener('resize', checkWindowSize);
        return () => {
            window.removeEventListener('resize', checkWindowSize);
        };
    }, [setWindowState, conversationId]);

    const handleOverlayClick = () => {
        setWindowState("small");
        overlayRef.current.style.opacity = "0";
        setTimeout(() => {
            overlayRef.current.style.visibility = "hidden";
        }, 500);
    }

    return (
        <div className='flexParent'>
            <div className="overlay" ref={overlayRef} style={{ opacity: windowState === "small-sidebar" ? "1" : "0", visibility: "hidden" }} onClick={handleOverlayClick}></div>
            <TopBar overlayRef={overlayRef} responsive={true} />
            <SideBar conversations={conversations} setConversations={setConversations} />
            <Chat conversations={conversations} setConversations={setConversations} />
        </div >
    )
};

export default Home;