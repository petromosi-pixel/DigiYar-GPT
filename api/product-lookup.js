// DigiYar V7 — AI product comparison resolver
// Pipeline: normalize -> web discovery -> direct-page fetch -> verify/extract.
// The browser never receives the gateway key.

module.exports=async function(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
 if(!key)return res.status(503).json({error:'ai_not_configured'});
 let body={};
 try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}')}
 catch(_){return res.status(400).json({error:'invalid_json'})}
 const query=String(body.query||'').trim();
 if(!query)return res.status(400).json({error:'query_required'});

 const gateway='https://ai-gateway.vercel.sh/v1/responses';
 const model='openai/gpt-5.6-luna';

 async function ai(payload){
   const r=await fetch(gateway,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify(payload)});
   const data=await r.json().catch(()=>null);
   if(!r.ok)throw new Error('gateway:'+r.status);
   return data;
 }
 function textOf(data){
   if(data&&typeof data.output_text==='string'&&data.output_text.trim())return data.output_text.trim();
   const out=Array.isArray(data&&data.output)?data.output:[];
   const parts=[];
   out.forEach(item=>{
     (Array.isArray(item&&item.content)?item.content:[]).forEach(part=>{
       if(part&&typeof part.text==='string'&&part.text.trim())parts.push(part.text);
     });
   });
   return parts.join('').trim();
 }
 function parse(data){
   const raw=textOf(data);
   return JSON.parse(raw.replace(/^\s*\`\`\`(?:json)?/i,'').replace(/\`\`\`\s*$/,'').trim());
 }
 function cleanText(html){
   return String(html||'')
     .replace(/<script[\s\S]*?<\/script>/gi,' ')
     .replace(/<style[\s\S]*?<\/style>/gi,' ')
     .replace(/<noscript[\s\S]*?<\/noscript>/gi,' ')
     .replace(/<svg[\s\S]*?<\/svg>/gi,' ')
     .replace(/<[^>]+>/g,' ')
     .replace(/&nbsp;/gi,' ')
     .replace(/&amp;/gi,'&')
     .replace(/\s+/g,' ')
     .trim();
 }
 function validUrl(u){try{const x=new URL(String(u));return /^https?:$/.test(x.protocol)&&!!x.hostname}catch(_){return false}}
 function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(_){return ''}}

 const normalizeSchema={type:'object',properties:{
   normalizedQuery:{type:'string'},
   alternateQueries:{type:'array',items:{type:'string'}},
   requiredTerms:{type:'array',items:{type:'string'}},
   brandHint:{type:['string','null']},
   modelHint:{type:['string','null']}
 },required:['normalizedQuery','alternateQueries','requiredTerms','brandHint','modelHint'],additionalProperties:false};

 const normalizePrompt='در نقش «تحلیلگر ورودی محصول» فقط عبارت کاربر را به چند عبارت دقیق جستجو تبدیل کن. محصول را پیدا نکن و URL نساز. کوتاه‌نویسی، غلط جزئی، فارسی/انگلیسی و حذف کلمات عمومی را اصلاح کن. بخش متمایزکننده مثل برند، مدل، شماره مدل، نسل، ظرفیت و ویژگی ضروری را حفظ کن. مثال «گوشی a57» باید به عبارت‌هایی مثل «Samsung Galaxy A57 5G»، «سامسونگ Galaxy A57» و «گوشی سامسونگ A57» تبدیل شود. برای «ردمی نوت 14 پرو» نیز شکل استاندارد Xiaomi Redmi Note 14 Pro را بساز. اگر برند از عبارت به‌طور منطقی قابل استنباط نیست، آن را اختراع نکن؛ فقط شکل‌های جستجوی رایج را بساز. requiredTerms فقط هویت ضروری کالا را شامل شود. عبارت خام کاربر: '+query;

 const searchSchema={type:'object',properties:{
   candidates:{type:'array',items:{type:'object',properties:{
     title:{type:'string'},url:{type:'string'},reason:{type:'string'}
   },required:['title','url','reason'],additionalProperties:false}}
 },required:['candidates'],additionalProperties:false};

 const verifySchema={type:'object',properties:{
   verified:{type:'boolean'},
   name:{type:'string'},
   brand:{type:['string','null']},
   model:{type:['string','null']},
   priceToman:{type:['number','null']},
   availability:{type:['string','null']},
   productUrl:{type:'string'},
   store:{type:['string','null']},
   attributes:{type:'object',additionalProperties:{type:['string','number','boolean','null']}},
   confidence:{type:'number'}
 },required:['verified','name','brand','model','priceToman','availability','productUrl','store','attributes','confidence'],additionalProperties:false};

 try{
   // Stage 1 — AI normalization. This is the semantic equivalent of the Hooshyar query parser.
   const normalized=parse(await ai({
     model,input:[{type:'message',role:'user',content:normalizePrompt}],
     text:{format:{type:'json_schema',name:'digiyar_product_query',strict:true,schema:normalizeSchema}},
     max_output_tokens:500
   }));

   const queries=[normalized.normalizedQuery,...(normalized.alternateQueries||[])].map(String).map(x=>x.trim()).filter(Boolean).slice(0,4);
   // Stage 2 — AI web discovery. The model must use web search and return direct product pages only.
   const searchPrompt='محصول زیر را در وب پیدا کن. فقط صفحه مستقیم همان محصول را پیدا کن، نه صفحه جستجو، دسته‌بندی، برند یا صفحه اصلی فروشگاه. چند عبارت جستجوی داده‌شده را بررسی کن و حداکثر 5 نامزد واقعی برگردان. اگر URL به صفحه جستجو/دسته‌بندی/فروشگاه اصلی مربوط است آن را حذف کن. اگر محصولی با تطابق مستقیم پیدا نشد آرایه خالی بده. ورودی خام کاربر: '+query+'\nعبارت استاندارد: '+normalized.normalizedQuery+'\nعبارت‌های جایگزین: '+queries.join(' | ')+'\nکلمات ضروری هویت محصول: '+(normalized.requiredTerms||[]).join('، ');
   const searchData=parse(await ai({
     model,input:[{type:'message',role:'user',content:searchPrompt}],
     tools:[{type:'web_search_preview'}],
     tool_choice:'required',
     text:{format:{type:'json_schema',name:'digiyar_product_candidates',strict:true,schema:searchSchema}},
     max_output_tokens:900
   }));
   const candidates=(searchData.candidates||[]).filter(x=>x&&validUrl(x.url)).slice(0,5);
   if(!candidates.length)return res.status(422).json({error:'web_product_not_verified',stage:'discovery',normalizedQuery:normalized.normalizedQuery});

   // Stage 3 — retrieve the actual pages ourselves. This prevents the AI from returning a search URL.
   const pages=await Promise.all(candidates.map(async c=>{
     try{
       const r=await fetch(c.url,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 DigiYarProductResolver/1.0','accept':'text/html,application/xhtml+xml'}});
       if(!r.ok)return null;
       const finalUrl=r.url||c.url;
       if(!validUrl(finalUrl))return null;
       const html=await r.text();
       const text=cleanText(html).slice(0,18000);
       if(!text)return null;
       return {title:c.title,url:finalUrl,host:host(finalUrl),text};
     }catch(_){return null}
   }));
   const usable=pages.filter(Boolean);
   if(!usable.length)return res.status(422).json({error:'web_product_not_verified',stage:'page_fetch',normalizedQuery:normalized.normalizedQuery});

   // Stage 4 — AI verification/extraction against real page content.
   const pagePacket=usable.map((p,i)=>'نامزد '+(i+1)+'\nURL: '+p.url+'\nعنوان: '+p.title+'\nدامنه: '+p.host+'\nمحتوای صفحه:\n'+p.text).join('\n\n---\n\n');
   const verifyPrompt='از بین صفحات واقعی زیر، دقیقاً همان محصولی را که کاربر خواسته انتخاب و اطلاعاتش را استخراج کن. این مرحله تصمیم نهایی است. نام محصول باید با هویت درخواست کاربر تطابق داشته باشد؛ اگر «گوشی a57» است، نتیجه باید همان Samsung Galaxy A57 باشد و نه A56، A57 Ultra یا صفحه جستجوی موبایل. اگر تطابق مستقیم وجود ندارد verified=false بده. productUrl فقط URL یکی از صفحات واقعی ورودی باشد؛ هرگز URL جدید نساز. قیمت و موجودی را فقط از متن صفحه استخراج کن و در غیر این صورت null بده. attributes فقط مشخصات صریح صفحه باشند. confidence بین 0 و 1 باشد. اگر صفحه مربوط به دسته‌بندی یا نتایج جستجوست verified=false.\nدرخواست خام: '+query+'\nهویت استاندارد: '+normalized.normalizedQuery+'\nکلمات ضروری: '+(normalized.requiredTerms||[]).join('، ')+'\n\nصفحات:\n'+pagePacket;
   const verified=parse(await ai({
     model,input:[{type:'message',role:'user',content:verifyPrompt}],
     text:{format:{type:'json_schema',name:'digiyar_verified_product',strict:true,schema:verifySchema}},
     max_output_tokens:1200
   }));
   if(!verified.verified||!validUrl(verified.productUrl)||!usable.some(p=>p.url===verified.productUrl)){
     return res.status(422).json({error:'web_product_not_verified',stage:'verification',normalizedQuery:normalized.normalizedQuery});
   }
   return res.status(200).json({ok:true,product:verified,normalizedQuery:normalized.normalizedQuery});
 }catch(e){
   console.error('[DigiYar product resolver]',e&&e.message?e.message:e);
   return res.status(502).json({error:'ai_request_failed'});
 }
};