import { useContext } from 'react';
import NotificationContext from '../store/notification-context';
import SessionContext from '../store/session-context';
import { useRouter } from 'next/router';
import LoginForm from '../components/forms/login-form';
import { getSession } from '../lib/auth/server';

export default function Login() {
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const sessionContext = useContext(SessionContext);
	const loginHandler = async (email, passwordHash) => {
		let result;
		try {
			result = await sessionContext.login(email, passwordHash);
		} catch (error) {
			notificationCtx.set(
				'error',
				'Error',
				error
			);
			return false;
		}
		notificationCtx.set(
			'success', 
			'Success', 
			result
		);
		await router.replace('/')
		return true;
	};
	return (
		<LoginForm
			onLogin={loginHandler}
		/>  
	);
}

export async function getServerSideProps(context) {
	const { req, res } = context;
	const session = await getSession({ req, res });
	if (!session) return { props: {} };
	return { redirect: { destination: '/', permanent: false } };
}
