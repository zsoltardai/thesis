import EmailChangeForm from '../forms/email-change-form';
import PasswordChangeForm from '../forms/password-change-form';
import Input from '../user-interface/input';
import Pen from '../icons/pen';
import IdentityCard from '../icons/identity-card';
import styles from './user-details.module.css';

export default function UserDetails({ user, setUser, keys }) {
    const emailChangeHandler = async (email) => {
        const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
        const encryptedEmail = keys.encrypt(email);
        const body = JSON.stringify({ email, encryptedEmail });
        const response = await fetch('/api/auth/change-email',
            { method: 'PUT', headers: headers, body: body });
        if (!response.ok) {
            const data = await response.json();
            console.error(data.message);
        }
        setUser({...user, email: email});
    };
    const passwordChangeHandler = async (currentPassword, newPasswordHash, encryptedPrivateKeyPem) => {
        const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
        const body = JSON.stringify({
            currentPassword: currentPassword,
            newPasswordHash: newPasswordHash,
            encryptedPrivateKeyPem: encryptedPrivateKeyPem
        });
        const response = await fetch('/api/auth/change-password',
            { method: 'PUT', headers: headers, body: body });
        if (!response.ok) {
            const data = await response.json();
            console.error(data.message);
        }
        setUser({...user, encryptedPrivateKeyPem: encryptedPrivateKeyPem});
    };
    return (
        <div className={styles.container}>
            <div className={styles.control}>
                <label>Identity number (cannot be changed)</label>
                <Input icon={<IdentityCard />} set={ user.identityNumber } disabled />
            </div>
            <div className={styles.control}>
                <label>First name (cannot be changed)</label>
                <Input icon={<Pen />} set={ user.firstName } disabled />
            </div>
            <div className={styles.control}>
                <label>Last name (cannot be changed)</label>
                <Input icon={<Pen />} set={ user.lastName } disabled />
            </div>
            <EmailChangeForm initialEmail={user.email} onEmailChange={emailChangeHandler} />
            <PasswordChangeForm onPasswordChange={passwordChangeHandler} keys={keys} />
        </div>
    );
}
