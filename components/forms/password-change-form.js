import { useState } from 'react';
import Input from '../user-interface/input';
import Key from '../icons/key';
import Button from '../user-interface/button';
const md5 = require('md5');
import styles from './password-change-form.module.css';

export default function PasswordChangeForm({ onPasswordChange, keys }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const submitHandler = async (event) => {
        event.preventDefault();

        if (currentPassword === newPassword) {
            return;
        }

        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).test(newPassword)) {
            return;
        }

        if (newPassword !== confirmPassword) {
            return;
        }

        const newPasswordHash = md5(newPassword);

        const encryptedPrivateKeyPem = keys.getPrivateKeyPem(newPassword);

        await onPasswordChange(currentPassword, newPasswordHash, encryptedPrivateKeyPem);
    };
    return (
        <form className={styles.form} onSubmit={submitHandler}>
            <h2>Change password</h2>
            <div className={styles.control}>
                <label>Current password</label>
                <Input icon={<Key />} set={currentPassword} get={setCurrentPassword} type='password'
                       placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
            </div>
            <div className={styles.control}>
                <label>New password</label>
                <Input icon={<Key />} set={newPassword} get={setNewPassword} type='password'
                       placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
            </div>
            <div className={styles.control}>
                <label>Confirm password</label>
                <Input icon={<Key />} set={confirmPassword} get={setConfirmPassword} type='password'
                       placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
            </div>
            <div className={styles.control}>
                <Button>Change</Button>
            </div>
        </form>
    );
}
