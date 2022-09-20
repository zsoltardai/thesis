import { useContext, useRef } from 'react';
import NotificationContext from '../../store/notification-context';
import Key from '../icons/key';
import Input from '../user-interface/input';
import Control from '../user-interface/control';

export default function ChangePasswordForm({
	onPasswordChange
}) {
	const notificationCtx = useContext(NotificationContext);
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const validateForm = () => {
		if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
			.test(passwordRef.current.value)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided password did not met the requirements!'
			);
			return false;
		}

		if (passwordRef.current.value !== confirmPasswordRef.current.value) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided passwords did not match!'
			)
			return false;
		}

		return true;
	};
	const submitHandler = async (event) => {
		event.preventDefault();
		const password = passwordRef.current.value;

		if (!validateForm()) return;

		const result = await onPasswordChange(password);

		if (!result) return;

		passwordRef.current.value  = '';
		confirmPasswordRef.current.value = '';
		notificationCtx.set(
			'success',
			'Success',
			'The password was updated successfully!'
		);
	};
	return (
		<form onSubmit={submitHandler}>
			<Control>
				<label>New password</label>
				<Input icon={<Key />} innerRef={passwordRef} required type='password'
					placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
			</Control>
			<Control>
				<label>Confirm password</label>
				<Input icon={<Key />} innerRef={confirmPasswordRef} required type='password'
					placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
			</Control>
			<input type='submit' hidden />
		</form>
	);
}
