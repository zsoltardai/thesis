const CryptoJS = require('crypto-js');

export default class AESCipher {

    key;
    block_size;

    constructor(key) {
    	this.block_size = 16;
    	this.key = CryptoJS.SHA256(key);
    }

    __pad(plain_text) {
    	let number_of_bytes_to_pad = this.block_size - plain_text.length % this.block_size;
    	let ascii_string = this.__chr(number_of_bytes_to_pad);
    	let padding_str = ascii_string.repeat(number_of_bytes_to_pad);
    	return `${plain_text}${padding_str}`;
    }

    __unpad(plain_text) {
    	let bytes_to_remove = plain_text.charCodeAt(plain_text.length -1);
    	return plain_text.substring(0, plain_text.length - bytes_to_remove);
    }

    __chr(charCode) {
    	return (charCode < 0 || charCode > 126) ? '�' : String.fromCharCode(charCode);
    }

    __base64ToArrayBuffer(base64) {
    	let binary_string = window.atob(base64);
    	let len = binary_string.length;
    	let bytes = new Uint8Array(len);
    	for (let i = 0; i < len; i++) {
    		bytes[i] = binary_string.charCodeAt(i);
    	}
    	return bytes.buffer;
    }

    __arrayBufferToBase64(buffer) {
    	let binary = '';
    	let bytes = new Uint8Array(buffer);
    	let len = bytes.byteLength;
    	for (let i = 0; i < len; i++) {
    		binary += String.fromCharCode(bytes[i]);
    	}
    	return window.btoa(binary);
    }

    __buf2hex(buffer) {
    	return [...new Uint8Array(buffer)]
    		.map(x => x.toString(16).padStart(2, '0'))
    		.join('');
    }

    __hexStringToArrayBuffer(hex) {
    	return new Uint8Array(hex.match(/../g).map(h=>parseInt(h,16))).buffer;
    }

    __appendBuffer(buffer1, buffer2) {
    	let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    	tmp.set(new Uint8Array(buffer1), 0);
    	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    	return tmp.buffer;
    }

    encrypt(plain_text) {
    	plain_text = this.__pad(plain_text);
    	let iv = CryptoJS.lib.WordArray.random(16);
    	let encrypted_text = CryptoJS.AES.encrypt(plain_text, this.key, {
    		iv: iv,
    		mode: CryptoJS.mode.CBC,
    		padding: CryptoJS.pad.NoPadding
    	}).toString();
    	let buffer = this.__hexStringToArrayBuffer(iv.toString(CryptoJS.enc.Hex));
    	return this.__arrayBufferToBase64(this.__appendBuffer(buffer, this.__base64ToArrayBuffer(encrypted_text)));
    }

    decrypt(encrypted_text) {
    	let arrayBuffer = this.__base64ToArrayBuffer(encrypted_text);
    	let iv = CryptoJS.enc.Hex.parse(this.__buf2hex(arrayBuffer.slice(0, 16)));
    	let encryptedText = this.__arrayBufferToBase64(arrayBuffer.slice(16, arrayBuffer.byteLength));
    	let plain_text = CryptoJS.AES.decrypt(encryptedText, this.key, {
    		iv: iv,
    		mode: CryptoJS.mode.CBC,
    		padding: CryptoJS.pad.NoPadding
    	}).toString(CryptoJS.enc.Utf8);
    	return this.__unpad(plain_text);
    }
}
