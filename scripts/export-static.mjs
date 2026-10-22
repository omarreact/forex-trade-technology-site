// Mirror generated static output for existing branch-based static hosting.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'dist');
for(const entry of fs.readdirSync(source)) fs.cpSync(path.join(source,entry),path.join(root,entry),{recursive:true});
console.log('Static output synced to repository root. Legacy previews retained.');
