const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node encrypt-recursive.js <root_folder> <password> [delete]');
  process.exit(1);
}

const root = args[0];
const password = args[1];
const deleteOriginal = args[2] === 'delete';

const ITER = 200000;
const MAGIC = Buffer.from('ENC1');

function encryptBuffer(buf, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([MAGIC, salt, iv, tag, enc]);
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
        const name = path.basename(full).toLowerCase();

        // 🔥 SKIP FILE PENTING
        if (
          ext === '.enc' ||
          //ext === '.js' ||
          //ext === '.bat' ||
          name === 'encrypt-recursive.js' ||
          name === 'decrypt-recursive.js' ||
          name === 'encryptall.bat' ||
          name === 'decryptall.bat'
        ) {
          continue;
        }

        const data = fs.readFileSync(full);
        const out = encryptBuffer(data, password);
        const outpath = full + '.enc';

        fs.writeFileSync(outpath, out);
        console.log('Encrypted ->', outpath);

        if (deleteOriginal) {
          fs.unlinkSync(full);
        }
      }
    } catch (e) {
      console.error('Error:', full, e.message);
    }
  }
}

console.log('Start encrypt...');
walk(root);
console.log('DONE');