import crypto from 'crypto';
import { offsetVector, securityKey } from './security';

/**
 * @CryptoUtil 加密、解密工具类
 */
const CryptoUtil = {
  // 解密
  decrypt: (data: string, key: string, offset: string) => {
    const cipherChunks = [];
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, offset);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
    cipherChunks.push(decipher.final('utf8'));
    return cipherChunks.join('');
  },

  // 加密
  encrypt: (data: string, key: string, offset: string) => {
    const cipherChunks = [];
    const cipher = crypto.createCipheriv('aes-128-cbc', key, offset);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
    cipherChunks.push(cipher.final('base64'));
    return cipherChunks.join('');
  }
}

export default {
  decrypt: (data: string) => CryptoUtil.decrypt(data, securityKey, offsetVector),
  encrypt: (data: string) => CryptoUtil.encrypt(data, securityKey, offsetVector)
};