import { useContext } from 'react';
import { default as Session } from '../store/session-context';

export default function useSession() {
	const ctx = useContext(Session);
	return {
		session: ctx.session,
		loading: ctx.loading
	};
}
