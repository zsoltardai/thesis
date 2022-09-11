import styles from './timer.module.css';

export default function Timer({
	remaining
}) {
	const minutes = remaining.getMinutes();
	const seconds = remaining.getSeconds();
	const time = `${ minutes }:${ (seconds.toString().length === 1) ? ('0' + seconds) : seconds }`;
	return (
		<div className={styles.container}>
			<p className={`${ styles.content } ${ minutes === 0 && styles.danger }`}>
				{time}
			</p>
		</div>
	);
}
