import React, { useState, useEffect, useContext } from 'react';
import NotificationContext from '../store/notification-context';
import useAuth from './useAuth';

export default function useElection(id) {
	const [election, setElection] = useState(null);
	const [loading, setLoading] = useState(true);
	const notificationCtx = useContext(NotificationContext);
	const { session } = useAuth();
	const getCandidatesByPostalCode = async function () {
		console.log(session);
		console.log(election);
	};
	const getPartyLists = async function () {

	};
	useEffect(() =>{
		(async () => {
			if (!id) return;
			const headers = { Accept: 'application/json' };
			const response = await fetch('/api/v1/elections/' + id, {
				method: 'GET',
				headers
			});
			if (response.ok) {
				const election = await response.json();
				setElection(election);
				return setLoading(false);
			}
			const message = await response.text();
			setLoading(false);
			notificationCtx.set(
				'error',
				'Error',
				message
			);
		})();
	}, [notificationCtx, id])
	return { election, loading, getCandidatesByPostalCode };
}
