import Input from '../user-interface/input';
import Key from '../icons/key';

export default function ThirdStepForm({
	passwordRef,
	confirmPasswordRef
}) {
	return (
		<>
			<Input
				id='password'
				label='Password'
				innerRef={passwordRef}
				icon={<Key />}
				type='password'
				placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
			/>
			<Input
				id='confirmPassword'
				label='Confirm password'
				innerRef={confirmPasswordRef}
				type='password'
				icon={<Key />}
				placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'
			/>
		</>
	);
}
