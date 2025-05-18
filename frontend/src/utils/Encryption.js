import CryptoJS from "crypto-js";
import forge from "node-forge";

// Tạo AES key và IV
export const generateAESKeyAndIV = () => {
  const key = forge.random.getBytesSync(32); // 256-bit key
  const iv = forge.random.getBytesSync(16);  // 128-bit IV
  return { key, iv };
};

// Mã hóa tin nhắn bằng AES
export const encryptMessageWithAES = (message, key, iv) => {
  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(forge.util.bytesToHex(key)), {
    iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(iv)),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString(); // base64
};

// Mã hóa AES key bằng RSA public key
export const encryptAESKeyWithRSA = (aesKey, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return forge.util.encode64(encryptedKey);
};


function convertBinaryToPEM(binaryData, label) {
    const base64String = window.btoa(String.fromCharCode(...new Uint8Array(binaryData)));
    const formatted = base64String.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}


function encryptPrivateKey(privateKeyPem, password) {
    return CryptoJS.AES.encrypt(privateKeyPem, password).toString(); // base64
}

export async function generateAndEncryptRSAKeyPair(password) {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyPem = convertBinaryToPEM(publicKeyBuffer, "PUBLIC KEY");
    const privateKeyPem = convertBinaryToPEM(privateKeyBuffer, "PRIVATE KEY");

    const encryptedPrivateKeyPem = encryptPrivateKey(privateKeyPem, password);

    return {
        publicKeyPem,
        encryptedPrivateKeyPem, // lưu lên server
    };
}
