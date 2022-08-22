import { useState } from 'react';
import Input from '../user-interface/input';
import Mail from '../icons/mail';
import Button from '../user-interface/button';
import styles from './email-change-form.module.css';

export default function EmailChangeForm({ initialEmail, onEmailChange }) {
    const [email, setEmail] = useState(initialEmail);
    const submitHandler = async (event) => {
        event.preventDefault();

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email) || email === initialEmail) {
            return;
        }

        await onEmailChange(email);
    };
    return (
        <form className={styles.form} onSubmit={submitHandler}>
            <h2>Change E-mail address</h2>
            <div className={styles.control}>
                <label>E-mail</label>
                <Input icon={<Mail />} set={email} get={setEmail} />
            </div>
            <div className={styles.control}>
                <Button>Change</Button>
            </div>
        </form>
    );
}