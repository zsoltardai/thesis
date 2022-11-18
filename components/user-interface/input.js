import React, {useState, forwardRef, createRef} from 'react';
import Visible from '../icons/visible';
import Invisible from '../icons/invisible';
import styles from './input.module.css';

const Input = ({ type = 'text', Icon = null, ...props}, ref) => {
	const [visible, setVisible] = useState(false);
	const inputRef = ref || createRef();
	const [focused, setFocused] = useState(false);
	const toggleVisibility = () => setVisible(!visible);
	return (
		<>
			<div className={`${styles.input} ${focused ? styles.focused : ''}`}
					 style={{gridTemplateColumns: `${ Icon ? '1fr 9fr' : '1fr' }` }}>
				{Icon && <div className={styles.icon}>
					<Icon />
				</div>}
				<div className={`${ (type === 'password') ? styles.hasVisibility : styles.hasNotVisibility }`}>
					<input
						placeholder={type === 'password' && '\u2022'.repeat(10)}
						type={(type === 'password') ? visible ? 'text' : 'password' : type}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						ref={inputRef}
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
			</div>
		</>
	);
}

export default forwardRef(Input);

function Visibility({
	visible,
	toggleVisibility
}) {
	return (
		<span
			className={styles.visibility}
			style={{ cursor: 'pointer' }}
			onClick={toggleVisibility}
		>
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
