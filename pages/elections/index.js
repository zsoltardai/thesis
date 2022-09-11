import LoadingSpinner from '../../components/layout/loading-spinner';
import ElectionPreview from '../../components/elections/election-preview';
import NotificationContext from '../../store/notification-context';
import { useEffect, useState, useContext } from 'react';
import styles from '../../styles/elections.module.css';

export default function Elections() {
	const notificationCtx = useContext(NotificationContext);
	const [elections, setElections] = useState(null);
	useEffect(() => {
		(async () => {
			const headers = { Accept: 'application/json' };
			const response = await fetch('/api/v1/elections', {
				method: 'GET',
				headers
			});
			if (response.ok) {
				const elections = await response.json();
				setElections(elections);
				return;
			}
			const message = await response.text();
			notificationCtx.set(
				'error',
				'Error',
				message
			);
		})();
	}, [
		notificationCtx
	]);
	if (!elections) return <LoadingSpinner />
	return (
		<div className={styles.container}>
			{ elections.map(election => <ElectionPreview key={election._id} election={election} />) }
		</div>
	);
}
