import { useContext } from 'react';
import { useRouter } from 'next/router';
import SessionContext from '../store/session-context';
import LoginForm from '../components/forms/login-form';
import { getSession } from "../lib/auth/server";
import NotificationContext from "../store/notification-context";

export default function Login() {
    const notificationCtx = useContext(NotificationContext);
    const router = useRouter();
    const sessionContext = useContext(SessionContext);
    const loginHandler = async (email, passwordHash) => {
        const result = await sessionContext.login(email, passwordHash);
        if (result) {
            notificationCtx.set('success', 'Success', 'You logged in successfully!');
            await router.replace('/')
            return true;
        }
        notificationCtx.set('error', 'Error', 'Failed to log in!');
        return false;
    };
    return <LoginForm onLogin={loginHandler} />
}

export async function getServerSideProps(context) {
    const { req, res } = context;
    const session = await getSession({ req, res });
    if (!session) return { props: {} };
    return { redirect: { destination: '/', permanent: false } };
}
