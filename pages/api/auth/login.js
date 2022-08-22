const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
import { setCookie } from 'cookies-next';
import { connect, find } from '../../../lib/db/mongodb-util';


export default async function handler(request, response) {
    if (request.method === 'POST') {

        const { email, passwordHash } = request.body;

        if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
            response.status(400).json({ message: 'The request did not contain a valid e-mail address!' });
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
            const users = await find(client, 'users', { emailHash: emailHash });
            user = users[0];
        } catch (error) {
            response.status(500).json({ message: 'Failed to fetch users from the collection, try again later.' });
            await client.close();
            return;
        }

        if (!user) {
            response.status(400).json({ message: 'There is no user with the provided e-mail address!' })
            await client.close();
            return;
        }

        if (passwordHash !== user.passwordHash) {
            response.status(401).json({ message: 'Unauthorized.' });
            await client.close();
            return;
        }

        const privateKey = fs.readFileSync(path.join(process.cwd(), 'key.key'));

        const payload = {
            emailHash: emailHash,
            identityNumberHash: user.identityNumberHash,
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

        const session = {
          token: token,
          user: {
              encryptedIdentityNumber: user.encryptedIdentityNumber,
              encryptedEmail: user.encryptedEmail,
              encryptedFirstName: user.encryptedFirstName,
              encryptedLastName: user.encryptedLastName,
              encryptedPrivateKeyPem: user.encryptedPrivateKeyPem
          }
        };

        response.status(200).json({ message: 'You successfully logged in!', session: session  });
        await client.close();
        return;
    }

    response.status(405).json({ message: 'Only POST requests are allowed!' });
}