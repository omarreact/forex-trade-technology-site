const allowedInterests=new Set(['MT5 White Label','MT5 Grey Label','MT4 White Label','CRM','Website','Liquidity','Hosting','Turnkey','API','Other']);
const allowedStages=new Set(['','Planning','Preparing to Launch','Existing Broker','Scaling']);
export function validateEnquiry(body){
  if(!body||typeof body!=='object'||Array.isArray(body))return {error:'Invalid request.'};
  const data={};
  for(const field of ['name','email','company','country','phone','stage','message','website']){
    if(body[field]!==undefined&&typeof body[field]!=='string')return {error:`Invalid ${field}.`};
    data[field]=(body[field]||'').trim();
    if(data[field].length>(field==='message'?5000:field==='email'?254:120))return {error:`${field} is too long.`};
  }
  if(data.website)return {error:'Unable to accept this request.'};
  if(data.name.length<2)return {error:'Please enter your name (at least two characters).'};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))return {error:'Please enter a valid business email.'};
  if(!allowedStages.has(data.stage))return {error:'Please choose a valid business stage.'};
  if(!Array.isArray(body.interests)||body.interests.length>10||body.interests.some(x=>!allowedInterests.has(x)))return {error:'Please choose valid interests.'};
  delete data.website;data.interests=[...new Set(body.interests)];return {data};
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Method not allowed.'});}
  const origin=req.headers.origin;
  if(origin){let host;try{host=new URL(origin).host;}catch{return send(403,{error:'Invalid origin.'});}if(host!==req.headers.host)return send(403,{error:'Cross-origin submissions are not accepted.'});}
  let body=req.body;
  try{if(typeof body==='string'){if((req.headers['content-type']||'').includes('application/x-www-form-urlencoded')){const fields=new URLSearchParams(body);body={...Object.fromEntries(fields),interests:fields.getAll('interests')};}else body=JSON.parse(body);}}catch{return send(400,{error:'Invalid request body.'});}
  if(Buffer.byteLength(JSON.stringify(body??{}))>16000)return send(413,{error:'Request is too large.'});
  const result=validateEnquiry(body);if(result.error)return send(400,result);
  const endpoint=process.env.CONTACT_WEBHOOK_URL;
  if(!endpoint)return send(503,{error:'Online enquiry delivery is not configured yet. Please save your enquiry and try again later.'});
  try{
    if(new URL(endpoint).protocol!=='https:')throw new Error('Webhook requires HTTPS');
    const response=await fetch(endpoint,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(process.env.CONTACT_WEBHOOK_TOKEN?{'Authorization':`Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({source:'forextrade-website',submittedAt:new Date().toISOString(),...result.data}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('Delivery failed');
    return send(200,{ok:true});
  }catch{return send(502,{error:'Delivery could not be confirmed. Your form is preserved; please try again later.'});}
}
