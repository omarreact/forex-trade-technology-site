import fs from 'node:fs';
export const source = JSON.parse(fs.readFileSync(new URL('../data/all-14-pages-content.json', import.meta.url)));
export const design = JSON.parse(fs.readFileSync(new URL('../data/global-design-details.json', import.meta.url)));
export const patterns = JSON.parse(fs.readFileSync(new URL('../data/pages-section-patterns.json', import.meta.url)));
export const pages = source.pages;
export const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parsePage(page) {
  const hero = {title:page.h1, lines:[], ctas:[]};
  const sections = []; let active = false, section = null, item = null, footer = false;
  let label = '';
  for (const raw of page.full_text.split('\n')) {
    const line = raw.trim(); if (!line) continue;
    if (line.startsWith('Label:')) label = line.slice(6).trim();
    if (line.startsWith('H1:')) {active = true; continue;}
    if (!active) continue;
    if (line === 'Footer') { footer = true; continue; }
    if (footer) continue;
    if (line.startsWith('H2:')) {section = {title:line.slice(3).trim(), lines:[], items:[]}; sections.push(section); item = null; continue;}
    if (line.startsWith('H3:')) {item = {title:line.slice(3).trim(), lines:[]}; section?.items.push(item); continue;}
    if (line.startsWith('CTA:')) {hero.ctas.push(line.slice(4).trim()); continue;}
    if (!section) hero.lines.push(line); else (item || section).lines.push(line);
  }
  return {...page, hero, sections, label:label || 'Brokerage technology & infrastructure'};
}
export function layoutFor(page, section, index) {
  const title = section.title.toLowerCase();
  if (page.url === '/contact/' && index === 0) return 'form';
  if (title.includes('frequently asked') || (page.url === '/faq/' && section.items.length)) return 'faq';
  if (title.includes('related') || title.includes('prefer to read')) return 'related';
  if (section.lines.some(l => l.includes('→')) || /stack|fits together|everything connects|chain at a glance|environment is laid out|verification fits|payment flow/.test(title)) return 'flow';
  if (section.items.length && section.items.every(x => /^\d\d\s/.test(x.title))) return 'process';
  if (/who handles|responsibil/.test(title)) return 'responsibility';
  if (page.url === '/' && index === 0) return 'solutions';
  if (/infrastructure under|expertise|features organised|what we build|what we deliver/.test(title)) return 'features';
  if (/benefits|why brokers|what changes|why it pays/.test(title)) return 'benefits';
  if (section.items.length) return 'cards';
  if (section.lines.some(x=>x.startsWith('*'))) return 'checklist';
  return 'editorial';
}
