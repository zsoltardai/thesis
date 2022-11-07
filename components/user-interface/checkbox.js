import React from 'react';
import * as crypto from 'crypto';
import styles from './checkbox.module.css';

const Checkbox = ({
	id = '',
	label,
	group,
	value,
	checked,
	setChecked
}) => {
	id = id === '' && label
		? label.toLocaleString().replaceAll(' ', '')
		: crypto.randomBytes(16).toString('base64');
	return (
		<label htmlFor={id} className={styles.container}>
			{label}
			<input
				id={id}
				type='checkbox'
				name={group}
				checked={checked === value}
				onChange={() => setChecked(value)}
			/>
			<span className={styles.checkmark}></span>
		</label>
	);
}

export default Checkbox;
