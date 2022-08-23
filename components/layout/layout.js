import { useContext } from 'react';
import ModeContext from '../../store/mode-context';
import Navigation from '../navigation/navigation';
import Notification from '../user-interface/notification';
import styles from './layout.module.css';

export default function Layout({
	children
}) {
	const modeContext = useContext(ModeContext);
	return (
		<div className={`${ (modeContext.mode === 'dark') ? 'dark' : 'light' }`}>
			<Navigation />
			<main className={styles.main}>
				{children}
			</main>
			<Notification />
		</div>
	);
}
