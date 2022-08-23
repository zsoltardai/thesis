import styles from './control.module.css';

export default function Control({
	children
}) {
	return (
		<div className={styles.control}>
			{children}
		</div>
	);
}
