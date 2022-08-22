import { createContext, useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { signIn, signOut } from '../lib/auth/client';

const SessionContext = createContext({
    session: null,
    logout: () => {},
    login: (email, passwordHash) => {},
    getLatestSession: () => {}
});

export function SessionContextProvider({ children }) {

    const [session, setSession] = useState(null);

    useEffect( () => {
        getSessionHandler().then(_session => setSession(_session));
    }, []);

    const getSessionHandler = async () => {
        const response = await fetch('/api/auth/session', { method: 'GET' })
        if (!response.ok) return null;
        const data = await response.json();
        return data.session;
    };

    const logoutHandler = () => {
        const result = signOut();
        if (!result) return false;
        setSession(null);
        return true;
    };

    const loginHandler = async (email, passwordHash) => {
        const result = await signIn(email, passwordHash);
        if (!result) return false;
        getSessionHandler().then(_session => setSession(_session));
        return true;
    };

    const getLatestSessionHandler = async () => {
        await getSessionHandler();
    };

    const context = {
        session: session,
        logout: logoutHandler,
        login: loginHandler,
        getLatestSession: getLatestSessionHandler
    };

    return (
        <SessionContext.Provider value={context}>
            {children}
        </SessionContext.Provider>
    );
}

export default SessionContext;
