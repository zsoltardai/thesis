import Image from 'next/image';
import styles from './welcome.module.css';

export default function Welcome() {
	return (
		<>
			<div className={styles.container}>
				<div className={styles.image}>
					<Image alt='voting' src='/images/voting.svg' width={400} height={300} layout='responsive' priority />
				</div>
				<div className={styles.body}>
					<h1>Welcome to e-Democracy!</h1>
					<p>
            In luctus pellentesque tincidunt. Mauris massa mi, pellentesque commodo elit sed,
            rhoncus placerat justo. Curabitur et tortor nec tellus dictum tristique. Curabitur
            magna enim, laoreet sit amet scelerisque a, ornare a orci. Aliquam malesuada elit
            nisl, in vestibulum risus mollis congue. Fusce condimentum tristique auctor. Maecenas
            eros ipsum, sollicitudin a faucibus porttitor, aliquam eu mi.
					</p>
				</div>
			</div>
		</>
	);
}
