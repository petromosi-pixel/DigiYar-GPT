// DigiYar V7 — AI product comparison resolver
// Pipeline: normalize -> web discovery -> direct-page fetch -> verify/extract.
// The browser never receives the gateway key.

module.exports=async function(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
 let body={};
 try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}')}
 catch(_){return res.status(400).json({error:'invalid_json'})}
 const query=String(body.query||'').trim();
 if(!query)return res.status(400).json({error:'query_required'});

 const gateway='https://ai-gateway.vercel.sh/v1/responses';
 const model='openai/gpt-5.6-luna';
 const RESOLVER_VERSION='7.0.0-product-lookup.6';

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
   const directPageUrl=validUrl(query)?query:'';

   if(directPageUrl){
     try{
       const dns=require('dns').promises, net=require('net');
       let pageUrl=directPageUrl, html='';
       for(let hop=0;hop<4;hop++){
         const u=new URL(pageUrl);
         if(!/^https?:$/.test(u.protocol)||u.username||u.password||/^(localhost|.*\\.local)$/i.test(u.hostname))throw new Error('unsafe_url');
         const ips=net.isIP(u.hostname)?[{address:u.hostname}]:await dns.lookup(u.hostname,{all:true});
         const blocked=ips.some(({address})=>{
           if(address.includes(':')){const z=address.toLowerCase();return z==='::1'||z.startsWith('fc')||z.startsWith('fd')||z.startsWith('fe8')||z.startsWith('fe9')||z.startsWith('fea')||z.startsWith('feb');}
           const a=address.split('.').map(Number);return a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168)||(a[0]===100&&a[1]>=64&&a[1]<=127);
         });
         if(!ips.length||blocked)throw new Error('unsafe_host');
         const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
         let response;
         try{
           response=await fetch(pageUrl,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; DigiYarProductReader/1.0)','Accept':'text/html,application/xhtml+xml','Accept-Language':'fa-IR,fa;q=0.9,en;q=0.7'}});
           if([301,302,303,307,308].includes(response.status)){
             const loc=response.headers.get('location');if(!loc||hop===3)throw new Error('redirect_limit');
             pageUrl=new URL(loc,pageUrl).href;continue;
           }
           if(!response.ok)throw new Error('page_http_'+response.status);
           const ct=response.headers.get('content-type')||'';if(!/html|xml|text/i.test(ct))throw new Error('not_html');
           const declared=Number(response.headers.get('content-length')||0);if(declared>1500000)throw new Error('page_too_large');
           html=(await response.text()).slice(0,1500000);break;
         }finally{clearTimeout(timer);}
       }
       const unescapeHtml=v=>String(v||'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
       const meta={};let mm;
       const mr=/<meta\b[^>]*(?:property|name)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
       while((mm=mr.exec(html)))meta[mm[1].toLowerCase()]=unescapeHtml(mm[2]);
       const scripts=html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)||[];
       let product=null;
       const findProduct=x=>{if(!x||typeof x!=='object')return null;if(Array.isArray(x)){for(const y of x){const z=findProduct(y);if(z)return z;}return null;}const t=Array.isArray(x['@type'])?x['@type']:[x['@type']];if(t.some(v=>String(v).toLowerCase()==='product'))return x;for(const k of Object.keys(x)){const z=findProduct(x[k]);if(z)return z;}return null;};
       for(const tag of scripts){try{const raw=tag.replace(/^<script[^>]*>/i,'').replace(/<\/script>$/i,'');product=findProduct(JSON.parse(raw));if(product)break;}catch(_){}}
       const offers=product&&product.offers?(Array.isArray(product.offers)?product.offers[0]:product.offers):{};
       const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';
       const name=unescapeHtml(product&&product.name||meta['og:title']||meta['twitter:title']||title).replace(/\s*[|｜•].*$/,'').trim();
       if(!name)throw new Error('product_metadata_not_found');
       const rawPrice=offers&&offers.price!=null?offers.price:product&&product.price!=null?product.price:meta['product:price:amount']||meta['og:price:amount']||'';
       const priceString=String(rawPrice).replace(/[^\d.]/g,''),price=priceString&&Number.isFinite(Number(priceString))?Number(priceString):null;
       const currency=String(offers&&offers.priceCurrency||meta['product:price:currency']||'').toUpperCase();
       const brand=product&&product.brand?(typeof product.brand==='object'?product.brand.name:product.brand):'';
       const model=product&&(product.model||product.sku||product.mpn)||'';
       const availability=String(offers&&offers.availability||'').split('/').pop().replace(/([A-Z])/g,' $1').trim();
       const desc=unescapeHtml(product&&product.description||meta['og:description']||meta.description||'');
       const image=product&&product.image?(Array.isArray(product.image)?product.image[0]:typeof product.image==='object'?product.image.url:product.image):meta['og:image']||'';
       const extracted={verified:true,name,brand:brand||null,model:model||null,priceToman:price==null?null:Math.round(currency==='IRR'?price/10:price),availability:availability||null,productUrl:directPageUrl,store:new URL(directPageUrl).hostname.replace(/^www\./,''),attributes:Object.assign({},desc?{description:desc}:{},image?{image}:{}),confidence:product&&product.name?0.96:0.78};
       return res.status(200).json({ok:true,product:extracted,resolverVersion:RESOLVER_VERSION,extraction:'direct-page'});
     }catch(error){
       console.warn('[DigiYar direct product extraction]',error&&error.message?error.message:error);
       return res.status(422).json({error:'direct_product_extraction_failed',reason:error&&error.message?String(error.message):'unknown',resolverVersion:RESOLVER_VERSION,stage:'direct-page'});
     }
   }
   if(!key)return res.status(503).json({error:'ai_not_configured'});
   const normalized=directPageUrl?{normalizedQuery:directPageUrl,alternateQueries:[],requiredTerms:[],brandHint:null,modelHint:null}:parse(await ai({
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
   const searchPrompt=directPageUrl?'کاربر این URL دقیق صفحه محصول را از فروشگاه کپی کرده است. فقط همین صفحه را بازبینی و اطلاعات همان کالا را استخراج کن؛ محصول مشابه، صفحه جستجو، دسته‌بندی یا صفحه دیگری را جایگزین نکن. اگر همین URL به عنوان صفحه محصول قابل تأیید نیست، candidates را خالی برگردان. URL کاندید باید همین URL یا نسخه canonical همان صفحه در همان میزبان و مسیر باشد. نام، برند، مدل، قیمت، موجودی و مشخصات فقط از همین صفحه استخراج شوند و داده غایب null یا خالی بماند. URL انتخابی: '+directPageUrl:'محصول زیر را در وب پیدا کن و حتماً خود صفحه مستقیم همان محصول را بررسی کن. فقط صفحه محصول واقعی را برگردان، نه صفحه جستجو، دسته‌بندی، برند یا صفحه اصلی فروشگاه. اگر چند فروشگاه محصول را دارند، چند صفحه مستقیم واقعی برگردان. برای هر کاندید، نام واقعی محصول، برند، مدل، قیمت و موجودی اگر در صفحه قابل مشاهده است و مشخصات صریح را استخراج کن. اگر اطلاعاتی در صفحه نیست null بده. URL باید دقیقاً URL صفحه محصول باشد. اگر فقط صفحه جستجو یا دسته‌بندی پیدا شد آن را کاندید نکن. محصول باید با هویت درخواست تطابق داشته باشد؛ برای «گوشی a57» فقط Samsung Galaxy A57 / Galaxy A57 5G و معادل همان مدل معتبر است، نه A56، A57 Ultra یا نتایج جستجو. درخواست خام: '+query+'\\nعبارت استاندارد: '+normalized.normalizedQuery+'\\nعبارت‌های جایگزین: '+queries.join(' | ')+'\\nکلمات ضروری هویت: '+(normalized.requiredTerms||[]).join('، ');
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
   const direct=directPageUrl?candidates.filter(x=>{try{const a=new URL(x.url),b=new URL(directPageUrl);return !looksLikeSearchUrl(x.url)&&a.hostname.replace(/^www\./,'')===b.hostname.replace(/^www\./,'')&&a.pathname.replace(/\/$/,'')===b.pathname.replace(/\/$/,'');}catch(_){return false;}}):candidates.filter(x=>!looksLikeSearchUrl(x.url));
   if(!direct.length)return res.status(422).json({error:'web_product_not_verified',resolverVersion:RESOLVER_VERSION,stage:'direct_url_guard',normalizedQuery:normalized.normalizedQuery});

   // Stage 4 — AI verification against the actual web-search findings.
   const candidatePacket=direct.map((p,i)=>'کاندید '+(i+1)+'\nURL: '+p.url+'\nعنوان صفحه: '+p.title+'\nنام محصول: '+p.name+'\nبرند: '+(p.brand||'نامشخص')+'\nمدل: '+(p.model||'نامشخص')+'\nفروشگاه: '+(p.store||'نامشخص')+'\nقیمت: '+(p.priceToman==null?'نامشخص':p.priceToman)+'\nموجودی: '+(p.availability||'نامشخص')+'\nمشخصات: '+JSON.stringify(p.attributes||{})).join('\n\n---\n\n');
   const verifyPrompt=(directPageUrl?'کاربر URL دقیق صفحه محصول را خودش انتخاب کرده است. فقط همان صفحه را ارزیابی کن و هیچ محصول دیگری را جایگزین نکن. ':'از بین یافته‌های واقعی جستجوی وب زیر، دقیقاً همان محصولی را که کاربر خواسته انتخاب کن. این مرحله تصمیم نهایی است.')+'\nدرخواست خام: '+query+'\nURL انتخابی: '+(directPageUrl||'ندارد')+'\n اگر «گوشی a57» است، نتیجه باید همان Samsung Galaxy A57 باشد و نه A56، A57 Ultra یا صفحه جستجو. اگر تطابق مستقیم وجود ندارد verified=false بده. productUrl فقط باید دقیقاً یکی از URLهای کاندید باشد و هرگز URL جدید نساز. نام، برند، مدل، قیمت، موجودی و مشخصات را فقط از کاندید انتخاب‌شده بردار. confidence بین 0 و 1 باشد.\nدرخواست خام: '+query+'\nهویت استاندارد: '+normalized.normalizedQuery+'\nکلمات ضروری: '+(normalized.requiredTerms||[]).join('، ')+'\n\nیافته‌ها:\n'+candidatePacket;
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
         availability:p.availability||null,productUrl:directPageUrl||p.url,store:p.store||null,
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