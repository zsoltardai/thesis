import ReactSwitch from 'react-switch';

export default function Switch({
	onChange,
	checked
}) {
	return (
		<ReactSwitch
			checked={checked}
			onChange={onChange}
			offColor='#000000'
			onColor='#FFFFFF'
			offHandleColor='#FFFFFF'
			onHandleColor='#000000'
			uncheckedIcon={false}
			checkedIcon={false}
		/>
	);
}
