import { createContext, useState, useEffect } from 'react';
import { deleteCookie, getCookie } from 'cookies-next';
import sessionApi from '../api/session';
import md5 from 'md5';

const SessionContext = createContext({
	session: null,
	login: async (email, password, callback) => {},
	logout: () => {},
	update: async () => {}
});

export function SessionContextProvider({children}) {

	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() =>{
		(async () => {
			const session = await updateHandler();
			setSession(session);
		})();
	}, []);

	const loginHandler = async (email, password, callback) => {
		const passwordHash = md5(password);
		const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
		const body = JSON.stringify({ email, passwordHash });
		const response = await fetch('/api/v1/auth/login', { method: 'POST',  headers, body });
		const message = await response.text();
		if (!response.ok) { callback(message, null); return false; }
		await updateHandler();
		callback(null, message);
		return true;
	};

	const logoutHandler = () => {
		deleteCookie('auth.token');
		deleteCookie('auth.encrypted-private-key-pem');
		deleteCookie('auth.encrypted-email');
		deleteCookie('auth.encrypted-identity-number');
		deleteCookie('auth.encrypted-first-name');
		deleteCookie('auth.encrypted-last-name');
		deleteCookie('auth.postal-code');
		setSession(null);
		return true;
	};

	const updateHandler = async () => {
		if (!getCookie('auth.token')) return null;
		setLoading(true);
		return new Promise(async (resolve, _) => {
			const headers = { Accept: 'application/json' }; setLoading(true);
			const response = await fetch('/api/v1/auth/session',
				{ method: 'GET', headers});
			if (!response.ok) resolve(null);
			const session = await response.json();
			setSession(session); setLoading(false);
			resolve(session);
		});
	}

	const context = {
		session,
		loading,
		login: loginHandler,
		logout: logoutHandler,
		update: updateHandler
	};

	return (
		<SessionContext.Provider value={context}>
			{children}
		</SessionContext.Provider>
	);
}

export default SessionContext;
