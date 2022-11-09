import React from 'react';
import { Checkbox } from '../user-interface';

const VotingOptions = ({ items, chosen, choose }) => {
	return items && items.map((item, index) => {
		if (item.name) {
			const { name, _id } = item;
			return (
				<Checkbox
					value={_id}
					key={index}
					label={name}
					checked={chosen}
					group='partyLists'
					setChecked={choose}
				/>
			);
		}

		if (item.firstName && item.lastName) {
			const { firstName, lastName, _id } = item;
			return (
				<Checkbox
					value={_id}
					key={index}
					label={`${firstName} ${lastName}`}
					checked={chosen}
					group='candidates'
					setChecked={choose}
				/>
			);
		}

		return null;
	});
}

export default VotingOptions;
