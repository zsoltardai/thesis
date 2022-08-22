import Head from 'next/head';
import Welcome from '../components/home/welcome';
import styles from '../styles/home.module.css'

export default function Home() {
    return (
        <>
            <Head>
                <title>E-voting - Dashboard</title>
            </Head>
            <div className={styles.grid}>
                <Welcome />
            </div>
        </>
    )
}
