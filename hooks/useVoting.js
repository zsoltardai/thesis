import { useState } from 'react';
import votingApi from '../api/votes';

const useVoting = () => {
	const [vote, setVote] = useState(null);
	const [loading, setLoading] = useState(true);

	const getVote = async ({electionid, publickeyhash}) => {
		setLoading(true);
		const res = await votingApi.getVote({electionid, publickeyhash});
		if (res.ok) {
			setVote(res.data);
			setLoading(false);
			return;
		}
		setVote(null);
		setLoading(false);
	}

	const cast = async ({ electionid, body }) => {
		setLoading(true);
		const res = await votingApi.vote({ electionid, body });
		if (res.ok) {
			setVote(res.data);
			setLoading(false);
			return;
		}
		setVote(null);
		setLoading(false);
	}

	return {
		vote,
		loading,
		getVote,
		cast
	};
}

export default useVoting;
