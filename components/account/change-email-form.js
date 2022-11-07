import React, { useContext, useRef } from 'react';
import NotificationContext from '../../store/notification-context';
import { Input, Control } from '../user-interface';
import { Mail } from '../icons';

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
				<Input
					Icon={Mail}
					ref={emailRef}
					defaultValue={initial.toString()}
				/>
			</Control>
			<input
				type='submit'
				hidden
			/>
		</form>
	);
}
