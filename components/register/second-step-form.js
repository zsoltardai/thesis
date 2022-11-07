import React from 'react';
import { Input, Label } from '../user-interface';
import { Mail } from '../icons';

export default function SecondStepForm({
	emailRef,
	postalCodeRef
}) {
	return (
		<>
			<Label
				id='email'
				title='E-mail'
			/>
			<Input
				id='email'
				ref={emailRef}
				Icon={Mail}
				placeholder='e.g. example@email.com'
			/>
			<Label
				id='postalCode'
				title='Postal code'
			/>
			<Input
				id='postalCode'
				type='text'
				ref={postalCodeRef}
				Icon={Mail}
				placeholder='e.g. 4300'
			/>
		</>
	);
}
