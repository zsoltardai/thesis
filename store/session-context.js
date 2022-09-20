import { createContext, useState, useEffect } from 'react';
import { deleteCookie, getCookie } from 'cookies-next';
import md5 from 'md5';

const SessionContext = createContext({
	session: null,
	login: async (email, password, callback) => {},
	logout: () => {},
	update: async () => {}
});

export function SessionContextProvider({children}) {

	const [session, setSession] = useState(null);

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
		updateHandler().then(session  => setSession(session));
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
		setSession(null);
		return true;
	};

	const updateHandler = async () => {
		if (!getCookie('auth.token')) return null;
		return new Promise(async (resolve, _) => {
			const headers = { Accept: 'application/json' };
			const response = await fetch('/api/v1/auth/session',
				{ method: 'GET', headers});
			if (!response.ok) resolve(null);
			const session = await response.json();
			resolve(session);
		});
	}

	const context = {
		session: session,
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
