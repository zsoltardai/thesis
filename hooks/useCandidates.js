import { useEffect, useState } from 'react';
import candidatesApi from '../api/candidates';
import {useElection} from './index';

export default function useCandidates({ electionid, postalcode }) {
	const [candidates, setCandidates] = useState([]);
	const [partyLists, setPartyLists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const getCandidates = async () => {
		setLoading(true);
		const res = await candidatesApi.getCandidates({
			electionid,
			postalcode
		});
		if (res.ok) {
			const { candidates, partyLists } = res.data;
			setCandidates(candidates);
			setPartyLists(partyLists);
			setLoading(false);
			return;
		}
		setError(res.data);
		setLoading(false);
	};

	useEffect(() => {
		if (electionid && postalcode) {
			getCandidates();
		}
	}, [electionid, postalcode]);

	return {
		candidates,
		partyLists,
		error,
		loading,
		getCandidates
	};
}
