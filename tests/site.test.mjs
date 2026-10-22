import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pages,parsePage,esc} from '../src/content.mjs';
import handler,{validateEnquiry} from '../api/contact.js';
const root=path.resolve(import.meta.dirname,'../dist');
const valid={name:'Test User',email:'test@example.com',interests:['CRM'],stage:'Planning',message:'Test enquiry'};
for(const page of pages)test(`${page.name}: complete headings, metadata and internal links`,()=>{
 const html=fs.readFileSync(path.join(root,page.url,'index.html'),'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.ok(html.includes(`<title>${esc(page.seo_title)}</title>`));
 assert.ok(html.includes(esc(page.meta_description)));
 assert.ok(html.includes('Risk disclosure.'));
 for(const section of parsePage(page).sections){assert.ok(html.includes(esc(section.title)),`Missing section ${section.title}`);for(const item of section.items)assert.ok(html.includes(esc(item.title.replace(/^\d\d\s/,''))),`Missing heading ${item.title}`);}
 for(const match of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)){
   const url=match[1];if(!url.startsWith('/'))continue;
   const file=path.join(root,url);assert.ok(fs.existsSync(file),`Broken internal link ${url}`);
 }
});
test('all narrative content is preserved (excluding form labels and shared footer)',()=>{
 for(const page of pages){const html=fs.readFileSync(path.join(root,page.url,'index.html'),'utf8');const parsed=parsePage(page);
   for(const section of parsed.sections){if(page.url==='/contact/'&&section===parsed.sections[0])continue;
    for(const line of [...section.lines,...section.items.flatMap(x=>x.lines)]){
     if(line.includes('→')){for(const part of line.split('→'))assert.ok(html.includes(esc(part.trim())),`${page.name}: ${part}`);}
     else assert.ok(html.includes(esc(line.replace(/^\*\s*/,''))),`${page.name}: lost content: ${line}`);
    }
   }
 }
});
test('additional directory, 404, sitemap and theme tokens exist',()=>{
 assert.ok(fs.existsSync(path.join(root,'solutions/index.html')));assert.ok(fs.existsSync(path.join(root,'404.html')));
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<url>/g)||[]).length,14);
 const css=fs.readFileSync(path.join(root,'assets/themes.css'),'utf8');for(const theme of ['current','matchtrade','b2broker','leverate','softfx','uptrader'])assert.ok(css.includes(`[data-theme="${theme}"]`));
});
test('enquiry validation rejects bad, oversized and spam inputs',()=>{
 assert.ok(validateEnquiry(valid).data);
 for(const change of [{name:''},{email:'bad'},{interests:['unknown']},{website:'spam'},{stage:'unknown'},{message:'x'.repeat(5001)},{name:{}}])assert.ok(validateEnquiry({...valid,...change}).error);
});
async function request(body=valid,headers={},method='POST'){
 let status,output;const res={setHeader(){},set statusCode(x){status=x},end(x){output=JSON.parse(x)}};
 await handler({method,headers:{host:'localhost',...headers},body},res);return {status,output};
}
test('contact fails honestly without configuration; does not send to third parties',async()=>{
 const prior=process.env.CONTACT_WEBHOOK_URL;delete process.env.CONTACT_WEBHOOK_URL;
 try{assert.equal((await request()).status,503);assert.equal((await request(valid,{origin:'https://other.example'})).status,403);assert.equal((await request(valid,{},'GET')).status,405);assert.equal((await request({})).status,400);}finally{if(prior)process.env.CONTACT_WEBHOOK_URL=prior;}
});
test('contact success requires a successful webhook response',async()=>{
 const oldFetch=globalThis.fetch,prior=process.env.CONTACT_WEBHOOK_URL;process.env.CONTACT_WEBHOOK_URL='https://test.example/webhook';let sent;
 try{globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true};};assert.equal((await request()).status,200);assert.equal(sent.email,valid.email);assert.equal(sent.website,undefined);
 globalThis.fetch=async()=>({ok:false});assert.equal((await request()).status,502);
 }finally{globalThis.fetch=oldFetch;if(prior)process.env.CONTACT_WEBHOOK_URL=prior;else delete process.env.CONTACT_WEBHOOK_URL;}
});
