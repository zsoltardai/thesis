import { useState, useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Link from 'next/link';
import Mail from '../icons/mail';
import Pen from '../icons/pen';
import Key from '../icons/key';
import IdentityCard from '../icons/identity-card';
import Input from '../user-interface/input';
import Button from '../user-interface/button';
import Control from '../user-interface/control';
import RSA from '../../lib/encryption/rsa-util';
import md5 from 'md5';
import styles from './registration-form.module.css';

export default function RegistrationForm({ onRegister }) {
	const notificationCtx = useContext(NotificationContext);
	const [identityNumber, setIdentityNumber] = useState('');
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const validateForm = () => {
		if (!(/[A-ZÁÉ][a-záé]{2,}/)
			.test(firstName)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided first name is invalid!'
			);
			return false;
		}

		if (!(/[A-ZÁÉ][a-záé]{2,}/)
			.test(lastName)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided first name is invalid!'
			);
			return false;
		}

		if (!(/^[0-9]{6}[A-Z]{2}$/).test(identityNumber)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided identity number is invalid!'
			);
			return false;
		}

		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided e-mail address is invalid!'
			);
			return false;
		}

		if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
			.test(password)) {
			notificationCtx.set(
				'error',
				'Error', 
				'The provided password is invalid!'
			);
			return false;
		}

		if (password !== confirmPassword) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided passwords did not match!'
			);
			return false;
		}

		return true;
	};
	const submitHandler = async (event) => {
		event.preventDefault();

		if (!validateForm()) return;

		const keys = new RSA();
		const encryptedPrivateKeyPem = keys.getPrivateKeyPem(password);
		const encryptedIdentityNumber = keys.encrypt(identityNumber);
		const encryptedEmail = keys.encrypt(email);
		const encryptedFirstName = keys.encrypt(firstName);
		const encryptedLastName = keys.encrypt(lastName);
		const passwordHash = md5(password);

		notificationCtx.set(
			'pending',
			'Pending',
			'Your registration request has been sent!'
		);

		await onRegister(
			identityNumber,
			encryptedIdentityNumber,
			email,
			encryptedEmail,
			encryptedFirstName,
			encryptedLastName,
			encryptedPrivateKeyPem, 
			passwordHash
		);
	};
	return (
		<form className={styles.form} onSubmit={submitHandler}>
			<h2>Registration</h2>
			<div className={styles.grid}>
				<Control>
					<label htmlFor='firstName'>First name</label>
					<Input id='firstName' get={setFirstName} set={firstName} icon={<Pen />}
										 placeholder='e.g. Jon' />
				</Control>
				<Control>
					<label htmlFor='lastName'>Last name</label>
					<Input id='lastName' get={setLastName} set={lastName} icon={<Pen />}
										 placeholder='e.g. Johnson' />
				</Control>
				<Control>
					<label htmlFor='identityNumber'>Identity number</label>
					<Input id='identityNumber' get={setIdentityNumber} set={identityNumber}
						icon={<IdentityCard />} placeholder='e.g. 123456AA' />
				</Control>
				<Control>
					<label htmlFor='email'>E-mail</label>
					<Input id='email' get={setEmail} set={email} icon={<Mail />}
										 placeholder='e.g. example@email.com' />
				</Control>
				<Control>
					<label htmlFor='password'>Password</label>
					<Input id='password' get={setPassword} set={password} icon={<Key />} type='password'
						placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
				</Control>
				<Control>
					<label htmlFor='confirmPassword'>Confirm password</label>
					<Input id='confirmPassword' get={setConfirmPassword} set={confirmPassword} type='password'
									 icon={<Key />} placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
				</Control>
				<Helper />
				<Button>
							Register
				</Button>
				<Question />
			</div>
		</form>
	);
}

function Helper() {
	return (
		<small className={styles.helper}>
			<ul>
				<li>Must be at least 8 characters long</li>
				<li>Must contain small and capital letters [A-z]</li>
				<li>Must contain numbers [0-9]</li>
				<li>Must contain special characters [@^+!]</li>
			</ul>
		</small>
	);
}


function Question() {
	return (
		<span className={styles.question}>
				Do you have an account?
				Login &nbsp;
			<Link href='/login'>
					 here.
			</Link>
		</span>
	);
}