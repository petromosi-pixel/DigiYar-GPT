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
      semanticNeed:{type:'string'},
      requestedProduct:{type:'string'},
      targetObject:{type:['string','null']},
      attributes:{type:'array',items:{type:'string'}},
      searchQueries:{type:'object',additionalProperties:{type:'string'}},
      confidence:{type:'number'}
    },
    required:['category','brand','minBudgetToman','maxBudgetToman','useCase','domains','eligibleStoreIds','productTerms','requiredNameTerms','excludedTerms','semanticNeed','requestedProduct','targetObject','attributes','searchQueries','confidence'],
    additionalProperties:false
  };
  const catalog=(body.storeCatalog&&typeof body.storeCatalog==='object'?body.storeCatalog:(body.context&&body.context.storeCatalog&&typeof body.context.storeCatalog==='object'?body.context.storeCatalog:{}));
  /* The browser sends the complete canonical merchant KB. Do not maintain a
   * second hard-coded merchant summary here: it inevitably drifts from the KB.
   * The model must reason over the actual merchant record it receives. */
  const catalogText=JSON.stringify(catalog);
  const prompt='تو «مغز معنایی خرید دیجی‌یار» هستی؛ نه یک استخراج‌کنندهٔ کلمات کلیدی. وظیفه‌ات این است که معنی و نیاز واقعی کاربر را مثل یک دستیار هوشمند بفهمی و سپس آن نیاز را به کاتالوگ فروشگاه‌های دیجی‌یار نگاشت کنی. ابتدا در ذهن خود عبارت کاربر را تحلیل کن: کاربر دقیقاً چه چیزی می‌خواهد بخرد، شیء هدف چیست، عمل یا کاربرد چیست، ویژگی‌های ضروری چیست، چه چیزهایی صراحتاً نباید در نتیجه باشند، و مترادف‌ها و نام‌های رایج آن مفهوم چیست. مثلاً در «دنبال چیزی برای تمیز کردن مبل پارچه‌ای هستم»، مبل targetObject است و کالای درخواستی ابزار یا مادهٔ نظافت است؛ در «تصفیه هوای مناسب اتاق خواب» کالای درخواستی دستگاه تصفیه هوا و «اتاق خواب» فقط useCase است؛ در «لوازم جانبی موبایل»، موبایل حوزهٔ سازگاری و «لوازم جانبی» هویت کالاست. این تحلیل نباید به فهرست واژگان ثابت محدود شود و باید برای واژه‌های جدید، محاوره‌ای، مترادف‌ها، توصیف‌های طولانی و ترکیب‌های چندویژگی هم کار کند. خروجی semanticNeed خلاصهٔ معنایی نیاز، requestedProduct هویت کالای درخواستی، targetObject هدف عمل در صورت وجود، attributes ویژگی‌های ضروری، productTerms و requiredNameTerms اصطلاحات محصول، excludedTerms مواردی که نباید با آن‌ها اشتباه شود. سپس eligibleStoreIds را با استدلال در دانش همان فروشگاه‌ها انتخاب کن؛ همهٔ فروشگاه‌های عمومی و تخصصی که واقعاً برای همین نیاز مرتبط‌اند را بیاور و فقط فروشگاه نامرتبط را حذف کن. در نهایت برای هر فروشگاه انتخاب‌شده searchQueries بساز: یک عبارت کوتاه، طبیعی و محصول‌محور که موتور جستجوی همان فروشگاه بتواند بفهمد؛ searchQueries باید از نیاز مفهومی ساخته شود نه کپی عبارت کاربر. اگر موتور جستجوی یک فروشگاه با جمله‌های طبیعی ضعیف است، عبارت را به هستهٔ کالای درخواستی + ویژگی‌های ضروری کاهش بده. هرگز targetObject، بودجه، محل استفاده یا جملهٔ مکالمه‌ای را مگر اینکه بخشی از نام محصول باشند داخل searchQueries نریز. این searchQueries باید برای تمام فروشگاه‌های انتخاب‌شده تولید شوند و کلید آن‌ها شناسهٔ فروشگاه باشد.'; در کاتالوگ ورودی، businessDomain، specialties، productFamilies و aliases دانش اصلی حوزه کسب‌وکار هر فروشگاه هستند؛ tagline/description/categories فقط سیگنال کمکی از بخش «فروشگاه‌های محبوب» هستند. businessDomain و productFamilies را برای تطبیق دقیق محصول با فروشگاه در اولویت قرار بده و exclusions را برای حذف موارد نامرتبط در نظر بگیر. عبارت فارسی کاربر را از نظر معنایی بفهم و فقط دادهٔ ساختاری برگردان. هیچ محصولی اختراع نکن. domains فقط از این فهرست انتخاب شود: digital, furniture, fashion, beauty, health, supermarket, home, sports, kids, books, auto, accessories, travel_ticket, lodging, education, auto_service, medicine. eligibleStoreIds مهم‌ترین خروجی است: فقط شناسه فروشگاه‌هایی را انتخاب کن که با نیاز دقیق کاربر ارتباط مستقیم دارند؛ صرفاً چون یک فروشگاه عمومی در آن حوزه فعالیت دارد آن را انتخاب نکن. اگر محصول/نیاز تخصصی است، فروشگاه تخصصی مرتبط را انتخاب کن. اگر درباره ارتباط یک فروشگاه تردید داری، آن را انتخاب نکن. همه فروشگاه‌هایی را که پس از اعمال قوانین سخت بالا واقعاً واجد شرایط‌اند انتخاب کن؛ اما «ارتباط مستقیم و معنادار» باید بر اساس شواهد همان فروشگاه باشد، نه صرفاً حوزه کسب‌وکار. اگر فقط 2 فروشگاه شاهد معتبر دارند، فقط همان 2 را برگردان. تعداد را برای پر کردن سقف مصنوعی زیاد نکن. اگر هیچ فروشگاهی ارتباط مستقیم ندارد آرایه را خالی بگذار. از شناسه‌های خارج از کاتالوگ استفاده نکن. قانون سخت انتخاب فروشگاه عمومی: برای دیجی‌کالا، اسنپ‌شاپ، ترب، باسلام، ایسام و می‌مارکت، «categories» موجود در کاتالوگ ورودی منبعِ وضعیت فعلی دسته‌بندی فروشگاه است و باید بر products/aliases تاریخی اولویت داشته باشد. فروشگاه عمومی را فقط وقتی eligibleStoreIds انتخاب کن که نیاز دقیق کاربر با یکی از دسته‌بندی‌های فعلی همان فروشگاه به‌طور معنادار پوشش داده شود؛ صرف عمومی بودن، businessDomain، domains یا سابقهٔ داشتن یک محصول کافی نیست. اگر دسته‌بندی فعلی فروشگاه محصول/نیاز را پوشش نمی‌دهد، آن فروشگاه را حذف کن حتی اگر products/aliases قدیمی آن قبلاً چنین محصولی را ثبت کرده باشند. اگر دسته‌بندی فعلی آن را پوشش می‌دهد، فروشگاه عمومی را حذف نکن فقط به این دلیل که فروشگاه تخصصی هم وجود دارد. برای مثال اگر کاربر کالایی از حوزه لوازم خانگی بخواهد و فروشگاه عمومی در categories فعلی خود «لوازم خانگی» یا دسته‌بندی دقیق‌تر مرتبط داشته باشد، آن فروشگاه واجد شرایط است. categories فقط باید به‌عنوان شواهد وضعیت فعلی دسته‌بندی استفاده شود و نباید از روی domain کلی، احتمال موجود بودن کالا یا سابقهٔ فروشگاه چیزی اختراع شود. برای فروشگاه تخصصی نیز تطابق مستقیم محصول/alias یا intent تخصصیِ صریح لازم است. هیچ فروشگاهی را فقط به دلیل شباهت معناییِ سطح دامنه، داشتن category مشترک، یا این استدلال که «ممکن است این کالا را هم داشته باشد» انتخاب نکن. اگر فروشگاه تخصصیِ مرتبط وجود دارد، فروشگاه عمومیِ فاقد شاهد مستقیم را اضافه نکن. تفکیک «خرید خودِ کالا» از «نیاز به انجام کار/خدمت یا خرید ابزار برای انجام آن» الزامی است: اگر کاربر می‌گوید چیزی برای تمیز کردن، شستن، پاک کردن یا نظافت یک وسیله می‌خواهد (مثلاً «برای تمیز کردن مبل پارچه‌ای»)، «مبل» هدفِ کاری است نه کالای مورد درخواست؛ بنابراین فروشگاه‌های مبلمان که صرفاً مبل/مبلمان می‌فروشند نباید انتخاب شوند. فقط فروشگاه‌هایی را انتخاب کن که در products/aliases خودِ ابزار یا مادهٔ نظافتِ مرتبط را دارند؛ اگر شاهد مستقیم وجود ندارد eligibleStoreIds را برای آن فروشگاه خالی بگذار. تخفیفان فقط وقتی برای خرید کالای فیزیکی انتخاب شود که درخواست کاربر صریحاً شامل تخفیف، کد تخفیف، پیشنهاد ویژه یا خدمات تخفیفی باشد؛ صرف وجود «موبایل» یا «کالای دیجیتال» در پروفایل تخفیفان کافی نیست. ایسام فقط وقتی انتخاب شود که درخواست با مزایده/کالای کلکسیونی/خریدوفروش یا محصولی که در products آن آمده تطابق روشن داشته باشد. جانبی فقط برای لوازم جانبی/اکسسوری انتخاب شود، نه خودِ گوشی یا موبایل. برای نیازهای ترکیبی، همه ویژگی‌های اصلی درخواست را همزمان در نظر بگیر؛ مثلاً «کرمی برای نرم کردن پوست که ضد آفتاب هم باشد» یک نیاز واحد برای «کرم مراقبت پوست + نرم‌کننده/مرطوب‌کننده + ضدآفتاب» است و نباید فقط به دلیل واژه «کرم» یا فقط به دلیل حوزه beauty رد شود. در چنین موردی فروشگاه‌های آرایشی/بهداشتی و داروخانه/سلامت که طبق focus خود محصولات مراقبت پوست یا ضدآفتاب دارند می‌توانند کاندید شوند. فروشگاه عمومی نیز فقط در صورتی انتخاب شود که برای همین نوع کالای دقیق کاندید معقول باشد. productTerms و requiredNameTerms باید کلمات/عبارت‌های واقعی و ضروریِ هویت کالا باشند؛ کلمات عمومی مثل برای، محل، استفاده و بودجه را وارد نکن. اگر برند یا بودجه مشخص نیست null بده.\nکاتالوگ کامل فروشگاه‌ها، شامل شناسه، حوزه کسب‌وکار، تخصص‌ها، خانواده‌های محصول، محصولات، مترادف‌ها، استثناها، دسته‌بندی‌های فعلی و سیاست تطبیق آن‌ها: '+catalogText+'\nعبارت کاربر: '+query;
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization:'Bearer '+key},
      body:JSON.stringify({
        model:'openai/gpt-5.6-luna',
        input:prompt,
        text:{format:{type:'json_schema',name:'digiyar_shopping_plan',strict:true,schema}},
        max_output_tokens:1400
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