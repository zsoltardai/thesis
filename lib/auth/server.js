const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
import { getCookie } from 'cookies-next';

const getDecodedToken = async (token) => {
    const publicKey = fs.readFileSync(path.join(process.cwd(), 'key.pub'));
    return new Promise((resolve, _) => {
        jwt.verify(token, publicKey, {}, (err, decoded) => (!err) && resolve(decoded));
        resolve(null);
    });
};

export async function getSession(options) {
    let user = {}; let token = getCookie('auth.token', options);
    user['encryptedIdentityNumber'] = getCookie('auth.encrypted-identity-number', options);
    user['encryptedEmail'] = getCookie('auth.encrypted-email', options);
    user['encryptedFirstName'] = getCookie('auth.encrypted-first-name', options);
    user['encryptedLastName'] = getCookie('auth.encrypted-last-name', options);
    user['encryptedPrivateKeyPem'] = getCookie('auth.encrypted-private-key-pem', options);
    if (user === {} || token === undefined) return null;
    token = await getDecodedToken(token);
    return { token, user };
}
