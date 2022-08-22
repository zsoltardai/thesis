const md5 = require('md5');
import { getSession } from '../../../lib/auth/server';
import { connect, find, update } from '../../../lib/db/mongodb-util';
const jwt = require('jsonwebtoken');
import { setCookie } from 'cookies-next';
const fs = require('fs');
const path = require('path');

export default async function handler(request, response) {
    if (request.method === 'PUT') {

        const { email, encryptedEmail } = request.body;

        const { token, _ } = await getSession({ req: request, res: response });

        if (!token) {
            response.status(401).json({ message: 'Unauthorized.' });
            return;
        }

        if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
            response.status(400).json({ message: 'The provided e-mail address was invalid!' });
            return;
        }

        if (!encryptedEmail || encryptedEmail.trim() === '') {
            response.status(400).json({ message: 'The provided encrypted e-mail was invalid!' });
            return;
        }

        const emailHash = md5(email);

        let client;

        try {
            client = await connect();
        } catch (error) {
            response.status(500).json({ message: 'Failed to connect to the database, try again later.' });
            return;
        }

        let user;

        try {
            const users = await find(client, 'users', { emailHash: token.emailHash });
            user = users[0];
        } catch (error){
            response.status(500).json({ message: 'Failed to fetch users from the collection.' });
        }

        if (!user) {
            response.status(404).json({ message: 'There is no user with the provided e-mail address!' });
            await client.close();
            return;
        }

        user.emailHash = emailHash;

        user.encryptedEmail = encryptedEmail;

        try {
            await update(client, 'users', user._id, {
                encryptedEmail: encryptedEmail,
                emailHash: emailHash
            });
        } catch (error) {
            response.status(500).json({ message: 'Failed to update the e-mail address for the user!' });
            await client.close();
            return;
        }

        const payload = {
            emailHash: emailHash,
            identityNumberHash: user.identityNumberHash,
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const privateKey = fs.readFileSync(path.join(process.cwd(), 'key.key'));

        const _token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

        const cookies = [
            'auth.token=' + _token + ';',
            'auth.encrypted-email' + encryptedEmail + ';'
        ];

        response.status(204).setHeader('Set-Cookie', cookies).send();
        await client.close();
        return;
    }

    response.status(405).json({ message: 'Only PUT requests are allowed!' });
}