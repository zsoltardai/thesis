import styles from './loading-spinner.module.css';

export default function LoadingSpinner() {
	return (
		<div className={styles.container}>
			<span></span>
			<span></span>
			<span></span>
		</div>
	);
}
