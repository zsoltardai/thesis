import {useState, useContext, useEffect, useRef} from 'react';
import SessionContext from '../store/session-context';
import NotificationContext from '../store/notification-context';
import { useRouter } from 'next/router';
import { Button, Timer, Input, Modal } from '../components/user-interface';
import { Key } from '../components/icons';
import RSA from '../lib/encryption/rsa';
import { EditProfile } from '../components/account';
import { getSession } from '../lib/auth/server';
import md5 from 'md5';

export default function Account() {
	const router = useRouter();
	const sessionCtx = useContext(SessionContext);
	const notificationCtx = useContext(NotificationContext);
	const passwordRef = useRef();
	const [passwordHash, setPasswordHash] = useState('');
	const [rsaKeyPair, setRsaKeyPair] = useState(null);
	const [remaining, setRemaining] = useState(null);
	const [expiresAt, setExpiresAt] = useState(null);
	useEffect(() => {
		if (expiresAt === null) return;
		const interval = setInterval(() => {
			const current = new Date().getTime();
			setRemaining(new Date(expiresAt.getTime() - current));
			if (remaining !== null && (remaining.getMinutes() === 0 && remaining.getSeconds() === 0)) {
				setPasswordHash('');
				setRsaKeyPair(null);
				setRemaining(null)
				setExpiresAt(null);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [remaining, expiresAt]);
	const redirectHandler = () => router.replace('/');
	const submitHandler = () => {
		const { user } = sessionCtx.session;
		let keys; let password = passwordRef.current.value;
		passwordRef.current.value = '';
		try {
			keys = new RSA(user.encryptedPrivateKeyPem.trim(), password);
		} catch (error) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided password was invalid!'
			);
			return;
		}
		notificationCtx.set(
			'success',
			'Success',
			'Now, you can view your personal details.'
		);
		setRsaKeyPair(keys);
		setPasswordHash(md5(password));
		setExpiresAt(new Date(new Date().getTime() + (2 * 60000)));
	};

	if (!rsaKeyPair) {
		return (
			<>
				<Modal image='/images/auth.svg' alt='auth' onCloseClicked={redirectHandler}>
					<h1>Please enter your password:</h1>
					<Input
						Icon={Key}
						type='password'
						ref={passwordRef}
					/>
					<Button
						onClick={submitHandler}
						title="Submit"
					/>
				</Modal>
			</>
		);
	}

	return (
		<div onClick={() => setExpiresAt(new Date(new Date().getTime() + (2 * 60000)))}>
			{remaining && <Timer remaining={remaining}/>}
			<EditProfile
				rsaKeyPair={rsaKeyPair}
				passwordHash={passwordHash}
				setPasswordHash={setPasswordHash}
			/>
		</div>
	);
}

export async function getServerSideProps(context) {
	const { req, res } = context;
	const session = await getSession({ req, res });
	if (session) return { props: { } };
	return { redirect: { destination: '/login', permanent: false } };
}
