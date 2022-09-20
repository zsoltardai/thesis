import Image from 'next/image';
import Close from '../icons/close';
import styles from './modal.module.css';

export default function Modal({
	image = null,
	onCloseClicked = null,
	children,
	title,
	style = {}
}) {
	return (
		<div className={styles.container} style={style}>
			<div className={styles.modal}>
				{
					onCloseClicked
						&&
					<div className={styles.button} onClick={onCloseClicked}>
						<Close />
					</div>
				}
				{
					image
						&&
					<Image
						src={image}
						alt='modal image'
						width={150}
						height={150}
						priority
					/>
				}
				<div>
					{title ? <h2>{title}</h2> : null}
					{children}
				</div>
			</div>
		</div>
	);
}
