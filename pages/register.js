import {useContext, useRef} from 'react';
import NotificationContext from '../store/notification-context';
import { useRouter } from 'next/router';
import { getSession } from '../lib/auth/server';
import Link from 'next/link';
import Input from '../components/user-interface/input';
import Pen from '../components/icons/pen';
import IdentityCard from '../components/icons/identity-card';
import Mail from '../components/icons/mail';
import Key from '../components/icons/key';
import Secret from '../components/icons/secret';
import Button from '../components/user-interface/button';
import RSA from '../lib/encryption/rsa';
import md5 from 'md5';
import styles from '../styles/register.module.css';

export default function Register() {
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const firstNameRef = useRef();
	const lastNameRef = useRef();
	const emailRef = useRef();
	const identityNumberRef = useRef();
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const postalCodeRef = useRef();
	const registrationCodeRef = useRef();
	const validateForm = (firstName, lastName, identityNumber, email, postalCode, password, confirmPassword) => {
		if (!(/[A-ZÁÉ][a-záé]{2,}/).test(firstName)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided first name is invalid!'
			);
			return false;
		}

		if (!(/[A-ZÁÉ][a-záé]{2,}/).test(lastName)) {
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

		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided e-mail address is invalid!'
			);
			return false;
		}

		if (!(/^[0-9]{4}$/).test(postalCode)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided postal code is invalid!'
			);
			return false;
		}

		if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).test(password)) {
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

		const password = passwordRef.current.value;
		const confirmPassword = confirmPasswordRef.current.value;
		const email = emailRef.current.value;
		const identityNumber = identityNumberRef.current.value;
		const firstName = firstNameRef.current.value;
		const lastName = lastNameRef.current.value;
		const registrationCode = registrationCodeRef.current.value;
		const postalCode = postalCodeRef.current.value;

		if (!validateForm(firstName, lastName, identityNumber, email, postalCode, password, confirmPassword)) return;

		const keys = new RSA();
		const encryptedPrivateKeyPem = keys.getPrivateKeyPem(password);
		const encryptedIdentityNumber = keys.encrypt(identityNumber);
		const encryptedEmail = keys.encrypt(email);
		const encryptedFirstName = keys.encrypt(firstName);
		const encryptedLastName = keys.encrypt(lastName);
		const passwordHash = md5(password);
		const registrationCodeHash = md5(registrationCode);

		notificationCtx.set(
			'pending',
			'Pending',
			'Your registration request have been sent!'
		);

		passwordRef.current.value = '';
		confirmPasswordRef.current.value = '';
		registrationCodeRef.current.value = '';

		const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
		const body = JSON.stringify({
			identityNumber: identityNumber,
			encryptedIdentityNumber: encryptedIdentityNumber,
			email: email,
			encryptedEmail: encryptedEmail,
			encryptedFirstName: encryptedFirstName,
			encryptedLastName: encryptedLastName,
			encryptedPrivateKeyPem: encryptedPrivateKeyPem,
			passwordHash: passwordHash,
			registrationCodeHash: registrationCodeHash,
			postalCode: postalCode
		});
		const response = await fetch('/api/v1/auth/register', {
			method: 'POST',
			headers: headers,
			body: body
		});
		const message = await response.text();
		if (!response.ok) {
			notificationCtx.set(
				'error', 
				'Error',
				message
			);
			return;
		}
		notificationCtx.set(
			'success', 
			'Success',
			message
		);
		await router.replace('/login');
	};
	return (
		<form className={styles.form} onSubmit={submitHandler}>
			<h2>Registration</h2>
			<div className={styles.grid}>
				<Input id='firstName' label='Firstname' innerRef={firstNameRef} icon={<Pen />} placeholder='e.g. Jon' />
				<Input id='lastName' label='Lastname' innerRef={lastNameRef} icon={<Pen />} placeholder='e.g. Johnson' />
				<Input id='identityNumber' label='Identity number' innerRef={identityNumberRef} icon={<IdentityCard />}
								 placeholder='e.g. 123456AA' />
				<Input id='email' label='E-mail' innerRef={emailRef} icon={<Mail />} placeholder='e.g. example@email.com' />
				<Input id='postalCode' label='Postal code' type='text' innerRef={postalCodeRef} icon={<Mail />}
							 placeholder='e.g. 4300' />
				<Input id='password' label='Password' innerRef={passwordRef} icon={<Key />} type='password'
								 placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
				<Input id='confirmPassword' label='Confirm password' innerRef={confirmPasswordRef} type='password'
								 icon={<Key />} placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
				<Input id='registrationCode' label='Code' innerRef={registrationCodeRef} type='password'
								 icon={<Secret />} placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
				<Helper />
				<Button>Register</Button>
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

export async function getServerSideProps(context) {
	const { req, res } = context;
	const session = await getSession({ req, res });
	if (!session) return { props: {} };
	return { redirect: { destination: '/', permanent: false } };
}
