import { useState, useEffect } from 'react';

const useSettlement = (postalCode) => {
	const [settlement, setSettlement] = useState(null);
	const [loading, setLoading] = useState(true);
	const getSettlementByPostalCode = async () => {
		setLoading(true);
		const url = `/api/v1/settlements/${postalCode}`;
		const response = await fetch(url, { method: 'GET' });
		if (!response.ok) {
			setSettlement(null);
			setLoading(false);
			return;
		}
		const settlement = await response.json();
		setSettlement(settlement);
		setLoading(false);
	}
	useEffect(() => {
		(async () => getSettlementByPostalCode(postalCode))();
	}, [postalCode]);
	return { loading, settlement };
}

export default useSettlement;
