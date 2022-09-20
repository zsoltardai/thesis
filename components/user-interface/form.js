import Image from 'next/image';
import styles from './form.module.css';

export default function Form({
	children,
	title,
	multiStepForm = false,
	style
}) {
	return (
		<div className={styles.container} style={style}>
			{title ? <h2>{title}</h2> : null}
			{children}
		</div>
	);
}