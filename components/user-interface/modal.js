import Image from 'next/image';
import Close from '../icons/close';
import styles from './modal.module.css';

export default function Modal({
	image = null,
	onCloseClicked = () => {},
	children
}) {
	return (
		<div className={styles.container}>
			<div className={styles.modal}>
				<div className={styles.button} onClick={onCloseClicked}>
					<Close />
				</div>
				{ image && <Image src={image} alt='modal image' width={150} height={150} priority /> }
				<div>
					{children}
				</div>
			</div>
		</div>
	);
}
