import React from 'react';
import Container from 'react-bootstrap/Container';

import RegisterForm from '../components/user/registerForm';
import TopBar from '../components/topBar';

const Register = () => {
    return (
        <>
            <TopBar />
            <Container className='mt-5 pt-5'>
                <h1>Register</h1>
                <RegisterForm />
            </Container>
        </>
    )
};

export default Register;