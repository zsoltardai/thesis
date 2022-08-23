import { createContext, useState, useEffect } from 'react';

const NotificationContext = createContext({
	notification: null,
	set: (status, title, message) => {},
	clear: () => {}
});

export function NotificationContextProvider({ children }) {

	const [notification, setNotification] = useState(null);

	useEffect(() => {
		if (notification && (notification.status === 'success' || notification.status === 'error')) {
			const timer = setTimeout(() => setNotification(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [notification]);

	const setNotificationHandler = (status, title, message) => {
		const _notification = { status, title, message };
		setNotification(_notification);
	};

	const clearNotificationHandler = () => {
		setNotification(null);
	};

	const context = {
		notification: notification,
		set: setNotificationHandler,
		clear: clearNotificationHandler
	};

	return (
		<NotificationContext.Provider value={context}>
			{children}
		</NotificationContext.Provider>
	)
}

export default NotificationContext;
