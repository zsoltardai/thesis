import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Modal from '../components/user-interface/modal';
import Input from '../components/user-interface/input';
import Button from '../components/user-interface/button';
import Key from '../components/icons/key';
import RSA from '../lib/encryption/rsa-util';
import UserDetails from '../components/profile/user-details';
import {getSession} from "../lib/auth/server";
import SessionContext from "../store/session-context";

export default function Profile() {
    const router = useRouter();
    const [keys, setKeys] = useState(null);
    const [password, setPassword] = useState('');
    const [decryptedUser, setDecryptedUser] = useState(null);
    const sessionCtx = useContext(SessionContext);
    const session = sessionCtx.session;
    const submitHandler = () => {
        const { user } = session;
        const _keys = new RSA(user.encryptedPrivateKeyPem.trim(), password);
        const identityNumber = _keys.decrypt(user.encryptedIdentityNumber.trim());
        const firstName = _keys.decrypt(user.encryptedFirstName.trim());
        const lastName = _keys.decrypt(user.encryptedLastName.trim());
        const email = _keys.decrypt(user.encryptedEmail.trim());
        setDecryptedUser({
            identityNumber: identityNumber,
            firstName: firstName,
            lastName: lastName,
            email: email
        });
        setKeys(_keys);
    };

    if (!decryptedUser) {
        return <Modal image='/auth.svg' alt='auth' onCloseClicked={() => router.replace('/')}>
            <h1>Please enter your password:</h1>
            <Input icon={<Key />} type='password' set={password} get={setPassword}
                   placeholder='&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;' />
            <Button onClick={submitHandler}>Submit</Button>
        </Modal>;
    }

    return (
      <UserDetails user={decryptedUser} setUser={setDecryptedUser} keys={keys} />
    );
}

export async function getServerSideProps(context) {
    const { req, res } = context;
    const session = await getSession({ req, res });
    if (session) return { props: { } };
    return { redirect: { destination: '/login', permanent: false } };
}
