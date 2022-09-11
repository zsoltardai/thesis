import { useState } from 'react';
import Visible from '../icons/visible';
import Invisible from '../icons/invisible';
import Control from './control';
import styles from './input.module.css';

export default function Input({
	id,
	type = 'text',
	icon = null,
	innerRef = null,
	label,
	...props
}) {
	const [visible, setVisible] = useState(false);
	const toggleVisibility = () => setVisible(!visible);
	return (
		<Control>
			{(label) ? <label htmlFor={id}>{label}</label> : ''}
			<span className={styles.input} style={{ gridTemplateColumns: `${ icon ? '1fr 9fr' : '1fr' }` }}>
				<div className={styles.icon}>
					{ icon }
				</div>
				<div className={`${ (type === 'password') ? styles.hasVisibility : styles.hasNotVisibility }`}>
					<input
						id={id}
						type={(type === 'password') ? visible ? 'text' : 'password' : type}
						ref={innerRef}
						{...props}
					/>
					{
						(type === 'password')
						&&
						<Visibility
							visible={visible}
							toggleVisibility={toggleVisibility}
						/>
					}
				</div>
			</span>
		</Control>

	);
}

function Visibility({
	visible,
	toggleVisibility
}) {
	return (
		<span className={styles.visibility} onClick={toggleVisibility}>
			{
				  visible
					  ?
					<Invisible
						height={20}
						width={20}
					/>
					:
					<Visible
						height={20}
						width={20}
					/>
			}
		</span>
	);
}
