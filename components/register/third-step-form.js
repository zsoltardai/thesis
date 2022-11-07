import React from 'react';
import { Input, Label } from '../user-interface';
import { Key } from '../icons';

export default function ThirdStepForm({
	passwordRef,
	confirmPasswordRef
}) {
	return (
		<>
			<Label
				id='password'
				title='Password'
			/>
			<Input
				id='password'
				ref={passwordRef}
				Icon={Key}
				type='password'
				placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
			/>
			<Label
				id='confirmPassword'
				title='Confirm password'
			/>
			<Input
				id='confirmPassword'
				ref={confirmPasswordRef}
				type='password'
				Icon={Key}
				placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
			/>
		</>
	);
}
