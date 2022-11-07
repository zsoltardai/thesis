import React, { useContext } from 'react';
import SessionContext from '../store/session-context';

export default function useAuth() {
	const sessionCtx = useContext(SessionContext);
	return {
		session: sessionCtx.session,
		login: sessionCtx.login,
		logout: sessionCtx.logout
	};
}
