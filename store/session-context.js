import { createContext, useEffect, useState } from 'react';
import { signIn, signOut } from '../lib/auth/client';

const SessionContext = createContext({
	session: null,
	logout: () => {},
	login: (email, passwordHash) => {},
	update: () => {}
});

export function SessionContextProvider({ children }) {

	const [session, setSession] = useState(null);

	useEffect( () => {
		getSessionHandler().then(_session => setSession(_session));
	}, []);

	const getSessionHandler = async () => {
		const response = await fetch('/api/auth/session', { 
			method: 'GET'
		});
		if (!response.ok) return null;
		const data = await response.json();
		const { session } = data;
		return session;
	};

	const logoutHandler = () => {
		const result = signOut();
		if (!result) return false;
		setSession(null);
		return true;
	};

	const loginHandler = async (email, passwordHash) => {
		return (async () => {
			return new Promise( (resolve, reject) => {
				signIn(email, passwordHash, async (error, result) => {
					if (error) reject(error);
					const _session = await getSessionHandler();
					setSession(_session);
					resolve(result);
				});
			});
		})();
	};

	const updateHandler = () => {
		getSessionHandler()
			.then(_session => {
				setSession(_session)
			});
	};

	const context = {
		session: session,
		logout: logoutHandler,
		login: loginHandler,
		update: updateHandler
	};

	return (
		<SessionContext.Provider value={context}>
			{children}
		</SessionContext.Provider>
	);
}

export default SessionContext;
