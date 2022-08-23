import { useContext, useState, useEffect } from 'react';
import NotificationContext from '../../store/notification-context';
import SessionContext from '../../store/session-context';
import LoadingSpinner from '../layout/loading-spinner';
import Pen from '../icons/pen';
import IdentityCard from '../icons/identity-card';
import Input from '../user-interface/input';
import Control from '../user-interface/control';
import ChangeEmailForm from './change-email-form';
import PasswordChangeForm from './change-password-form';
import md5 from 'md5';
import styles from './edit-profile.module.css';

export default function EditProfile({ 
	rsaKeyPair,
	passwordHash,
	setPasswordHash
}) {
	const notificationCtx = useContext(NotificationContext);
	const sessionCtx = useContext(SessionContext);
	const session = sessionCtx.session;
	const [user, setUser] = useState({
		firstName: null,
		lastName: null,
		identityNumber: null,
		email: null
	});
	useEffect(() => {
		const _user = session.user;
		setUser({
			firstName: rsaKeyPair.decrypt(_user.encryptedFirstName.trim()),
			lastName: rsaKeyPair.decrypt(_user.encryptedLastName.trim()),
			identityNumber: rsaKeyPair.decrypt(_user.encryptedIdentityNumber.trim()),
			email: rsaKeyPair.decrypt(_user.encryptedEmail.trim())
		});
	}, [rsaKeyPair, session]);
	const changeEmailHandler = async (email) => {
		const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
		const encryptedEmail = rsaKeyPair.encrypt(email);
		const body = JSON.stringify({ email, encryptedEmail, passwordHash: passwordHash });
		notificationCtx.set(
			'pending',
			'Pending',
			'A request to change your e-mail has been sent.'
		);
		const response = await fetch('/api/auth/change-email', { 
			method: 'PUT',
			headers: headers,
			body: body
		});
		if (response.status !== 204) {
			const data = await response.json();
			notificationCtx.set(
				'error',
				'Error',
				data.message
			);
			return;
		}
		notificationCtx.set(
			'success',
			'Success',
			'The email was updated successfully!'
		);
		sessionCtx.update();
	};
	const changePasswordHandler = async (newPassword) => {
		const newPasswordHash = md5(newPassword);
		if (newPasswordHash === passwordHash) {
			notificationCtx.set(
				'error',
				'Error',
				'The new password cannot be the same like the old password!'
			)
			return false;
		}
		const encryptedPrivateKeyPem = rsaKeyPair.getPrivateKeyPem(newPassword);
		const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
		const body = JSON.stringify({
			currentPasswordHash: passwordHash,
			newPasswordHash: newPasswordHash,
			encryptedPrivateKeyPem: encryptedPrivateKeyPem
		});
		notificationCtx.set(
			'pending',
			'Pending',
			'A request to change your password has been sent.'
		);
		const response = await fetch('/api/auth/change-password', {
			method: 'PUT',
			headers: headers,
			body: body
		});
		if (response.status !== 204) {
			const data = await response.json();
			notificationCtx.set(
				'error',
				'Error',
				data.message
			);
			return false;
		}
		setPasswordHash(newPasswordHash);
		sessionCtx.update();
		return true;
	};
	if (Object.keys(user).some(key => user[key] === null)) return <LoadingSpinner />;
	return (
		<div className={styles.container}>
			<Control>
				<label>Identity number</label>
				<Input icon={<IdentityCard />} set={ user.identityNumber } disabled />
			</Control>
			<Control>
				<label>First name</label>
				<Input icon={<Pen />} set={ user.firstName } disabled />
			</Control>
			<Control>
				<label>Last name</label>
				<Input icon={<Pen />} set={ user.lastName } disabled />
			</Control>
			<Helper />
			<ChangeEmailForm initial={user.email} onChangeEmail={changeEmailHandler} />
			<PasswordChangeForm onPasswordChange={changePasswordHandler} />
		</div>
	);
}

function Helper() {
	return (
		<div className={styles.helper}>
				The password and the e-mail address can be changed, to modify them:
			<ol>
				<li>Type in the new credential</li>
				<li>Press <b>&lt;ENTER&gt;</b></li>
				<li>
					Receive a &nbsp;
					<b style={{color: 'var(--color-green)'}}>
						Success &nbsp;
					</b>
					or an &nbsp;
					<b style={{color: 'var(--color-red)'}}>
						Error &nbsp;
					</b>
					notification
				</li>
			</ol>
		</div>
	);
}
