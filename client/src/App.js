import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppContextProvider } from './contexts/AppContext';

import './App.css';

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Usage from './pages/Usage'

const App = () => {

  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/usage' element={<Usage />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  )
};

export default App;
