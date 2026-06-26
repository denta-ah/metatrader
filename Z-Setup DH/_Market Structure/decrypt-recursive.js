const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node decrypt-recursive.js <root_folder> <password> [delete]');
  process.exit(1);
}

const root = args[0];
const password = args[1];
const deleteEnc = args[2] === 'delete';

const ITER = 200000;
const MAGIC = Buffer.from('ENC1');

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
}

function decryptBuffer(buf, password) {
  if (buf.slice(0, 4).compare(MAGIC) !== 0) {
    throw new Error('Bukan file terenkripsi valid');
  }

  const salt = buf.slice(4, 20);
  const iv = buf.slice(20, 32);
  const tag = buf.slice(32, 48);
  const ciphertext = buf.slice(48);

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
}

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    try {
      const st = fs.lstatSync(full);

      if (st.isDirectory()) {
        walk(full);
      } else if (st.isFile()) {

        const ext = path.extname(full).toLowerCase();

        // 🔥 HANYA PROSES .enc
        if (ext !== '.enc') continue;

        try {
          const data = fs.readFileSync(full);
          const plain = decryptBuffer(data, password);

          const out = full.slice(0, -4);
          fs.writeFileSync(out, plain);

          console.log('Decrypted ->', out);

          if (deleteEnc) fs.unlinkSync(full);

        } catch (e) {
          console.error('❌ Gagal decrypt:', full);
          console.error('   Penyebab:', e.message);
        }
      }
    } catch (e) {
      console.error('Error:', full, e.message);
    }
  }
}

console.log('Start decrypt...');
walk(root);
console.log('DONE');