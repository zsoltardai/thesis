import styles from './input.module.css';

export default function Input({
    id,
    type = 'text',
    placeholder = '',
    get = () => { return ''; },
    set = '',
    required = false,
    icon = null,
    disabled = false,
    onKeyDown = null
}) {
    const onChangeHandler = (e) => get(e.target.value);
    return (
        <span className={styles.input} style={{ gridTemplateColumns: `${ icon ? '1fr 9fr' : '1fr' }` }}>
            <div className={styles.icon}>
                { icon }
            </div>
            <input
                id={id}
                type={type}
                value={set}
                onChange={onChangeHandler}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
            />
        </span>
    );
}
