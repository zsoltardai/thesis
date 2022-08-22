import { useState, useContext } from 'react';
const md5 = require('md5');
import Mail from '../icons/mail';
import Key from '../icons/key';
import Input from '../user-interface/input';
import Button from '../user-interface/button';
import Link from 'next/link';
import NotificationContext from '../../store/notification-context';
import styles from './login-form.module.css';

export default function LoginForm({ onLogin }) {
    const notificationCtx = useContext(NotificationContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const submitHandler = async (event) => {
        event.preventDefault();

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
            notificationCtx.set('error', 'Error', 'The provided e-mail address is invalid!');
            return;
        }

        if (password.trim() === '') {
            notificationCtx.set('error', 'Error', 'The provided password is invalid!');
            return;
        }

        const passwordHash = md5(password);

        setPassword('');

        notificationCtx.set('pending', 'Pending', 'Your login request has been sent!');

        const result = await onLogin(email, passwordHash);

        if (!result) return;

        setEmail('');
    };
    return (
        <form className={styles.form} onSubmit={submitHandler}>
            <h2>Login</h2>
            <div className={styles.control}>
                <label htmlFor='email'>E-mail</label>
                <Input id='email' icon={<Mail />} set={email}
                       get={setEmail} type='text' placeholder='e.g. example@email.com' />
            </div>
            <div className={styles.control}>
                <label htmlFor='password'>Password</label>
                <Input id='password' icon={<Key />} set={password} get={setPassword}
                       type='password' placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
            </div>
            <div className={styles.control}>
                <Button>Login</Button>
            </div>
            <span>
                Don&apos;t you have an account? <Link href='/register'>Register here.</Link>
            </span>
        </form>
    );
}