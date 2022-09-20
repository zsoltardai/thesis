import Link from 'next/link';
import styles from './button.module.css';

export default function Button({
	href,
	onClick = () => {},
	children,
	style = {} }
) {
	if (href) {
		return (
			<Link href={href}>
				<a style={style} className={styles.button}>
					{children}
				</a>
			</Link>
		);
	}
	return (
		<button style={style} className={styles.button} onClick={onClick}>
			{children}
		</button>
	);
}
