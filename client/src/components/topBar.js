import React from 'react';
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { apiURL } from '../config';

function TopBar({ overlayRef, responsive }) {
    const { user, windowState, setWindowState } = useContext(AppContext);
    const navigate = useNavigate();

    const handleClick = () => {
        if (overlayRef && overlayRef.current) {
            overlayRef.current.style.visibility = "visible"
            overlayRef.current.style.opacity = "1"
            if (windowState === 'small') {
                setWindowState('small-sidebar')
            } else if (windowState === 'small-sidebar') {
                setWindowState('small')
            }
        }
    }

    const handleLogOut = async function (event) {
        event.preventDefault();
        const response = await fetch(`${apiURL}/api/logout`, {
            method: 'GET',
            credentials: 'include'
        })

        const data = await response.json();
        //console.log(data)
        if (data.message === 'SUCCESS') {
            window.location.reload();
            //navigate('/')
        }
    }
    let display = "flex"
    if (responsive) {
        display = windowState === "large" ? "none" : "flex"
    }
    return (
        <Navbar bg="light" fixed="top" style={{ display: display, zIndex: "100" }}>
            <Container fluid>
                {responsive ? <Navbar.Brand onClick={handleClick}>History</Navbar.Brand> : <Navbar.Brand onClick={() => { navigate('/'); }} style={{ cursor: "pointer" }}>Home</Navbar.Brand>}


                <Nav className="ms-auto">
                    {user.username === '' ? (<>
                        <Nav.Link as='span'>
                            <Link to='/register' style={{ textDecoration: "none", color: "#000000a6" }}>
                                Register
                            </Link>
                        </Nav.Link>
                        <Nav.Link as='span'>
                            <Link to='/login' style={{ textDecoration: "none", color: "#000000a6" }}>
                                Log in
                            </Link>
                        </Nav.Link>
                    </>
                    ) : (
                        <>
                            <Nav.Link as="span" style={{ color: "#0000004d" }}>
                                {user.username}
                            </Nav.Link>
                            <Nav.Link as="span" style={{ color: "#000000a6", cursor: "pointer" }} onClick={(e) => { handleLogOut(e) }}>
                                Log out
                            </Nav.Link>
                        </>
                    )}
                </Nav>
            </Container>
        </Navbar >
    );
}

export default TopBar;