import { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState({ _id: '', username: '' });
    const [conversationId, setConversationId] = useState('NEW');
    const [windowState, setWindowState] = useState('large');

    return (
        <AppContext.Provider value={{ user, setUser, conversationId, setConversationId, windowState, setWindowState }}>
            {children}
        </AppContext.Provider>
    );
}
