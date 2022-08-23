import { COOKIES } from './client';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

export async function getSession(options) {
	let user = {}; let token = getCookie('auth.token', options) || null;
	Object.keys(COOKIES)
		.forEach(key => {
			if (key !== 'token') {
				user[key] = getCookie(COOKIES[key], options) || null;
			}
		});
	if (Object.keys(user).some(key => user[key] === null) || token === undefined) return null;
	try {
		token = await (() => {
			const key = fs.readFileSync(path.join(process.cwd(), 'key.pub'));
			return new Promise((resolve, reject) => {
				jwt.verify(token, key, {}, (error, decoded) => {
					if (!error) resolve(decoded);
					reject(error);
				});
				resolve(null);
			});
		})();
	} catch (error) {
		return null;
	}
	return { token, user };
}
