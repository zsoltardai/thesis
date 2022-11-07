import AESCipher from './aes-cipher.js';
import forge from 'node-forge';

export default class RSA {
	#privateKey;
	#publicKey;
	constructor (pem = null, passphrase = null) {
		if (pem === null) {
			const keys = this.#generate();
			this.#privateKey = keys.privateKey;
			this.#publicKey = keys.publicKey;
			return;
		}
		if (passphrase === null) {
			try {
				this.#privateKey = forge.pki.privateKeyFromPem(pem);
				this.#publicKey = forge.pki.setRsaPublicKey(this.#privateKey.n, this.#privateKey.e);
				return;
			}
			catch (error) {
				console.error(error);
			}
		}
		const cipher = new AESCipher(passphrase);
		const decryptedPrivateKeyPem = cipher.decrypt(pem);
		this.#privateKey = forge.pki.privateKeyFromPem(decryptedPrivateKeyPem);
		this.#publicKey = forge.pki.setRsaPublicKey(this.#privateKey.n, this.#privateKey.e);
	}
	#generate() {
		return forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
	}
	getPrivateKeyPem(passphrase = null) {
		if (passphrase === null) {
			return forge.pki.privateKeyToPem(this.#privateKey);
		}
		const cipher = new AESCipher(passphrase);
		return cipher.encrypt(forge.pki.privateKeyToPem(this.#privateKey));
	}
	getPublicKeyPem() {
		return forge.pki.publicKeyToPem(this.#publicKey);
	}
	encrypt(plainText) {
		const bytes = Buffer.from(plainText, 'utf-8');
		return btoa(this.#publicKey.encrypt(bytes));
	}
	decrypt(encryptedText) {
		encryptedText = atob(encryptedText);
		return this.#privateKey.decrypt(encryptedText);
	}
	verify(message, signature) {
		const md = forge.md.sha512.create();
		md.update(message, 'utf8');
		return this.#publicKey.verify(md.digest().getBytes(), forge.util.decode64(signature));
	}
	sign(message) {
		const md = forge.md.sha512.create();
		md.update(message, 'utf8');
		return forge.util.encode64(this.#privateKey.sign(md));
	}
	static verify(publicKeyPem, message, signature) {
		const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
		const md = forge.md.sha512.create();
		md.update(message, 'utf8');
		try {
			return publicKey.verify(md.digest().getBytes(), forge.util.decode64(signature));
		} catch (error) {
			return null;
		}
	}
}
