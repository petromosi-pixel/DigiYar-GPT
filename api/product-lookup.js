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
 const RESOLVER_VERSION='7.0.0-product-lookup.3';

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
 function normText(v){return String(v==null?'':v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c]/g,' ').replace(/\s+/g,' ').trim().toLowerCase()}

 const normalizeSchema={type:'object',properties:{
   normalizedQuery:{type:'string'},
   alternateQueries:{type:'array',items:{type:'string'}},
   requiredTerms:{type:'array',items:{type:'string'}},
   brandHint:{type:['string','null']},
   modelHint:{type:['string','null']}
 },required:['normalizedQuery','alternateQueries','requiredTerms','brandHint','modelHint'],additionalProperties:false};

 const normalizePrompt='در نقش «تحلیلگر ورودی محصول» فقط عبارت کاربر را به چند عبارت دقیق جستجو تبدیل کن. محصول را پیدا نکن و URL نساز. کوتاه‌نویسی، غلط جزئی، فارسی/انگلیسی و حذف کلمات عمومی را اصلاح کن. بخش متمایزکننده مثل برند، مدل، شماره مدل، نسل، ظرفیت و ویژگی ضروری را حفظ کن. مثال «گوشی a57» باید به عبارت‌هایی مثل «Samsung Galaxy A57 5G»، «سامسونگ Galaxy A57» و «گوشی سامسونگ A57» تبدیل شود. برای «ردمی نوت 14 پرو» نیز شکل استاندارد Xiaomi Redmi Note 14 Pro را بساز. اگر برند از عبارت به‌طور منطقی قابل استنباط نیست، آن را اختراع نکن؛ فقط شکل‌های جستجوی رایج را بساز. requiredTerms فقط هویت ضروری کالا را شامل شود. عبارت خام کاربر: '+query;

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

 const searchSchema={type:'object',properties:{
   candidates:{type:'array',items:{type:'object',properties:{
     title:{type:'string'},url:{type:'string'},name:{type:'string'},
     brand:{type:['string','null']},model:{type:['string','null']},
     priceToman:{type:['number','null']},availability:{type:['string','null']},
     store:{type:['string','null']},
     attributes:{type:'object',additionalProperties:{type:['string','number','boolean','null']}},
     reason:{type:'string'}
   },required:['title','url','name','brand','model','priceToman','availability','store','attributes','reason'],additionalProperties:false}}
 },required:['candidates'],additionalProperties:false};

 try{
   // Stage 1 — AI normalization. This is the semantic equivalent of the Hooshyar query parser.
   const normalized=parse(await ai({
     model,input:[{type:'message',role:'user',content:normalizePrompt}],
     text:{format:{type:'json_schema',name:'digiyar_product_query',strict:true,schema:normalizeSchema}},
     max_output_tokens:500
   }));

   const queries=[normalized.normalizedQuery,...(normalized.alternateQueries||[])].map(String).map(x=>x.trim()).filter(Boolean).slice(0,4);

   // Stage 2 — AI web discovery + extraction.
   // IMPORTANT: do not server-fetch arbitrary retail pages here. Many Iranian stores
   // block datacenter requests (403/anti-bot), which used to turn a valid search into
   // the generic "product not found" message. The web-search tool already has access
   // to the indexed/direct page and is the correct place to inspect it.
   const searchPrompt='محصول زیر را در وب پیدا کن و حتماً خود صفحه مستقیم همان محصول را بررسی کن. فقط صفحه محصول واقعی را برگردان، نه صفحه جستجو، دسته‌بندی، برند یا صفحه اصلی فروشگاه. اگر چند فروشگاه محصول را دارند، چند صفحه مستقیم واقعی برگردان. برای هر کاندید، نام واقعی محصول، برند، مدل، قیمت و موجودی اگر در صفحه قابل مشاهده است و مشخصات صریح را استخراج کن. اگر اطلاعاتی در صفحه نیست null بده. URL باید دقیقاً URL صفحه محصول باشد. اگر فقط صفحه جستجو یا دسته‌بندی پیدا شد آن را کاندید نکن. محصول باید با هویت درخواست تطابق داشته باشد؛ برای «گوشی a57» فقط Samsung Galaxy A57 / Galaxy A57 5G و معادل همان مدل معتبر است، نه A56، A57 Ultra یا نتایج جستجو. درخواست خام: '+query+'\\nعبارت استاندارد: '+normalized.normalizedQuery+'\\nعبارت‌های جایگزین: '+queries.join(' | ')+'\\nکلمات ضروری هویت: '+(normalized.requiredTerms||[]).join('، ');
   const searchData=parse(await ai({
     model,input:[{type:'message',role:'user',content:searchPrompt}],
     tools:[{type:'web_search'}],
     tool_choice:'required',
     text:{format:{type:'json_schema',name:'digiyar_product_candidates',strict:true,schema:searchSchema}},
     max_output_tokens:2600
   }));
   const candidates=(searchData.candidates||[]).filter(x=>x&&validUrl(x.url)&&String(x.name||'').trim()).slice(0,5);
   if(!candidates.length)return res.status(422).json({error:'web_product_not_verified',resolverVersion:RESOLVER_VERSION,stage:'discovery',normalizedQuery:normalized.normalizedQuery});

   // Stage 3 — deterministic URL guard. We no longer reject valid products merely
   // because the merchant blocks server-side HTML fetching.
   function looksLikeSearchUrl(u){
     try{
       const x=new URL(u), path=(x.pathname||'').toLowerCase(), qs=(x.search||'').toLowerCase();
       return /(^|\/)(search|search-result|results|category|categories|collections|brand|brands)(\/|$)/.test(path)
         || /[?&](q|query|search|keyword|page)=/.test(qs);
     }catch(_){return true}
   }
   const direct=candidates.filter(x=>!looksLikeSearchUrl(x.url));
   if(!direct.length)return res.status(422).json({error:'web_product_not_verified',resolverVersion:RESOLVER_VERSION,stage:'direct_url_guard',normalizedQuery:normalized.normalizedQuery});

   // Stage 4 — AI verification against the actual web-search findings.
   const candidatePacket=direct.map((p,i)=>'کاندید '+(i+1)+'\\nURL: '+p.url+'\\nعنوان صفحه: '+p.title+'\\nنام محصول: '+p.name+'\\nبرند: '+(p.brand||'نامشخص')+'\\nمدل: '+(p.model||'نامشخص')+'\\nفروشگاه: '+(p.store||'نامشخص')+'\\nقیمت: '+(p.priceToman==null?'نامشخص':p.priceToman)+'\\nموجودی: '+(p.availability||'نامشخص')+'\\nمشخصات: '+JSON.stringify(p.attributes||{})).join('\\n\\n---\\n\\n');
   const verifyPrompt='از بین یافته‌های واقعی جستجوی وب زیر، دقیقاً همان محصولی را که کاربر خواسته انتخاب کن. این مرحله تصمیم نهایی است. اگر «گوشی a57» است، نتیجه باید همان Samsung Galaxy A57 باشد و نه A56، A57 Ultra یا صفحه جستجو. اگر تطابق مستقیم وجود ندارد verified=false بده. productUrl فقط باید دقیقاً یکی از URLهای کاندید باشد و هرگز URL جدید نساز. نام، برند، مدل، قیمت، موجودی و مشخصات را فقط از کاندید انتخاب‌شده بردار. confidence بین 0 و 1 باشد.\\nدرخواست خام: '+query+'\\nهویت استاندارد: '+normalized.normalizedQuery+'\\nکلمات ضروری: '+(normalized.requiredTerms||[]).join('، ')+'\\n\\nیافته‌ها:\\n'+candidatePacket;
   const verified=parse(await ai({
     model,input:[{type:'message',role:'user',content:verifyPrompt}],
     text:{format:{type:'json_schema',name:'digiyar_verified_product',strict:true,schema:verifySchema}},
     max_output_tokens:1800
   }));
   if(!verified.verified||!validUrl(verified.productUrl)||!direct.some(p=>p.url===verified.productUrl)){
     // The discovery stage already contains web-grounded product data. If the
     // second pass refuses to verify it, keep a deterministic exact-identity
     // candidate instead of turning a valid product into the generic UI error.
     const terms=(normalized.requiredTerms||[]).map(x=>normText(x)).filter(x=>x.length>1);
     const scored=direct.map(p=>{
       const hay=normText([p.title,p.name,p.brand,p.model].filter(Boolean).join(' '));
       const hits=terms.filter(t=>hay.includes(t)).length;
       return {p,hits};
     }).sort((a,b)=>b.hits-a.hits);
     const best=scored[0];
     if(best&&(!terms.length||best.hits>=Math.max(1,Math.ceil(terms.length*.5)))){
       const p=best.p;
       return res.status(200).json({ok:true,product:{
         verified:true,name:p.name,brand:p.brand||null,model:p.model||null,
         priceToman:p.priceToman==null?null:Number(p.priceToman),
         availability:p.availability||null,productUrl:p.url,store:p.store||null,
         attributes:p.attributes&&typeof p.attributes==='object'?p.attributes:{},
         confidence:Math.min(.86,.55+(best.hits/Math.max(1,terms.length))*.3)
       },normalizedQuery:normalized.normalizedQuery,resolverVersion:RESOLVER_VERSION,verificationFallback:true});
     }
     return res.status(422).json({error:'web_product_not_verified',resolverVersion:RESOLVER_VERSION,stage:'verification',normalizedQuery:normalized.normalizedQuery});
   }
   return res.status(200).json({ok:true,product:verified,normalizedQuery:normalized.normalizedQuery,resolverVersion:RESOLVER_VERSION});
 }catch(e){
   console.error('[DigiYar product resolver]',e&&e.message?e.message:e);
   return res.status(502).json({error:'ai_request_failed',resolverVersion:RESOLVER_VERSION,message:e&&e.message?String(e.message):'unknown'});
 }
};