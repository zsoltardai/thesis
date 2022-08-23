import { useState, useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Mail from '../icons/mail';
import Input from '../user-interface/input';
import Control from '../user-interface/control';

export default function ChangeEmailForm({ initial, onChangeEmail }) {
	const notificationCtx = useContext(NotificationContext);
	const [email, setEmail] = useState(initial.toString());
	const validateForm = () => {
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			notificationCtx.set(
				'error',
				'Error',
				'The provided e-mail address was invalid!'
			)
			return false;
		}

		return email !== initial;
	};
	const submitHandler = async (event) => {
		event.preventDefault();

		if (!validateForm()) return;

		await onChangeEmail(email);
	};
	return (
		<form onSubmit={submitHandler}>
			<Control>
				<label>E-mail</label>
				<Input icon={<Mail />} set={email} get={setEmail} />
			</Control>
			<input type='submit' hidden />
		</form>
	);
}
