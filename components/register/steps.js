import styles from './steps.module.css';


export default function Steps({
	currentStep,
	numberOfSteps
}) {
	const style = (step) => {
		return { backgroundColor: (currentStep >= step) ? 'var(--color-primary)' : '',
			color: (currentStep >= step) ? 'var(--color-white)' : 'var(--color-text)'
		};
	};
	const steps = () => [...Array(numberOfSteps).keys()];
	return (
		<div className={styles.container}>
			<span className={styles.circle} style={style(0)}>1</span>
			{
				steps().slice(1, numberOfSteps-1).map(step => {
					return (
						<>
							<span className={styles.separator}></span>
							<span className={styles.circle} style={style(step)}>{step + 1}</span>
							<span className={styles.separator}></span>	
						</>	
					);
				})
			}
			<span className={styles.circle} style={style(numberOfSteps-1)}>
				{numberOfSteps}
			</span>
		</div>
	);
}