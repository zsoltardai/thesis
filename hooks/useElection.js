import { useState, useEffect } from 'react';
import electionsApi from '../api/elections';

export default function useElection(id) {
	const [election, setElection] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const getElection = async () => {
		setLoading(true);
		const res = await electionsApi.getElection(id);
		if (res.ok) {
			setElection(res.data);
			setLoading(false);
			return;
		}
		setError(res.data);
		setLoading(false);
	}

	useEffect(() => {
		if (id) {
			getElection(id)
		}
	}, [id]);

	return {
		election,
		loading,
		error,
		getElection
	};
}
