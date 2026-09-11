/* DigiYar V3 - Smart User Profile */

(function () {
  "use strict";

  const STORAGE_KEY = "digiyar_v3_profile";

  function cleanArray(value) {
    if (Array.isArray(value)) {
      return value.map(String).map(function (item) { return item.trim(); }).filter(Boolean);
    }
    return String(value || "").split(/[،,]/).map(function (item) { return item.trim(); }).filter(Boolean);
  }

  const DigiYarUserProfile = {
    version: "3.0.0",
    save: function (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
    load: function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
      catch (error) { return null; }
    },
    clear: function () { localStorage.removeItem(STORAGE_KEY); },
    getProfile: function () { return this.load(); },
    normalize: function (form) {
      return {
        declared: {
          category: form.category || "general",
          budget: { min: null, max: Number(form.budgetMax) || null },
          priorities: cleanArray(form.priorities),
          usage: String(form.usage || "").trim(),
          requirements: cleanArray(form.requirements),
          constraints: cleanArray(form.constraints)
        },
        learned: {}, context: {}, history: [], version: "3.0.0"
      };
    }
  };

  window.DigiYarUserProfile = DigiYarUserProfile;

  /* V6: categories verified against the current store sites where accessible. */
  const STORE_CATEGORIES = {
    digikala: ["موبایل و کالای دیجیتال","لوازم خانگی و مبلمان","مد و پوشاک","آرایشی و بهداشتی","سلامت و پزشکی","کتاب و لوازم تحریر","کودک و نوزاد","اسباب‌بازی و سرگرمی","ورزش و سفر","ابزارآلات و تجهیزات","خوراکی و سوپرمارکت","طلا و جواهرات","محصولات بومی و محلی","کارت هدیه"],
    snappshop: ["موبایل و کالای دیجیتال","لوازم خانگی","مد و پوشاک","آرایشی و بهداشتی","سوپرمارکت و مواد غذایی","کودک و نوزاد","ورزش و سفر","سلامت و پزشکی","خانه و آشپزخانه"],
    torob: ["موبایل و کالای دیجیتال","لپ‌تاپ، کامپیوتر و اداری","هایپرمارکت","لوازم خانگی","مد و پوشاک","زیبایی و بهداشت","صوتی و تصویری","خودرو و وسایل نقلیه","سلامت و پزشکی","فرهنگی و هنری","ورزش و تناسب اندام","اسباب‌بازی و سرگرمی","کودک و نوزاد","تجهیزات ساختمان","ابزارآلات","سفر، کمپینگ و کوهنوردی","حیوانات خانگی","تجهیزات صنعتی","ارز و طلا","لوازم فروشگاهی"],
    basalam: ["کالای دیجیتال","لوازم برقی","ابزارآلات","لوازم خودرو","مواد غذایی","پوشاک و اکسسوری","صنایع دستی","خانه و آشپزخانه","سلامت و زیبایی","طلا و جواهر"],
    khanoumi: ["آرایش صورت","مراقبت پوست","مراقبت مو","عطر و ادکلن","بهداشت و سلامت","محصولات بدن","لوازم شخصی برقی","مادر و کودک","ابزار و اکسسوری زیبایی"],
    banimode: ["مد و پوشاک","ورزش و سفر","سلامت و زیبایی","لوازم خانه","کودک، نوزاد و اسباب‌بازی","ساعت، طلا و زیورآلات","کتاب، لوازم تحریر و هنر","کالای دیجیتال"],
    modiseh: ["پوشاک زنانه","پوشاک مردانه","پوشاک بچگانه","آرایشی و بهداشتی","لوازم دیجیتال","خانه و آشپزخانه","ورزش و سفر"],
    esam: ["موبایل و تبلت","کالای دیجیتال","مد و پوشاک","خانه و آشپزخانه","لوازم خودرو","کتاب و هنر","کلکسیونی و عتیقه","ابزار و تجهیزات","زیبایی و سلامت","کودک و نوزاد"],
    pinket: ["سوپرمارکت و مواد غذایی","میوه و سبزی","لبنیات","نوشیدنی","شوینده و بهداشت","آرایشی و بهداشتی","کودک و نوزاد","لوازم خانه"],
    darukade: ["مکمل‌های غذایی","ویتامین و مواد معدنی","آرایشی و بهداشتی","مراقبت پوست و مو","دارو و محصولات درمانی","مادر و کودک","تجهیزات پزشکی","محصولات جنسی"],
    darmankala: ["تجهیزات پزشکی","ارتوپدی و توانبخشی","فشارسنج و تجهیزات پایش","سلامت و بهداشت","محصولات بیمارستانی","مراقبت در منزل"],
    digido: ["موبایل","تبلت","لوازم جانبی موبایل","ساعت هوشمند","هدفون و هندزفری","شارژر و کابل","لوازم دیجیتال"],
    janebi: ["پاوربانک","کابل و شارژر","هندزفری و هدفون","هولدر موبایل","اسپیکر","لوازم جانبی موبایل","کوله و کیف لپ‌تاپ","تجهیزات سلامتی"],
    takhfifan: ["رستوران و کافه","تفریح و سرگرمی","سلامت و زیبایی","خدمات","سفر و اقامت","خرید و فروشگاه","آموزش"],
    shab: ["ویلا","سوئیت","آپارتمان","کلبه","اقامتگاه بوم‌گردی","اقامتگاه ساحلی","اقامتگاه در شمال","اقامتگاه در سراسر ایران"],
    neshatrokh: ["آرایشی","بهداشتی","مراقبت پوست","مراقبت مو","عطر و ادکلن","سلامت","اکسسوری و زیبایی"],
    mosbatesabz: ["مکمل غذایی","ویتامین و مواد معدنی","داروخانه","آرایشی و بهداشتی","مراقبت پوست و مو","مادر و کودک","ورزش و بدنسازی","تجهیزات پزشکی"],
    shavaz: ["آرایشی و زیبایی","بهداشت و مراقبت شخصی","عطر و ادکلن","مراقبت پوست","مراقبت مو","مادر و کودک","لوازم شخصی"],
    jeanswest: ["پوشاک زنانه","پوشاک مردانه","پوشاک کودک","کفش","کیف و اکسسوری","پوشاک ورزشی"],
    eseminar: ["مالی و سرمایه‌گذاری","استارتاپ و کارآفرینی","بازاریابی","پزشکی و سلامت","تحصیلی","توسعه فردی","حقوقی","روانشناسی","زبان‌های خارجی","سینما","عمومی","فناوری اطلاعات","فنی، مهندسی و علوم پایه","مدیریت","مهاجرت","ورزشی","هنری","پکیج آموزشی"],
    safarme: ["بلیط هواپیما","پرواز داخلی","پرواز خارجی","بلیط چارتر","بلیط سیستمی"],
    berozkala: ["گوشی موبایل","تبلت","لپ‌تاپ","کامپیوتر و قطعات","لوازم جانبی دیجیتال","ماشین‌های اداری","مانیتور","پرینتر و تجهیزات اداری"],
    maktabkhooneh: ["هوش مصنوعی","برنامه‌نویسی","آی‌تی و نرم‌افزار","زبان‌های خارجی","مدیریت و کسب‌وکار","مالی و سرمایه‌گذاری","مهارت‌های زندگی","دانشگاهی: فنی و مهندسی","دانشگاهی: علوم پایه، انسانی و پزشکی","کودک و نوجوان","هنر"],
    "daroo-online": ["پوست و مو","زیبایی","مادر و کودک","بهداشت","مکمل غذایی و رژیمی","ورزش و بدنسازی","محصولات درمانی","دهان و دندان","بهداشت بانوان","تجهیزات پزشکی"],
    gooshishop: ["گوشی موبایل","لپ‌تاپ","تبلت","لوازم جانبی موبایل","شارژر و کابل","هدفون و هندزفری","پاوربانک","ساعت هوشمند"],
    karnameh: ["کارشناسی خودرو","فروش خودرو","قیمت روز خودرو","قیمت خودروی کارکرده","آگهی‌های خودرو","خرید اقساطی خودرو","کارشناسی موتورسیکلت","سرویس و خدمات خودرو"],
    technolife: ["موبایل","لپ‌تاپ و کامپیوتر","تبلت","ساعت و پوشیدنی","لوازم جانبی دیجیتال","صوتی و تصویری","لوازم خانگی","آرایشی و شخصی","ابزار و تجهیزات","طلا و زیورآلات"],
    solokala: ["اکسسوری و استایل","خانه و آشپزخانه","عطر و ادکلن","لوازم شخصی برقی","محصولات آرایشی","محصولات بهداشتی","مراقبتی و درمانی"]
  };

  const ALL_CATEGORIES = Array.from(new Set(Object.keys(STORE_CATEGORIES).reduce(function(all, key){ return all.concat(STORE_CATEGORIES[key]); }, [])));

  function syncStoreCategories() {
    const storeSelect = document.getElementById("storeSelect");
    const categorySelect = document.getElementById("v5Category");
    if (!storeSelect || !categorySelect) return;

    function render() {
      const storeId = storeSelect.value || "all";
      const categories = storeId === "all" ? ALL_CATEGORIES : (STORE_CATEGORIES[storeId] || []);
      const current = categorySelect.value;
      categorySelect.innerHTML = "";
      const first = document.createElement("option");
      first.value = "";
      first.textContent = storeId === "all" ? "همه دسته‌بندی‌ها" : "دسته‌بندی را انتخاب کنید";
      categorySelect.appendChild(first);
      categories.forEach(function(category){
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
      if (categories.indexOf(current) !== -1) categorySelect.value = current;
    }

    storeSelect.addEventListener("change", render);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncStoreCategories, { once: true });
  else syncStoreCategories();
})();
