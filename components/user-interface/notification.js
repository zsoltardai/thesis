import { useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Pending from '../icons/pending';
import Success from '../icons/success';
import Error from '../icons/error';
import styles from './notification.module.css';

export default function Notification() {
	const notificationContext = useContext(NotificationContext);
	const notification = notificationContext.notification;
	if (notification === null) return null;
	const { title, message } = notification;
	const style = (notification.status === 'success')
		? styles.success : (notification.status === 'error')
			? styles.error : styles.pending;
	const icon = (notification.status === 'success')
		? <Success color='var(--color-white)' /> : (notification.status === 'error')
			? <Error color='var(--color-white)' /> : <Pending color='var(--color-white)' />;
	const onClickHandler = () => {
		notificationContext.clear();
	};
	return (
		<div className={`notification ${ style }`} onClick={onClickHandler}>
			<div className={styles.container}>
				{icon}
				<p className={styles.title}>{title}</p>
			</div>
			<p className={styles.message}>{message}</p>
		</div>
	);
}
