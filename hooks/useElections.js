import { useEffect, useState } from 'react';
import electionApi from '../api/elections';

const useElections = () => {
	const [loading, setLoading] = useState(true);
	const [elections, setElections] = useState(null);
	const [error, setError] = useState(null);

	const getElections = async () => {
		setLoading(true);
		const res = await electionApi.getElections();
		if (res.ok) {
			setElections(res.data);
			setLoading(false);
			return;
		}
		setError(res.data);
		setLoading(false);
	};

	useEffect(() => {
		getElections()
	}, []);

	return {
		elections,
		loading,
		error,
		getElections
	};
}

export default useElections;
