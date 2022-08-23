import { useState, useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Link from 'next/link';
import md5 from 'md5';
import Mail from '../icons/mail';
import Key from '../icons/key';
import Input from '../user-interface/input';
import Button from '../user-interface/button';
import Control from '../user-interface/control';
import styles from './login-form.module.css';

export default function LoginForm({ onLogin }) {
	const notificationCtx = useContext(NotificationContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const validateForm = () => {
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided e-mail address is invalid!'
			);
			return false;
		}

		if (password.trim() === '') {
			notificationCtx.set(
				'error',
				'Error',
				'The provided password is invalid!'
			);
			return false;
		}
      
		return true;
	};
	const submitHandler = async (event) => {
		event.preventDefault();

		if (!validateForm()) return;

		const passwordHash = md5(password);

		setPassword('');

		notificationCtx.set(
			'pending',
			'Pending',
			'Your login request has been sent!'
		);

		const result = await onLogin(email, passwordHash);

		if (!result) return;

		setEmail('');
	};
	return (
		<form className={styles.form} onSubmit={submitHandler}>
			<h2>Login</h2>
			<Control>
				<label htmlFor='email'>E-mail</label>
				<Input id='email' icon={<Mail />} set={email}
					get={setEmail} type='text' placeholder='e.g. example@email.com' />
			</Control>
			<Control>
				<label htmlFor='password'>Password</label>
				<Input id='password' icon={<Key />} set={password} get={setPassword}
					type='password' placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
			</Control>
			<Button>Login</Button>
			<Question />
		</form>
	);
}

function Question() {
	return (
		<span className={styles.question}>
      Don&apos;t you have an account? Register &nbsp;
			<Link href='/register'>
        here.
			</Link>
		</span>
	);
}
