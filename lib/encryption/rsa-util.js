import AESCipher from './aes-cipher-util';
const forge = require('node-forge');
const CryptoJS = require('crypto-js');


export default class RSA {

    privateKey;
    publicKey;

    constructor (pem = null, passphrase = null) {
    	if (pem === null) {
    		let keys = this._generate();
    		this.privateKey = keys.privateKey;
    		this.publicKey = keys.publicKey;
    		return;
    	}
    	if (passphrase === null) {
    		try {
    			this.privateKey = forge.pki.privateKeyFromPem(pem);
    			this.publicKey = forge.pki.setRsaPublicKey(this.privateKey.n, this.privateKey.e);
    		}
    		catch (error) {
    			console.error(error);
    		}
    	}
    	let cipher = new AESCipher(passphrase);
    	let decryptedPrivateKeyPem = cipher.decrypt(pem);
    	this.privateKey = forge.pki.privateKeyFromPem(decryptedPrivateKeyPem);
    	this.publicKey = forge.pki.setRsaPublicKey(this.privateKey.n, this.privateKey.e);
    }

    _generate () {
    	return forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
    }

    getPrivateKeyPem (passphrase = null) {
    	if (passphrase === null) {
    		return forge.pki.privateKeyToPem(this.privateKey);
    	}
    	let cipher = new AESCipher(passphrase);
    	return cipher.encrypt(forge.pki.privateKeyToPem(this.privateKey));
    }

    getPublicKeyPem () {
    	return forge.pki.publicKeyToPem(this.publicKey);
    }

    encrypt (plainText) {
    	let bytes = Buffer.from(plainText, 'utf-8');
    	return btoa(this.publicKey.encrypt(bytes));
    }

    decrypt (encryptedText) {
    	encryptedText = atob(encryptedText);
    	return this.privateKey.decrypt(encryptedText);
    }
}
