import Input from '../user-interface/input';
import Pen from '../icons/pen';
import IdentityCard from '../icons/identity-card';

export default function FirstStepForm({firstNameRef, lastNameRef, identityNumberRef}) {
	return (
		<>
			<Input
				id='firstName'
				label='Firstname'
				innerRef={firstNameRef}
				icon={<Pen />}
				placeholder='e.g. Jon'
			/>
			<Input
				id='lastName'
				label='Lastname'
				innerRef={lastNameRef}
				icon={<Pen />}
				placeholder='e.g. Johnson'
			/>
			<Input
				id='identityNumber'
				label='Identity number'
				innerRef={identityNumberRef}
				icon={<IdentityCard />}
				placeholder='e.g. 123456AA'
			/>
		</>
	);
}
