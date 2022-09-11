import {useState, useContext, useEffect} from 'react';
import SessionContext from '../store/session-context';
import NotificationContext from '../store/notification-context';
import { useRouter } from 'next/router';
import Modal from '../components/user-interface/modal';
import Input from '../components/user-interface/input';
import Button from '../components/user-interface/button';
import Timer from '../components/user-interface/timer';
import Key from '../components/icons/key';
import RSA from '../lib/encryption/rsa';
import EditProfile from '../components/profile/edit-profile';
import { getSession } from '../lib/auth/server';
import md5 from 'md5';

export default function Account() {
	const router = useRouter();
	const sessionCtx = useContext(SessionContext);
	const notificationCtx = useContext(NotificationContext);
	const [password, setPassword] = useState('');
	const [passwordHash, setPasswordHash] = useState('');
	const [rsaKeyPair, setRsaKeyPair] = useState(null);
	const [remaining, setRemaining] = useState(null);
	const [expiresAt, setExpiresAt] = useState(null);
	useEffect(() => {
		if (expiresAt === null) return;
		const interval = setInterval(() => {
			const current = new Date().getTime();
			setRemaining(new Date(expiresAt.getTime() - current));
			if (remaining !== null
					&& (remaining.getMinutes() === 0
							&& remaining.getSeconds() === 0)
			) {
				setPasswordHash('');
				setRsaKeyPair(null);
				setRemaining(null)
				setExpiresAt(null);
			}
		}, 1000);
		return () => {
			return clearInterval(interval);
		};
	}, [remaining, expiresAt]);
	const redirectHandler = () => router.replace('/');
	const submitHandler = () => {
		const { user } = sessionCtx.session;
		let keys;
		try {
			keys = new RSA(user.encryptedPrivateKeyPem.trim(), password);
		} catch (_) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided password was invalid!'
			);
			setPassword('');
			return;
		}
		notificationCtx.set(
			'success',
			'Success',
			'Now, you can view your personal details.'
		);
		setRsaKeyPair(keys);
		setPasswordHash(md5(password));
		setPassword('');
		setExpiresAt(new Date(new Date().getTime() + (2 * 60000)));
	};

	if (!rsaKeyPair) {
		return (
			<>
				<Modal image='/auth.svg' alt='auth' onCloseClicked={redirectHandler}>
					<h1>Please enter your password:</h1>
					<Input icon={<Key />} type='password' set={password} get={setPassword}
				 		placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
					<Button onClick={submitHandler}>Submit</Button>
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
