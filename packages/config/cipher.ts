import crypto from 'crypto';
const algorithm = 'aes-192-cbc';

const iv = Uint8Array.from([
  251,
  71,
  41,
  207,
  182,
  128,
  196,
  139,
  211,
  186,
  45,
  173,
  222,
  113,
  50,
  134,
]);

export function encrypt(data: object, password: string) {
  const key = crypto.scryptSync(password, 'salt', 24);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

export function decrypt(encrypted: string, password: string) {
  const key = crypto.scryptSync(password, 'salt', 24);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}
