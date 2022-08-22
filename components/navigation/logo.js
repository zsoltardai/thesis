import Link from 'next/link';
import styles from './logo.module.css';

export default function Logo() {
    return <Link href='/'><h2 className={styles.logo}>E-democracy</h2></Link>;
}
