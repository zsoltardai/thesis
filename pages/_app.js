import Layout from '../components/layout/layout';
import { ModeContextProvider } from '../store/mode-context';
import { SessionContextProvider } from '../store/session-context';
import { NotificationContextProvider } from '../store/notification-context';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    return (
        <NotificationContextProvider>
            <ModeContextProvider>
                <SessionContextProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </SessionContextProvider>
            </ModeContextProvider>
        </NotificationContextProvider>
    );
}

export default MyApp
