const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const git = args => execFileSync('git',args,{encoding:'utf8',maxBuffer:10*1024*1024});
const objects = git(['rev-list','--objects','--all']).trim().split(/\r?\n/);
let blobs=0;
const flags=[];
const patterns=[/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\bsb_secret_[A-Za-z0-9_-]{12,}\b/,/\bAKIA[A-Z0-9]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}/];
function scan(text,label) {
  if(patterns.some(p=>p.test(text))) flags.push(label);
  for(const m of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try {if(JSON.parse(Buffer.from(m[1],'base64url')).role==='service_role') flags.push(label);}
    catch {}
  }
}
for(const row of objects) {
  const sha=row.split(' ')[0];
  if(git(['cat-file','-t',sha]).trim()!=='blob') continue;
  blobs++;
  scan(git(['cat-file','-p',sha]),`historical blob ${sha}`);
}
const files=git(['ls-files','--cached','--others','--exclude-standard','-z']).split('\0').filter(Boolean);
let shellBytes=0,gzipBytes=0;
for(const file of files) {
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()) continue;
  const data=fs.readFileSync(file);
  if(file!=='tests/audit.cjs')scan(data.toString('utf8'),`working file ${file}`);
  if(/^(?:index\.html|icon\.svg|service-worker\.js|manifest\.webmanifest|js\/|css\/|fonts\/.*\.ttf$)/.test(file.replaceAll('\\','/'))) {
    shellBytes+=data.length;gzipBytes+=zlib.gzipSync(data).length;
  }
}
console.log(JSON.stringify({historicalBlobs:blobs,suspectedSecretLocations:[...new Set(flags)],
  staticShellBytes:shellBytes,staticShellGzipBytes:gzipBytes},null,2));
if(flags.length) process.exitCode=1;
