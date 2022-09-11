import LoadingSpinner from '../../components/layout/loading-spinner';
import NotificationContext from '../../store/notification-context';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';

export default function Election() {
	const notificationCtx = useContext(NotificationContext);
	const [election, setElection] = useState(null);
	const { slug } = useRouter().query;
	useEffect(() =>{
		(async () => {
			if (!slug) return;
			const headers = { Accept: 'application/json' };
			const response = await fetch('/api/v1/elections/' + slug, {
				method: 'GET',
				headers
			});
			if (response.ok) {
				const election = await response.json();
				setElection(election);
				return;
			}
			const message = await response.text();
			notificationCtx.set(
				'error',
				'Error',
				message
			);
		})();
	}, [notificationCtx, slug])
	if (!election) return <LoadingSpinner />
	return (
		<>
			<h1>{election.name}</h1>
			<h2>Party lists</h2>
			{
				election.partyLists.map(partyList =>
				{
					return <p key={partyList._id}>{ partyList.name }</p>;
				})
			}
			<h2>Districts</h2>
			<h2>Candidates</h2>
		</>
	);
}
