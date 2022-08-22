import { deleteCookie, setCookie } from 'cookies-next';

export async function signIn(email, passwordHash) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    const body = JSON.stringify({ email: email, passwordHash: passwordHash });
    const response = await fetch('/api/auth/login', { method: 'POST', headers: headers, body: body });
    const data = await response.json();
    if (!response.ok) {
        console.error(data.message);
        return false
    }
    const { token, user } = data.session;
    setCookie('auth.token', token);
    setCookie('auth.encrypted-private-key-pem', user.encryptedPrivateKeyPem);
    setCookie('auth.encrypted-identity-number', user.encryptedIdentityNumber);
    setCookie('auth.encrypted-first-name', user.encryptedFirstName);
    setCookie('auth.encrypted-last-name', user.encryptedLastName);
    setCookie('auth.encrypted-email', user.encryptedEmail);
    return true;
}

export function signOut() {
    deleteCookie('auth.token');
    deleteCookie('auth.encrypted-private-key-pem');
    deleteCookie('auth.encrypted-identity-number');
    deleteCookie('auth.encrypted-first-name');
    deleteCookie('auth.encrypted-last-name');
    deleteCookie('auth.encrypted-email');
    return true;
}
