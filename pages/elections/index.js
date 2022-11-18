import { ElectionPreview as Preview }from '../../components/elections';
import { LoadingSpinner as Spinner } from '../../components/layout';
import { useElections, useNotification } from '../../hooks';
import styles from '../../styles/elections.module.css';

export default function Elections() {
	const { elections, error, loading, getElections } = useElections();
	const { setNotification } = useNotification();
	if (loading) return <Spinner />;
	if (error) {
		setNotification(
			'error',
			'Error',
			error
		);
		return (
			<>
				{error}
			</>
		);
	}
	return (
		<div className={styles.container}>
			{elections.map(election => (
				<Preview
					key={election._id}
					election={election}
				/>)
			)}
		</div>
	);
}

/*<Button
	title="Refresh"
	onClick={() => getElections()}
/>*/
