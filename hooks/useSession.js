import React, { useContext } from 'react';
import SessionContext from '../store/session-context';

export default function useSession() {
	const sessionCtx = useContext(SessionContext);
	return { session: sessionCtx.session, loading: sessionCtx.loading };
}
