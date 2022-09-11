import LoadingSpinner from '../../components/layout/loading-spinner';
import { useState, useEffect } from 'react';

export default function Referendums() {
	const [referendums, setReferendums] = useState(null);
	useEffect(() => {

	}, []);
	if (!referendums) return <LoadingSpinner />;
	return (
		<>
		</>
	);
}
