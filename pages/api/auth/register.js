const md5 = require('md5');
import { connect, find, insert } from '../../../lib/db/mongodb-util';

export default async function handler(request, response) {
    if (request.method === 'POST') {

        const { identityNumber, encryptedIdentityNumber, email, encryptedEmail, encryptedFirstName,
            encryptedLastName, encryptedPrivateKeyPem, passwordHash } = request.body;

        if (!identityNumber || !(/^[0-9]{6}[A-Z]{2}$/).test(identityNumber)) {
            response.status(400).json({ message: 'The provided identity number is invalid!' });
            return;
        }

        const identityNumberHash = md5(identityNumber);

        if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
            response.status(400).json({ message: 'The provided email address is invalid!' });
            return;
        }

        let client;

        try {
            client = await connect();
        } catch (error) {
            response.status(500).json({ message: 'Failed to connect to the database, try again later.' });
            return;
        }

        let user;

        try {
            const users = await find(client, 'users', { identityNumberHash: identityNumberHash });
            user = users[0];
        } catch (error) {
            response.status(500).json({ message: 'Failed to fetch users from the users collection.' });
            await client.close();
            return;
        }

        if (user) {
            response.status(409).json({ message: 'There is already a user with this identity number.' });
            await client.close();
            return;
        }

        const emailHash = md5(email);

        user = {
            identityNumberHash: identityNumberHash,
            encryptedIdentityNumber: encryptedIdentityNumber,
            emailHash: emailHash,
            encryptedEmail: encryptedEmail,
            encryptedFirstName: encryptedFirstName,
            encryptedLastName: encryptedLastName,
            encryptedPrivateKeyPem: encryptedPrivateKeyPem,
            passwordHash: passwordHash
        };

        user._id = md5(JSON.stringify(user));

        try {
            await insert(client, 'users', user);
        } catch(error) {
            response.status(500).json({ message: 'Failed to create a new user, try again later.' });
            await client.close();
            return;
        }

        response.status(201).json({ message: 'User created successfully!' });
        await client.close();
        return;
    }

    response.status(405).json({ message: 'Only POST requests are allowed!' });
}
