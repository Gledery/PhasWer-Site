// 通用加密工具（PBKDF2 + AES-256-GCM）
// 由 data.html 和 encrypt-tool.html 共用
var CryptoUtil = (function () {
  'use strict';

  function ab2b64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function b642ab(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function deriveKey(password, salt, usages) {
    return crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    ).then(function (km) {
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        km,
        { name: 'AES-GCM', length: 256 },
        false,
        usages || ['decrypt']
      );
    });
  }

  function decryptCSV(encrypted, password) {
    var parts = encrypted.split(':');
    if (parts.length !== 3) return Promise.reject('invalid');
    var salt = b642ab(parts[0]);
    var iv = b642ab(parts[1]);
    var ciphertext = b642ab(parts[2]);
    return deriveKey(password, salt, ['decrypt']).then(function (key) {
      return crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv }, key, ciphertext
      );
    }).then(function (result) {
      return new TextDecoder().decode(result);
    });
  }

  function encryptData(plaintext, password) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(password, salt, ['encrypt', 'decrypt']).then(function (key) {
      return crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        new TextEncoder().encode(plaintext)
      ).then(function (ciphertext) {
        return ab2b64(salt) + ':' + ab2b64(iv) + ':' + ab2b64(ciphertext);
      });
    });
  }

  return {
    ab2b64: ab2b64,
    b642ab: b642ab,
    deriveKey: deriveKey,
    decryptCSV: decryptCSV,
    encryptData: encryptData
  };
})();
