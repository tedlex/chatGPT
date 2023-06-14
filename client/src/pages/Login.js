import React from 'react';
import Container from 'react-bootstrap/Container';

import LoginForm from '../components/user/loginForm';
import TopBar from '../components/topBar';

const Login = () => {
    return (
        <>
            <TopBar />
            <Container className='mt-5 pt-5'>
                <h1>Login</h1>
                <LoginForm />
            </Container>
        </>
    )
};

export default Login;