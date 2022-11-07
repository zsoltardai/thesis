import React, { useContext, useRef } from 'react';
import NotificationContext from '../store/notification-context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Key } from '../components/icons';
import { Input, Button, Label } from '../components/user-interface';
import Image from 'next/image';
import { useAuth } from '../hooks';
import { getSession } from '../lib/auth/server';
import styles from '../styles/login.module.css';

export default function Login() {
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const { login } = useAuth();
	const emailRef = useRef();
	const passwordRef = useRef();
	const validateForm = (email, password) => {
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
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
		const email = emailRef.current.value;
		const password = passwordRef.current.value;
		if (!validateForm(email, password)) return;
		passwordRef.current.value = '';
		notificationCtx.set(
			'pending',
			'Pending',
			'Your login request has been sent!'
		);
		await login(email, password, async (error, message) => {
			if (!error) {
				notificationCtx.set(
					'success',
					'Success',
					message
				);
				await router.replace('/');
				return;
			}
			notificationCtx.set(
				'error',
				'Error',
				error
			);
		});
	};
	return (
		<div className={styles.container}>
			<div className={styles.left}>
				<Image
					src='/images/auth.svg'
					layout='responsive'
					height={600}
					width={400}
					alt='auth'
				/>
			</div>
			<div className={styles.right}>
				<form onSubmit={submitHandler}>
					<h2>Login</h2>
					<Label
						title="E-mail"
						id="email"
					/>
					<Input
						id='email'
						Icon={Mail}
						ref={emailRef}
						type='text'
						placeholder='e.g. example@email.com'
					/>
					<Label
						title="Password"
						id="password"
					/>
					<Input
						id='password'
						Icon={Key}
						ref={passwordRef}
						type='password'
					 	placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
					/>
					<Button
						title='Login'
					/>
					<Question />
				</form>
			</div>
		</div>
	);
}

function Question() {
	return (
		<span>
      Don&apos;t you have an account? Register &nbsp;
			<Link href='/register'>
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
