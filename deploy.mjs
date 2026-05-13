import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  host: 'nuchevy7.beget.tech',
  port: 22,
  username: 'nuchevy7',
  password: process.env.BEGET_PASSWORD || 'ThdGCOF8hziy',
  tryKeyboard: true,
};

const remoteDir = '/home/n/nuchevy7/prostodelay.store/public_html';

const files = [
  { local: path.join(__dirname, 'index.html'), remote: '/index.html' },
  { local: path.join(__dirname, 'autoservice_it_infra_v2.pptx'), remote: '/autoservice_it_infra_v2.pptx' },
  { local: path.join(__dirname, 'privacy.html'), remote: '/privacy.html' },
  { local: path.join(__dirname, 'favicon.svg'), remote: '/favicon.svg' },
];

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, err => err ? reject(err) : resolve());
  });
}

function mkdir(sftp, dir) {
  return new Promise(resolve => sftp.mkdir(dir, () => resolve()));
}

async function deploy() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(config);
  });
  console.log('✓ SSH подключён');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  await mkdir(sftp, remoteDir);

  let done = 0;
  for (const file of files) {
    await uploadFile(sftp, file.local, path.posix.join(remoteDir, file.remote));
    done++;
    console.log(`  Загружено: ${done}/${files.length} — ${file.remote}`);
  }

  console.log('✓ Все файлы загружены на prostodelai.store!');
  conn.end();
}

deploy().catch(e => { console.error('\n✗ Ошибка:', e.message); process.exit(1); });
