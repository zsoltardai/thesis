import React, {useEffect, useState} from 'react';
import {useSession} from './index';

export default function useCandidates(electionId) {
	const [candidates, setCandidates] = useState([]);
	const [partyLists, setPartyLists] = useState([]);
	const [loading, setLoading] = useState(true);
	const { session } = useSession();
	const getCandidates = async (postalCode) => {
		const url = `/api/v1/elections/${electionId}/findmycandidates/${postalCode}`;
		setLoading(true);
		const response = await fetch(url);
		const { candidates, partyLists } = await response.json();
		setCandidates(candidates);
		setPartyLists(partyLists);
		setLoading(false);
	};
	useEffect(() => {
		if (session) {
			const postalCode = session.user.postalCode;
			getCandidates(postalCode);
		}
	}, [session]);
	return { candidates, partyLists, loading, getCandidates };
}
