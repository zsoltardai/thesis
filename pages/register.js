import { useContext } from 'react';
import NotificationContext from '../store/notification-context';
import RegistrationForm from '../components/forms/registration-form';
import { useRouter } from 'next/router';
import { getSession } from '../lib/auth/server';

export default function Register() {
    const router = useRouter();
    const notificationCtx = useContext(NotificationContext);
    const registerHandler = async (identityNumber, encryptedIdentityNumber, email, encryptedEmail, encryptedFirstName,
                                   encryptedLastName, encryptedPrivateKeyPem, passwordHash) => {
        const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

        const body = JSON.stringify({
            identityNumber: identityNumber,
            encryptedIdentityNumber: encryptedIdentityNumber,
            email: email,
            encryptedEmail: encryptedEmail,
            encryptedFirstName: encryptedFirstName,
            encryptedLastName: encryptedLastName,
            encryptedPrivateKeyPem: encryptedPrivateKeyPem,
            passwordHash: passwordHash
        });
        const response = await fetch('/api/auth/register', { method: 'POST', headers: headers, body: body });
        const data = await response.json();
        if (!response.ok) {
            notificationCtx.set('error', 'Error', data.message);
            return;
        }
        notificationCtx.set('success', 'Success', data.message);
        await router.replace('/login');
    };
    return (
        <>
            <RegistrationForm onRegister={registerHandler} />
        </>
    );
}

export async function getServerSideProps(context) {
    const { req, res } = context;
    const session = await getSession({ req, res });
    if (!session) return { props: {} };
    return { redirect: { destination: '/', permanent: false } };
}
