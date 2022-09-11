import CryptoJS from 'crypto-js';

export default class AESCipher {
	key;
	block_size;
	constructor(key) {
		this.block_size = 16;
		this.key = CryptoJS.SHA256(key);
	}
	#pad(plainText) {
		const numberOfBytesToPad = this.block_size - plainText.length % this.block_size;
		const ASCIIString = this.#chr(numberOfBytesToPad);
		const paddingString = ASCIIString.repeat(numberOfBytesToPad);
		return `${plainText}${paddingString}`;
	}
	#unpad(plainText) {
		const bytesToRemove = plainText.charCodeAt(plainText.length -1);
		return plainText.substring(0, plainText.length - bytesToRemove);
	}
	#chr(charCode) {
		return (
			(charCode < 0 || charCode > 126)
				?
				'�'
				:
				String.fromCharCode(charCode)
		);
	}
	#base64ToArrayBuffer(base64) {
		let binaryString = atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}
	#arrayBufferToBase64(buffer) {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}
	#buf2hex(buffer) {
		return [...new Uint8Array(buffer)]
			.map(x => x.toString(16).padStart(2, '0'))
			.join('');
	}
	#hexStringToArrayBuffer(hex) {
		return new Uint8Array(hex.match(/../g)
			.map(h=>parseInt(h,16))).buffer;
	}
	#appendBuffer(buffer1, buffer2) {
		const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
		tmp.set(new Uint8Array(buffer1), 0);
		tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
		return tmp.buffer;
	}
	encrypt(plainText) {
		plainText = this.#pad(plainText);
		const iv = CryptoJS.lib.WordArray.random(16);
		const encryptedText = CryptoJS.AES.encrypt(plainText, this.key, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.NoPadding
		}).toString();
		const buffer = this.#hexStringToArrayBuffer(iv.toString(CryptoJS.enc.Hex));
		return this.#arrayBufferToBase64(this.#appendBuffer(buffer, this.#base64ToArrayBuffer(encryptedText)));
	}
	decrypt(plainText) {
		const arrayBuffer = this.#base64ToArrayBuffer(plainText);
		const iv = CryptoJS.enc.Hex.parse(this.#buf2hex(arrayBuffer.slice(0, 16)));
		const encryptedText = this.#arrayBufferToBase64(arrayBuffer.slice(16, arrayBuffer.byteLength));
		let decryptedText = CryptoJS.AES.decrypt(encryptedText, this.key, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.NoPadding
		}).toString(CryptoJS.enc.Utf8);
		return this.#unpad(decryptedText);
	}
}