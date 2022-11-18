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
						setStatus('voting ended');
						return;
					}
					setStatus('voting ongoing');
					return;
				}
				setStatus('registration ended');
				return;
			}
			setStatus('registration ongoing');
			return;
		}
		setStatus('upcoming');
	};
	useEffect(() => {
		getElectionStatus();
	}, []);
	return (
		<Link href={`/elections/${election._id}`}>
			<div className={styles.container}>
				<p className={styles.title}>{election.name}</p>
				<span className={`
					${styles.banner}
					${status === 'voting ongoing' && styles.ongoing}
					${status === 'registration ongoing' && styles.registration}
				`}>
					{status}
				</span>
			</div>
		</Link>
	);
}
