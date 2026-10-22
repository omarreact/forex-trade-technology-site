(()=>{
  const themes=['current','matchtrade','b2broker','leverate','softfx','uptrader'];
  const themeButtons=[...document.querySelectorAll('[data-theme]')].filter(x=>x.tagName==='BUTTON');
  function setTheme(theme){if(!themes.includes(theme))return;document.documentElement.dataset.theme=theme;for(const name of themes)document.body.classList.remove(`theme-${name}`);document.body.classList.add(`theme-${theme}`);themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===theme)));try{localStorage.setItem('forex-theme',theme);}catch{}}
  setTheme(document.documentElement.dataset.theme||'current');
  themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.theme)));
  const toggle=document.querySelector('.menu-toggle'),panel=document.getElementById('mobile-panel');
  function closeMenu(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
  toggle?.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));});
  panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){closeMenu();toggle.focus();}if(event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable]'))return;if(/^[1-6]$/.test(event.key))setTheme(themes[Number(event.key)-1]);});
  const search=document.getElementById('faq-search');
  search?.addEventListener('input',()=>{const term=search.value.trim().toLowerCase();let count=0;document.querySelectorAll('.section-faq').forEach(section=>{let visible=0;section.querySelectorAll('details').forEach(item=>{const match=item.textContent.toLowerCase().includes(term);item.hidden=!match;item.open=!!term&&match;if(match){count++;visible++;}});section.hidden=visible===0;});document.getElementById('faq-count').textContent=term?`${count} matching answer${count===1?'':'s'}${count?'':'. Try a different term or contact our team.'}`:'';});
  const form=document.getElementById('consultation-form');
  if(!form)return;
  const status=document.getElementById('form-status'),submit=form.querySelector('[type=submit]');
  function payload(){const fields=new FormData(form);return {...Object.fromEntries(fields),interests:fields.getAll('interests')};}
  document.getElementById('download-enquiry').addEventListener('click',()=>{const data=payload();delete data.website;const text=Object.entries(data).map(([key,value])=>`${key}: ${Array.isArray(value)?value.join(', '):value}`).join('\n\n');const url=URL.createObjectURL(new Blob([`ForexTrade consultation enquiry\n\n${text}`],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='forextrade-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Enquiry saved to your device. This does not send it to our team.';});
  form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;submit.disabled=true;status.textContent='Sending your request…';try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:AbortSignal.timeout(15000)});let data;try{data=await response.json();}catch{throw new Error('Online delivery is not available on this host. Please save your enquiry and try again later.');}if(!response.ok)throw new Error(data.error||'Your request could not be sent. Please try again.');status.textContent='Your request has been delivered. Our team will review your details and get back to you.';form.reset();}catch(error){status.textContent=error.name==='TimeoutError'?'The request timed out. Delivery could not be confirmed. Please try again later.':error.message;}finally{submit.disabled=false;}});
})();
