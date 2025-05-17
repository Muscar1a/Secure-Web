import CryptoJS from 'crypto-js';
import forge from 'node-forge';

export function decryptPrivateKey(encryptedPrivateKeyBase64, password) {
    const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKeyBase64, password);
    return decrypted.toString(CryptoJS.enc.Utf8); // Trả về chuỗi PEM gốc
}


export function decryptAESKeyWithPrivateKey(encryptedKeyBase64, privateKeyPem) {
  const encryptedBytes = forge.util.decode64(encryptedKeyBase64);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKeyBytes = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return aesKeyBytes; // binary string
}

// Hàm giải mã tin nhắn AES
export function decryptMessageWithAES(ciphertext, aesKey, ivHex) {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(forge.util.bytesToHex(aesKey)), {
    iv: CryptoJS.enc.Hex.parse(ivHex),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}