import Button from '../user-interface/button';
import styles from './navigate.module.css';

export default function Navigate({
	backHandler,
	forwardHandler,
	submitHandler,
	step,
	max
}) {
	const styleBack = {
		border: '1px solid var(--color-primary)',
		color: 'var(--color-primary)',
		backgroundColor: 'var(--color-background)'
	};
	return (
		<div className={styles.container}>
			{(step !== 0) && <Button onClick={backHandler} style={styleBack}>Back</Button>}
			{
				(step !== max) ?
					(
						<Button onClick={forwardHandler} >
										Continue
						</Button>
					) :
					(
						<Button onClick={submitHandler}>
										Submit
						</Button>
					)
			}
		</div>
	);
}