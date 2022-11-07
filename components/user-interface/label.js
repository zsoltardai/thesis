import styles from './label.module.css';

export default function Label({id, children, title = '', ...props}) {
	return <label className={styles.label} id={id} {...props}>{title || children}</label>;
}
