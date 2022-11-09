import { useContext } from 'react';
import { default as Session } from '../store/session-context';

export default function useAuth() {
	const ctx = useContext(Session);

	return {
		session: ctx.session,
		login: ctx.login,
		logout: ctx.logout
	};
}
