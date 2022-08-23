import styles from './checkbox.module.css';

export default function Checkbox({ 
	id = '',
	label,
	checked = false
}) {
	id = (id === '') ? label
		.replace(/[^a-zA-Z ]/g, '')
		.replaceAll(' ', '-')
		.toLowerCase() : id;
	return (
		<label htmlFor={id} className={styles.container}>
			{label}
			<input id={id} type='checkbox' checked={checked} />
			<span className={styles.checkmark}></span>
		</label>
	);
}
