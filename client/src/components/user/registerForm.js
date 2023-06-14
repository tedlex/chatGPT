import React from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { apiURL } from '../../config';

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AppContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        //console.log(`Username : ${username}\nPassword: ${password}`)
        const response = await fetch(`${apiURL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const data = await response.json();
        //console.log(data)
        if (data.message === 'SUCCESS') {
            setUser({ _id: data.user._id, username: data.user.username })
            navigate('/');
        } else {
            setFeedback(data.content)
        }
    }

    return (
        <Form onSubmit={(e) => { handleSubmit(e) }}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
            </Form.Group>
            <div style={{ color: "red", marginBottom: "2rem" }}>{feedback}</div>
            <Button variant="success" type="submit">
                Login
            </Button>
        </Form>
    )
}

export default RegisterForm;