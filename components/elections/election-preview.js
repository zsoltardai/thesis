import Link from 'next/link';
import styles from './election-preview.module.css';
import {useEffect, useState} from 'react';

export default function ElectionPreview({election}) {
	const [status, setStatus] = useState(null);
	const getElectionStatus = () => {
		const { voting, registration } = election;
		let { start, end } = registration;
		const current = new Date();
		if (new Date(start) < current) {
			if (new Date(end) < current) {
				let { start, end } = voting;
				if (new Date(start) < current) {
					if (new Date(end) < current) {
						setStatus('Ended');
						return;
					}
					setStatus('Voting ongoing');
					return;
				}
				setStatus('Registration ended');
				return;
			}
			setStatus('Registration ongoing');
			return;
		}
		setStatus('Upcoming');
	};
	useEffect(() => {
		getElectionStatus();
	}, []);
	return (
		<Link href={`/elections/${election._id}`}>
			<div className={styles.container}>
				<p className={styles.title}>{election.name}</p>
				<span className={styles.banner}>{status}</span>
			</div>
		</Link>
	);
}
