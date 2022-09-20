import Input from '../user-interface/input';
import Mail from '../icons/mail';

export default function SecondStepForm({
	emailRef,
	postalCodeRef
}) {
	return (
		<>
			<Input
				id='email'
				label='E-mail'
				innerRef={emailRef}
				icon={<Mail />}
				placeholder='e.g. example@email.com'
			/>
			<Input
				id='postalCode'
				label='Postal code'
				type='text'
				innerRef={postalCodeRef}
				icon={<Mail />}
				placeholder='e.g. 4300'
			/>
		</>
	);
}