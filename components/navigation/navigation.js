import { useState, useEffect, useContext } from 'react';
import ModeContext from '../../store/mode-context';
import SessionContext from '../../store/session-context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './logo';
import Button from '../user-interface/button';
import Bars from '../icons/bars';
import Close from '../icons/close';
import Sun from '../icons/sun';
import Moon from '../icons/moon';
import Dropdown from './dropdown';
import styles from './navigation.module.css';

export default function Navigation() {
	const router = useRouter();
	const path = router.asPath;
	const modeContext = useContext(ModeContext);
	const sessionContext = useContext(SessionContext);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const toggleDropdownHandler = () => setDropdownOpen(!dropdownOpen);
	const toggleModeHandler = () => modeContext.toggleMode();
	const logoutHandler = async () => {
		const result = sessionContext.logout();
		if (result) await router.replace('/login');
	};
	useEffect(() => setDropdownOpen(false), [path]);
	useEffect(() => {}, [sessionContext.session]);
	return (
		<>
			<div className={styles.container}>
				<div className={styles.navbar}>
					<Logo />
					<nav className={styles.nav}>
						<ul className={styles.list}>
							<li>
								<Link href='/elections'>
									<a className={`${ path === '/elections' ? styles.current : styles.link }`}>
										Elections
									</a>
								</Link>
							</li>
							{
								(sessionContext.session)
									&&
									(
										<li>
											<Link href='/account'>
												<a className={`${ path === '/account' ? styles.current : styles.link }`}>
														Profile
												</a>
											</Link>
										</li>
									)
							}
							<li>
								<button className={styles.mode} onClick={toggleModeHandler}>
									{
										(modeContext.mode === 'light')
											?
											<Sun height={30} width={30} />
											:
											<Moon height={22} width={22} />
									}
								</button>
							</li>
							<li>
								{
									sessionContext.session
										?
										<Button style={{ width: '220px', padding: '0.4rem 0' }} onClick={logoutHandler}>
												Logout
										</Button>
										:
										<Button style={{ width: '220px', padding: '0.4rem 0' }} href='/login'>
												Login
										</Button>
								}
							</li>
						</ul>
					</nav>
					<button className={styles.bars} onClick={toggleDropdownHandler}>
						{ dropdownOpen ? <Close /> : <Bars/> }
					</button>
				</div>
				{ dropdownOpen && <Dropdown /> }
			</div>
		</>
	);
}
