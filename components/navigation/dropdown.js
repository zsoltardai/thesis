import Link from 'next/link';
import Button from '../user-interface/button';
import Switch from '../user-interface/switch';
import Sun from '../icons/sun';
import Moon from '../icons/moon';
import styles from './dropdown.module.css';

export default function Dropdown({ path, mode, toggleMode, session, handleLogout }) {
    return (
      <nav className={styles.dropdown}>
          <ul className={styles.list}>
              <li><Link href='/referendums'>
                  <a className={`${ path === '/referendums' ? styles.current : styles.link }`}>Referendums</a>
              </Link></li>
              <li><Link href='/elections'>
                  <a className={`${ path === '/elections' ? styles.current : styles.link }`}>Elections</a>
              </Link></li>
              <li className={styles.row}>
                  <Switch checked={(mode === 'dark')} onChange={() => toggleMode()} />
                  <div>{ (mode === 'light') ? <Sun width={25} height={25} /> : <Moon width={20} height={20} /> }</div>
              </li>
              <li>{ session ? <Button onClick={handleLogout}>Logout</Button>
                  : <Button href='/login'>Login</Button> }</li>
          </ul>
      </nav>
    );
};
