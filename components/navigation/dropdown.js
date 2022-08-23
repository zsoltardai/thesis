import { useContext } from 'react';
import ModeContext from '../../store/mode-context';
import SessionContext from '../../store/session-context';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../user-interface/button';
import Switch from '../user-interface/switch';
import Sun from '../icons/sun';
import Moon from '../icons/moon';
import styles from './dropdown.module.css';


/**
 * the dropdown component is responsible for providing a menu in mobile view
 * @returns {JSX.Element}
 * @constructor
 */
export default function Dropdown() {
	const router = useRouter();
	const path = router.asPath;
	const modeCtx = useContext(ModeContext);
	const sessionCtx = useContext(SessionContext);
	const toggleHandler = () => modeCtx.toggleMode();
	const logoutHandler = async () => {
		sessionCtx.logout()
		await router.replace('/login');
	};
	return (
		<nav className={styles.dropdown}>
			<ul className={styles.list}>
				<li>
					<Link href='/referendums'>
						<a className={`${ path === '/referendums' ? styles.current : styles.link }`}>
              Referendums
						</a>
					</Link>
				</li>
				<li>
					<Link href='/elections'>
						<a className={`${ path === '/elections' ? styles.current : styles.link }`}>
              Elections
						</a>
					</Link>
				</li>
				<li>
					<Link href='/profile'>
						<a className={`${ path === '/profile' ? styles.current : styles.link }`}>
							Profile
						</a>
					</Link>
				</li>
				<li className={styles.row}>
					<Switch checked={(modeCtx.mode === 'dark')} onChange={toggleHandler} />
					<div>
						{
							(modeCtx.mode === 'light')
								?
								<Sun width={25} height={25} />
								:
								<Moon width={20} height={20} /> 
						}
					</div>
				</li>
				<li>
					{ 
						sessionCtx.session ?
							<Button onClick={logoutHandler}>
                  Logout
							</Button>
							:
							<Button href='/login'>
                  Login
							</Button> 
					}
				</li>
			</ul>
		</nav>
	);
};
