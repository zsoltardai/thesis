import { useContext } from 'react';
import { default as Notification } from '../store/notification-context';

const useNotification = () => {
	const ctx = useContext(Notification);

	return {
		notification: ctx.notification,
		clearNotification: ctx.clear,
		setNotification: ctx.set
	}
}

export default useNotification;
