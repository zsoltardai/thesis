import Link from 'next/link';
import styles from './election-preview.module.css';

export default function ElectionPreview({election}) {
	let status = 'Upcoming';
	return (
		<Link href={`/elections/${election._id}`}>
			<div className={styles.container}>
				<p className={styles.title}>{election.name}</p>
				<span className={styles.banner}>{status}</span>
			</div>
		</Link>
	);
}
