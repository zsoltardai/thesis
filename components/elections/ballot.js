import React from 'react';
import styles from './ballot.module.css';
import {default as Options} from './voting-options';

const Ballot = ({ items, chosen, choose, title, description }) => {
	return (
		<div className={styles.ballot}>
			<h2>{title}</h2>
			<p>{description}</p>
			<span className={styles.options}>
				<Options
					items={items}
					chosen={chosen}
					choose={choose}
				/>
			</span>
		</div>
	);
}

export default Ballot;
