import { useContext, useRef } from 'react';
import NotificationContext from '../../store/notification-context';
import Mail from '../icons/mail';
import Input from '../user-interface/input';
import Control from '../user-interface/control';

export default function ChangeEmailForm({ initial, onChangeEmail }) {
	const notificationCtx = useContext(NotificationContext);
	const emailRef = useRef();
	const validateForm = () => {
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(emailRef.current.value)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided e-mail address was invalid!'
			)
			return false;
		}

		return emailRef.current.value !== initial;
	};
	const submitHandler = async (event) => {
		event.preventDefault();
		const email = emailRef.current.value;

		if (!validateForm()) return;

		await onChangeEmail(email);
	};
	return (
		<form onSubmit={submitHandler}>
			<Control>
				<label>E-mail</label>
				<Input icon={<Mail />} innerRef={emailRef} defaultValue={initial.toString()} />
			</Control>
			<input type='submit' hidden />
		</form>
	);
}
