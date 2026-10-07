// DigiYar V7 — real AI shopping planner endpoint
// Runs on Vercel only. Keep AI_GATEWAY_API_KEY server-side.
module.exports = async function handler(req,res){
  if(req.method==='OPTIONS'){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    return res.status(204).end();
  }
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
  if(!key)return res.status(503).json({error:'ai_not_configured'});
  let body={};
  try{body=typeof req.body==='object'&&req.body?req.body:JSON.parse(req.body||'{}');}catch(_){return res.status(400).json({error:'invalid_json'});}
  const query=String(body.query||'').trim();
  if(!query)return res.status(400).json({error:'query_required'});
  const schema={
    type:'object',
    properties:{
      category:{type:'string'},
      brand:{type:['string','null']},
      minBudgetToman:{type:['number','null']},
      maxBudgetToman:{type:['number','null']},
      useCase:{type:['string','null']},
      domains:{type:'array',items:{type:'string'}},
      eligibleStoreIds:{type:'array',items:{type:'string'}},
      productTerms:{type:'array',items:{type:'string'}},
      requiredNameTerms:{type:'array',items:{type:'string'}},
      excludedTerms:{type:'array',items:{type:'string'}},
      confidence:{type:'number'}
    },
    required:['category','brand','minBudgetToman','maxBudgetToman','useCase','domains','eligibleStoreIds','productTerms','requiredNameTerms','excludedTerms','confidence'],
    additionalProperties:false
  };
  const catalog=(body.storeCatalog&&typeof body.storeCatalog==='object'?body.storeCatalog:(body.context&&body.context.storeCatalog&&typeof body.context.storeCatalog==='object'?body.context.storeCatalog:{}));
  const STORE_FOCUS={digikala:'فروشگاه عمومی بزرگ؛ تنوع بسیار زیاد در کالاهای عمومی',snappshop:'فروشگاه عمومی؛ تنوع زیاد در کالاهای عمومی',torob:'موتور جستجوی کالای عمومی از فروشندگان متعدد',basalam:'بازارگاه عمومی با تمرکز بر کالاها و فروشندگان متنوع',esam:'بازارگاه عمومی؛ کالاهای متنوع و برخی خدمات',khanoumi:'فروشگاه تخصصی آرایشی، بهداشتی و مراقبت پوست و مو',modiseh:'فروشگاه مد، پوشاک و همچنین آرایشی و مراقبت زیبایی',shavaz:'فروشگاه تخصصی زیبایی، مراقبت پوست و مو و برخی محصولات سلامت',neshatrokh:'فروشگاه تخصصی آرایشی و بهداشتی، مراقبت پوست و محصولات زیبایی',solokala:'فروشگاه تخصصی آرایشی، بهداشتی و مراقبت پوست',darukade:'فروشگاه تخصصی داروخانه، مکمل، ویتامین، محصولات سلامت و مراقبت پوست',darmankala:'فروشگاه تخصصی تجهیزات پزشکی، سلامت و برخی محصولات مراقبت و درمان پوست',mosbatesabz:'فروشگاه تخصصی سلامت، مکمل، داروخانه و مراقبت پوست', 'daroo-online':'داروخانه آنلاین و محصولات دارویی، سلامت و مراقبت پوست',pinket:'فروشگاه سوپرمارکت و کالاهای روزمره و برخی بهداشتی',dayan:'فروشگاه تخصصی پوشاک و اکسسوری',memarket:'فروشگاه کالاهای دیجیتال، خانه، مد و برخی کالاهای عمومی',technolife:'فروشگاه تخصصی کالای دیجیتال',gooshishop:'فروشگاه تخصصی موبایل و لوازم دیجیتال',berozkala:'فروشگاه تخصصی کالای دیجیتال',digido:'فروشگاه تخصصی کالای دیجیتال',janebi:'فروشگاه تخصصی موبایل و لوازم جانبی',safarme:'خدمات و فروش بلیط سفر',shab:'رزرو اقامتگاه و ویلا',eseminar:'وبینار و رویداد آموزشی',maktabkhooneh:'دوره و آموزش آنلاین',karnameh:'کارشناسی، قیمت و خدمات مرتبط با خودرو'};
  const catalogForAI={domains:catalog,focus:STORE_FOCUS};
  const catalogText=JSON.stringify(catalogForAI);
  const prompt='تو موتور فهم خرید دیجی‌یار هستی. در کاتالوگ ورودی، businessDomain، specialties، productFamilies و aliases دانش اصلی حوزه کسب‌وکار هر فروشگاه هستند؛ tagline/description/categories فقط سیگنال کمکی از بخش «فروشگاه‌های محبوب» هستند. businessDomain و productFamilies را برای تطبیق دقیق محصول با فروشگاه در اولویت قرار بده و exclusions را برای حذف موارد نامرتبط در نظر بگیر. عبارت فارسی کاربر را از نظر معنایی بفهم و فقط دادهٔ ساختاری برگردان. هیچ محصولی اختراع نکن. domains فقط از این فهرست انتخاب شود: digital, furniture, fashion, beauty, health, supermarket, home, sports, kids, books, auto, accessories, travel_ticket, lodging, education, auto_service, medicine. eligibleStoreIds مهم‌ترین خروجی است: فقط شناسه فروشگاه‌هایی را انتخاب کن که با نیاز دقیق کاربر ارتباط مستقیم دارند؛ صرفاً چون یک فروشگاه عمومی در آن حوزه فعالیت دارد آن را انتخاب نکن. اگر محصول/نیاز تخصصی است، فروشگاه تخصصی مرتبط را انتخاب کن. اگر درباره ارتباط یک فروشگاه تردید داری، آن را انتخاب نکن. همه فروشگاه‌هایی را که پس از اعمال قوانین سخت بالا واقعاً واجد شرایط‌اند انتخاب کن؛ اما «ارتباط مستقیم و معنادار» باید بر اساس شواهد همان فروشگاه باشد، نه صرفاً حوزه کسب‌وکار. اگر فقط 2 فروشگاه شاهد معتبر دارند، فقط همان 2 را برگردان. تعداد را برای پر کردن سقف مصنوعی زیاد نکن. اگر هیچ فروشگاهی ارتباط مستقیم ندارد آرایه را خالی بگذار. از شناسه‌های خارج از کاتالوگ استفاده نکن. قانون سخت انتخاب فروشگاه عمومی: برای دیجی‌کالا، اسنپ‌شاپ، ترب، باسلام، ایسام و می‌مارکت، «categories» موجود در کاتالوگ ورودی منبعِ وضعیت فعلی دسته‌بندی فروشگاه است و باید بر products/aliases تاریخی اولویت داشته باشد. فروشگاه عمومی را فقط وقتی eligibleStoreIds انتخاب کن که نیاز دقیق کاربر با یکی از دسته‌بندی‌های فعلی همان فروشگاه به‌طور معنادار پوشش داده شود؛ صرف عمومی بودن، businessDomain، domains یا سابقهٔ داشتن یک محصول کافی نیست. اگر دسته‌بندی فعلی فروشگاه محصول/نیاز را پوشش نمی‌دهد، آن فروشگاه را حذف کن حتی اگر products/aliases قدیمی آن قبلاً چنین محصولی را ثبت کرده باشند. اگر دسته‌بندی فعلی آن را پوشش می‌دهد، فروشگاه عمومی را حذف نکن فقط به این دلیل که فروشگاه تخصصی هم وجود دارد. برای مثال اگر کاربر کالایی از حوزه لوازم خانگی بخواهد و فروشگاه عمومی در categories فعلی خود «لوازم خانگی» یا دسته‌بندی دقیق‌تر مرتبط داشته باشد، آن فروشگاه واجد شرایط است. categories فقط باید به‌عنوان شواهد وضعیت فعلی دسته‌بندی استفاده شود و نباید از روی domain کلی، احتمال موجود بودن کالا یا سابقهٔ فروشگاه چیزی اختراع شود. برای فروشگاه تخصصی نیز تطابق مستقیم محصول/alias یا intent تخصصیِ صریح لازم است. هیچ فروشگاهی را فقط به دلیل شباهت معناییِ سطح دامنه، داشتن category مشترک، یا این استدلال که «ممکن است این کالا را هم داشته باشد» انتخاب نکن. اگر فروشگاه تخصصیِ مرتبط وجود دارد، فروشگاه عمومیِ فاقد شاهد مستقیم را اضافه نکن. تفکیک «خرید خودِ کالا» از «نیاز به انجام کار/خدمت یا خرید ابزار برای انجام آن» الزامی است: اگر کاربر می‌گوید چیزی برای تمیز کردن، شستن، پاک کردن یا نظافت یک وسیله می‌خواهد (مثلاً «برای تمیز کردن مبل پارچه‌ای»)، «مبل» هدفِ کاری است نه کالای مورد درخواست؛ بنابراین فروشگاه‌های مبلمان که صرفاً مبل/مبلمان می‌فروشند نباید انتخاب شوند. فقط فروشگاه‌هایی را انتخاب کن که در products/aliases خودِ ابزار یا مادهٔ نظافتِ مرتبط را دارند؛ اگر شاهد مستقیم وجود ندارد eligibleStoreIds را برای آن فروشگاه خالی بگذار. تخفیفان فقط وقتی برای خرید کالای فیزیکی انتخاب شود که درخواست کاربر صریحاً شامل تخفیف، کد تخفیف، پیشنهاد ویژه یا خدمات تخفیفی باشد؛ صرف وجود «موبایل» یا «کالای دیجیتال» در پروفایل تخفیفان کافی نیست. ایسام فقط وقتی انتخاب شود که درخواست با مزایده/کالای کلکسیونی/خریدوفروش یا محصولی که در products آن آمده تطابق روشن داشته باشد. جانبی فقط برای لوازم جانبی/اکسسوری انتخاب شود، نه خودِ گوشی یا موبایل. برای نیازهای ترکیبی، همه ویژگی‌های اصلی درخواست را همزمان در نظر بگیر؛ مثلاً «کرمی برای نرم کردن پوست که ضد آفتاب هم باشد» یک نیاز واحد برای «کرم مراقبت پوست + نرم‌کننده/مرطوب‌کننده + ضدآفتاب» است و نباید فقط به دلیل واژه «کرم» یا فقط به دلیل حوزه beauty رد شود. در چنین موردی فروشگاه‌های آرایشی/بهداشتی و داروخانه/سلامت که طبق focus خود محصولات مراقبت پوست یا ضدآفتاب دارند می‌توانند کاندید شوند. فروشگاه عمومی نیز فقط در صورتی انتخاب شود که برای همین نوع کالای دقیق کاندید معقول باشد. productTerms و requiredNameTerms باید کلمات/عبارت‌های واقعی و ضروریِ هویت کالا باشند؛ کلمات عمومی مثل برای، محل، استفاده و بودجه را وارد نکن. اگر برند یا بودجه مشخص نیست null بده.\nکاتالوگ فروشگاه‌ها، زیرنوشته‌ها و حوزه‌های فعالیت آن‌ها: '+catalogText+'\nعبارت کاربر: '+query;
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization:'Bearer '+key},
      body:JSON.stringify({
        model:'openai/gpt-5.6-luna',
        input:prompt,
        text:{format:{type:'json_schema',name:'digiyar_shopping_plan',strict:true,schema}},
        max_output_tokens:700
      })
    });
    const data=await r.json();
    if(!r.ok)return res.status(502).json({error:'ai_gateway_error',detail:data&&data.error?data.error:null});
    const raw=data.output_text||'';
    let plan;try{plan=JSON.parse(raw);}catch(_){return res.status(502).json({error:'ai_invalid_json'});}
    const allowedIds=new Set(Object.keys(catalog||{}).map(x=>String(x).toLowerCase()));
    if(Array.isArray(plan.eligibleStoreIds)){
      plan.eligibleStoreIds=plan.eligibleStoreIds.map(x=>String(x||'').toLowerCase()).filter((x,i,a)=>allowedIds.has(x)&&a.indexOf(x)===i);

    }
    return res.status(200).json({ok:true,provider:'vercel-ai-gateway',model:'openai/gpt-5.6-luna',plan});
  }catch(e){return res.status(502).json({error:'ai_request_failed'});}
};