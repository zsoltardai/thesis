import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import ModeContext from '../../store/mode-context';
import SessionContext from '../../store/session-context';
import Link from 'next/link';
import Dropdown from './dropdown';
import Logo from './logo';
import Button from '../user-interface/button';
import Bars from '../icons/bars';
import Close from '../icons/close';
import Sun from '../icons/sun';
import Moon from '../icons/moon';
import { signOut } from '../../lib/auth/client';
import styles from './navigation.module.css';

export default function Navigation() {
    const router = useRouter();
    const path = router.asPath;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdownHandler = () => setIsDropdownOpen(!isDropdownOpen);
    useEffect(() => setIsDropdownOpen(false), [path]);
    const modeContext = useContext(ModeContext);
    const sessionContext = useContext(SessionContext);
    const session = sessionContext.session;
    const toggleModeHandler = () => modeContext.toggleMode();
    const handleLogout = async () => {
        const result = sessionContext.logout();
        if (result) await router.replace('/login');
    };
    useEffect(() => {}, [sessionContext.session]);
    return (
        <>
            <div className={styles.container}>
                <div className={styles.navbar}>
                    <Logo />
                    <nav className={styles.nav}>
                        <ul className={styles.list}>
                            <li><Link href='/referendums'>
                                <a className={`${ path === '/referendums' ? styles.current : styles.link }`}>
                                    Referendums
                                </a>
                            </Link></li>
                            <li><Link href='/elections'>
                                <a className={`${ path === '/elections' ? styles.current : styles.link }`}>
                                    Elections
                                </a>
                            </Link></li>
                            <li>
                                <button className={styles.mode} onClick={toggleModeHandler}>
                                    {(modeContext.mode === 'light')
                                        ?
                                    <Sun height={30} width={30} />
                                        :
                                    <Moon height={22} width={22} />}
                                </button>
                            </li>
                            <li>
                            {
                                session ?
                                (
                                    <Button style={{ width: '220px', padding: '0.4rem 0' }}
                                         onClick={handleLogout}>Logout</Button>
                                )
                                    :
                                (
                                    <Button style={{ width: '220px', padding: '0.4rem 0' }}
                                         href='/login'>Login</Button>
                                )
                            }
                            </li>
                        </ul>
                    </nav>
                    <button className={styles.bars} onClick={toggleDropdownHandler}>
                        { isDropdownOpen ? <Close /> : <Bars/> }
                    </button>
                </div>
                {
                    isDropdownOpen &&
                    <Dropdown
                        path={path}
                        mode={modeContext.mode}
                        toggleMode={toggleModeHandler}
                        session={session}
                        handleLogout={handleLogout}
                    />
                }
            </div>
        </>
    );
}
