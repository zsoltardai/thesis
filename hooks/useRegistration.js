import { useState } from 'react';
import registrationsApi from '../api/registrations';

const useRegistration = () => {
	const [registration, setRegistration] = useState(null);
	const [loading, setLoading] = useState(true);

	const getRegistration = async (publickeyhash) => {
		setLoading(true);
		const res = await registrationsApi.getRegistration(publickeyhash);
		if (res.ok) {
			setRegistration(true);
			setLoading(false);
			return;
		}
		setRegistration(false);
		setLoading(false);
	}

	const register = async ({ electionid, publickey }) => {
		setLoading(true);
		const res = await registrationsApi.register({ electionid, publickey });
		if (res.ok) {
			setRegistration(true);
			setLoading(false);
			return;
		}
		setRegistration(false);
		setLoading(false);
	}

	return {
		registration,
		loading,
		getRegistration,
		register
	};
}

export default useRegistration;
