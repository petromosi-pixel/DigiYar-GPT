const APP_URL='https://petromosi-pixel.github.io/DigiYar-GPT/'; // Replace with the deployed DigiYar origin if different.
chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.create({id:'dy-compare-link',title:'افزودن به مقایسه در دیجی‌یار',contexts:['link']});
  chrome.contextMenus.create({id:'dy-compare-page',title:'افزودن این صفحه به مقایسه در دیجی‌یار',contexts:['page']});
});
chrome.contextMenus.onClicked.addListener((info,tab)=>{
  const url=info.linkUrl||info.pageUrl||'';
  if(!url)return;
  const name=(info.selectionText||'').trim()||tab.title||url;
  const target=APP_URL+'?dy_product_url='+encodeURIComponent(url)+'&dy_product_name='+encodeURIComponent(name);
  chrome.tabs.create({url:target});
});