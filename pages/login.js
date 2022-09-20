import { useContext, useRef } from 'react';
import NotificationContext from '../store/notification-context';
import SessionContext from '../store/session-context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSession } from '../lib/auth/server';
import Mail from '../components/icons/mail';
import Key from '../components/icons/key';
import Input from '../components/user-interface/input';
import Button from '../components/user-interface/button';
import styles from '../styles/login.module.css';
import Image from 'next/image';

export default function Login() {
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const sessionContext = useContext(SessionContext);
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

		await sessionContext.login(email, password, async (error, message) => {
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
				<Image src='/images/auth.svg' alt='auth' height={600} width={400} layout='responsive' />
			</div>
			<div className={styles.right}>
				<form onSubmit={submitHandler}>
					<h2>Login</h2>
					<Input id='email' icon={<Mail />} label='E-mail' innerRef={emailRef} type='text'
								 placeholder='e.g. example@email.com' />
					<Input id='password' icon={<Key />} label='Password' innerRef={passwordRef} type='password'
								 placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
					<Button>Login</Button>
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
