import Image from 'next/image';
import image from '../public/images/404.svg';
import Button from '../components/user-interface/button';
import styles from '../styles/404.module.css';

export default function FourOhFour() {
	return (
		<div className={styles.container}>
			<Image src={image} alt='404' width={500} height={350} />
			<div className={styles.message}>
				<h2>Ooops!</h2>
				<p>The page you are looking for doesn&apos;t exist anymore!</p>
				<Button style={{ width: '60%', padding: '1rem' }} href='/'>Go back</Button>
			</div>
		</div>
	);
};