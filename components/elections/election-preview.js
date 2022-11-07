import Link from 'next/link';
import styles from './election-preview.module.css';

export default function ElectionPreview({election}) {
	const getElectionStatus = () => {
		let status = 'Upcoming';
		const { voting, registration } = election;
		let { start, end } = registration;
		console.log(start, end);
		const current = new Date();
		if (new Date(start) < current) {
			status = 'Registration ongoing';
			if (new Date(end) < current) {
				status = 'Registration ended';
				let { start, end } = voting;
				console.log(start, end);
				if (new Date(start) < current) {
					status = 'Voting ongoing';
					if (new Date(end) < current) {
						status = 'Ended';
					}
				}
			}
		}
		return status;
	};
	const status = getElectionStatus();
	return (
		<Link href={`/elections/${election._id}`}>
			<div className={styles.container}>
				<p className={styles.title}>{election.name}</p>
				<span className={styles.banner}>{status}</span>
			</div>
		</Link>
	);
}
