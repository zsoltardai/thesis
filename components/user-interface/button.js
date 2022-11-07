import Link from 'next/link';
import styles from './button.module.css';

export default function Button({
	href,
	onClick = () => {},
	title = '',
	children,
	style = {} }
) {
	if (href) {
		return (
			<Link href={href}>
				<a style={style} className={styles.button}>
					{title || children}
				</a>
			</Link>
		);
	}
	return (
		<button style={style} className={styles.button} onClick={onClick}>
			{title || children}
		</button>
	);
}
