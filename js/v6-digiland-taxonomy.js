/* DigiYar V6 — Store #10: Digiland (دیجی‌لند) */
(function () {
  'use strict';
  const STORE = 'digiland';
  const ROOTS = {
    digital:{label:'کالای دیجیتال',subs:['mobile','tablet','audio','wearable','accessories','camera']},
    computer:{label:'لپ‌تاپ و کامپیوتر',subs:['laptop','computer','monitor','storage','computer-accessories','office']},
    gaming:{label:'گیمینگ',subs:['console','games','gamepad','gaming-accessories']},
    tv:{label:'صوتی و تصویری',subs:['tv','speaker','soundbar','microphone']},
    network:{label:'شبکه و تجهیزات ارتباطی',subs:['router','modem','network-accessories','security']},
    smart:{label:'خانه هوشمند',subs:['smart-home','smart-lighting','smart-security']}
  };
  const SUBS = {
    mobile:{label:'گوشی موبایل',brands:['Apple','Samsung','Xiaomi','Honor','Huawei','Motorola','Nokia','OnePlus','Oppo','Realme','Nothing']},
    tablet:{label:'تبلت',brands:['Samsung','Apple','Xiaomi','Lenovo','Huawei','Microsoft']},
    audio:{label:'هدفون، هدست و هندزفری',brands:['Apple','Samsung','Sony','JBL','Anker','Xiaomi','QCY','Haylou','Razer']},
    wearable:{label:'ساعت و مچ‌بند هوشمند',brands:['Apple','Samsung','Xiaomi','Huawei','Amazfit','Garmin','Honor']},
    accessories:{label:'لوازم جانبی موبایل و تبلت',brands:['Anker','Xiaomi','Samsung','Apple','Baseus','Ugreen','Belkin','Green Lion','McDodo']},
    camera:{label:'دوربین و تجهیزات عکاسی',brands:['Canon','Nikon','Sony','Fujifilm','GoPro','DJI','Insta360']},
    laptop:{label:'لپ‌تاپ',brands:['Asus','Lenovo','HP','Acer','MSI','Apple','Dell','Microsoft']},
    computer:{label:'کامپیوتر و کیس',brands:['Asus','MSI','Gigabyte','HP','Lenovo','Dell','Apple']},
    monitor:{label:'مانیتور',brands:['Samsung','LG','Asus','MSI','AOC','Dell','BenQ','Xiaomi']},
    storage:{label:'تجهیزات ذخیره‌سازی',brands:['Western Digital','Seagate','Samsung','Kingston','ADATA','SanDisk','Crucial']},
    'computer-accessories':{label:'لوازم جانبی لپ‌تاپ و کامپیوتر',brands:['Logitech','Razer','Rapoo','A4Tech','Redragon','Green','Lenovo','HP']},
    office:{label:'تجهیزات اداری',brands:['HP','Canon','Epson','Brother','Xerox','Samsung']},
    console:{label:'کنسول بازی',brands:['Sony','Microsoft','Nintendo']},
    games:{label:'بازی کنسول و کامپیوتر',brands:['Sony','Microsoft','Nintendo','EA','Ubisoft']},
    gamepad:{label:'دسته و کنترلر بازی',brands:['Sony','Microsoft','Nintendo','8BitDo','Razer','Logitech']},
    'gaming-accessories':{label:'لوازم جانبی گیمینگ',brands:['Razer','Logitech','Redragon','Asus','MSI','Corsair','HyperX']},
    tv:{label:'تلویزیون',brands:['Samsung','LG','Sony','Xiaomi','TCL','Hisense','GPlus']},
    speaker:{label:'اسپیکر',brands:['JBL','Sony','Anker','Harman Kardon','Xiaomi','Marshall']},
    soundbar:{label:'ساندبار و سینمای خانگی',brands:['Samsung','LG','Sony','JBL','Harman Kardon']},
    microphone:{label:'میکروفون',brands:['Rode','Shure','Fifine','Maono','HyperX']},
    router:{label:'روتر و تجهیزات شبکه',brands:['TP-Link','MikroTik','Tenda','D-Link','Asus','Huawei']},
    modem:{label:'مودم و تجهیزات اینترنت',brands:['TP-Link','D-Link','Huawei','Zyxel','Tenda','Nokia']},
    'network-accessories':{label:'لوازم شبکه',brands:['TP-Link','D-Link','Ubiquiti','MikroTik','Tenda']},
    security:{label:'تجهیزات نظارتی و امنیتی',brands:['Hikvision','Dahua','Xiaomi','Imou','EZVIZ']},
    'smart-home':{label:'خانه هوشمند',brands:['Xiaomi','Samsung','TP-Link','Philips','Aqara']},
    'smart-lighting':{label:'روشنایی هوشمند',brands:['Philips','Xiaomi','TP-Link','Yeelight']},
    'smart-security':{label:'امنیت هوشمند',brands:['Xiaomi','TP-Link','Imou','EZVIZ','Hikvision']}
  };
  window.DigiYarDigilandTaxonomy = {STORE,ROOTS,SUBS};
})();
