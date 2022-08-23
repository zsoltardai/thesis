import Layout from '../components/layout/layout';
import { ModeContextProvider } from '../store/mode-context';
import { SessionContextProvider } from '../store/session-context';
import { NotificationContextProvider } from '../store/notification-context';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return (
		<NotificationContextProvider>
			<SessionContextProvider>
				<ModeContextProvider>
					<Layout><Component {...pageProps} /></Layout>
				</ModeContextProvider>
			</SessionContextProvider>
		</NotificationContextProvider>
	);
}

export default MyApp
