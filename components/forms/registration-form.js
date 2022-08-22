import { useState, useContext } from 'react';
const md5 = require('md5');
import Link from 'next/link';
import Input from '../user-interface/input';
import Button from '../user-interface/button';
import Mail from '../icons/mail';
import IdentityCard from '../icons/identity-card';
import Pen from '../icons/pen';
import Key from '../icons/key';
import RSA from '../../lib/encryption/rsa-util';
import NotificationContext from '../../store/notification-context';
import styles from './registration-form.module.css';

export default function RegistrationForm({ onRegister }) {
    const notificationCtx = useContext(NotificationContext);
    const [identityNumber, setIdentityNumber] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const submitHandler = async (event) => {
        event.preventDefault();

        if (!(/^[0-9]{6}[A-Z]{2}$/).test(identityNumber)) {
            notificationCtx.set('error', 'Error', 'The provided identity number is invalid!');
            return;
        }

        if (!(/[A-ZÁÉ][a-záé]{2,}/).test(firstName)) {
            notificationCtx.set('error', 'Error', 'The provided first name is invalid!');
            return;
        }

        if (!(/[A-ZÁÉ][a-záé]{2,}/).test(lastName)) {
            notificationCtx.set('error', 'Error', 'The provided first name is invalid!');
            return;
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
            notificationCtx.set('error', 'Error', 'The provided e-mail address is invalid!');
            return;
        }

        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).test(password)) {
            notificationCtx.set('error', 'Error', 'The provided password is invalid!');
            return;
        }

        if (password !== confirmPassword) {
            notificationCtx.set('error', 'Error', 'The provided passwords did not match!');
            return;
        }

        const keys = new RSA();

        const encryptedPrivateKeyPem = keys.getPrivateKeyPem(password);

        const encryptedIdentityNumber = keys.encrypt(identityNumber);

        const encryptedEmail = keys.encrypt(email);

        const encryptedFirstName = keys.encrypt(firstName);

        const encryptedLastName = keys.encrypt(lastName);

        const passwordHash = md5(password);

        notificationCtx.set('pending', 'Pending', 'Your registration request has been sent!');

        await onRegister(identityNumber, encryptedIdentityNumber, email, encryptedEmail, encryptedFirstName,
            encryptedLastName, encryptedPrivateKeyPem, passwordHash);


    };
    return (
      <form className={styles.form} onSubmit={submitHandler}>
          <h2>Registration</h2>
          <div className={styles.grid}>
              <div className={styles.control}>
                  <label htmlFor='identityNumber'>Identity number</label>
                  <Input id='identityNumber' get={setIdentityNumber} set={identityNumber}
                         icon={<IdentityCard />} placeholder='e.g. 123456AA' />
              </div>
              <div className={styles.control}>
                  <label htmlFor='firstName'>First name</label>
                  <Input id='firstName' get={setFirstName} set={firstName} icon={<Pen />}
                         placeholder='e.g. Jon' />
              </div>
              <div className={styles.control}>
                  <label htmlFor='lastName'>Last name</label>
                  <Input id='lastName' get={setLastName} set={lastName} icon={<Pen />}
                         placeholder='e.g. Johnson' />
              </div>
              <div className={styles.control}>
                  <label htmlFor='email'>E-mail</label>
                  <Input id='email' get={setEmail} set={email} icon={<Mail />}
                         placeholder='e.g. example@email.com' />
              </div>
              <div className={styles.control}>
                  <label htmlFor='password'>Password</label>
                  <Input id='password' get={setPassword} set={password} icon={<Key />} type='password'
                         placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
                  <small className={styles.helper}>
                      <ul>
                          <li>Must be at least 8 characters long</li>
                          <li>Must contain small and capital letters [A-z]</li>
                          <li>Must contain numbers [0-9]</li>
                          <li>Must contain special characters [@^+!]</li>
                      </ul>
                  </small>
              </div>
              <div className={styles.control}>
                  <label htmlFor='confirmPassword'>Confirm password</label>
                  <Input id='confirmPassword' get={setConfirmPassword} set={confirmPassword} type='password'
                         icon={<Key />} placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
              </div>
          </div>
          <div className={styles.control}>
              <Button>Register</Button>
          </div>
          <span>
                Do you have an account? <Link href='/login'>Login here.</Link>
          </span>
      </form>
    );
}
