import crypto from 'crypto';
const fs = window.require('fs');

const strToMD5 = (content: string): string => {
  return crypto
    .createHash("md5")
    .update(content)
    .digest("hex");
}

/**
 * 取文本文件的MD5值
 * @param filePath 文件路径
 */
const fileToMD5 = (filePath: string): string => {
  if (!fs.existsSync(filePath)) {
    return ''
  }
  const buffer = fs.readFileSync(filePath, { encoding: 'utf-8' })
  return crypto
    .createHash("md5")
    .update(buffer)
    .digest("hex");
}

export default {
  fileToMD5,
  strToMD5,
}