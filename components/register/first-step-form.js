import React from 'react';
import {Input, Label} from '../user-interface';
import { Pen, IdentityCard } from '../icons';

export default function FirstStepForm({
	firstNameRef,
	lastNameRef,
	identityNumberRef
}) {
	return (
		<>
			<Label
				id='firstName'
				title='Firstname'
			/>
			<Input
				id='firstName'
				ref={firstNameRef}
				Icon={Pen}
				placeholder='e.g. Jon'
			/>
			<Label
				id='lastName'
				title='Lastname'
			/>
			<Input
				id='lastName'
				ref={lastNameRef}
				Icon={Pen}
				placeholder='e.g. Johnson'
			/>
			<Label
				id='identityNumber'
				title='Identity number'
			/>
			<Input
				id='identityNumber'
				ref={identityNumberRef}
				Icon={IdentityCard}
				placeholder='e.g. 123456AA'
			/>
		</>
	);
}
