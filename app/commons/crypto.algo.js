const CryptoJS = require("crypto-js");

// Encrypting simple text
exports.encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, "pixelconsultancy").toString();
}

// Decrypting simple text
exports.decrypt = (text) => {
    const bytes = CryptoJS.AES.decrypt(text, "pixelconsultancy");
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}
