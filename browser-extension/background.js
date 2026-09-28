const APP_URL='https://petromosi-pixel.github.io/DigiYar-GPT/';
chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.create({id:'dy-root',title:'دیجی‌یار',contexts:['link','page','selection']});
  chrome.contextMenus.create({id:'dy-compare-link',parentId:'dy-root',title:'افزودن به مقایسه در دیجی‌یار',contexts:['link']});
  chrome.contextMenus.create({id:'dy-copy-link',parentId:'dy-root',title:'کپی لینک محصول',contexts:['link','page']});
  chrome.contextMenus.create({id:'dy-copy-name',parentId:'dy-root',title:'کپی نام محصول',contexts:['link','page','selection']});
});
async function copyToTab(tabId,text){
  try{await chrome.scripting.executeScript({target:{tabId},func:(value)=>navigator.clipboard.writeText(value),args:[text]});}catch(_){}
}
chrome.contextMenus.onClicked.addListener(async(info,tab)=>{
  if(!tab)return;
  const url=info.linkUrl||info.pageUrl||'';
  const name=(info.selectionText||'').trim()||tab.title||url;
  if(info.menuItemId==='dy-compare-link'){
    chrome.tabs.create({url:APP_URL+'?dy_product_url='+encodeURIComponent(url)+'&dy_product_name='+encodeURIComponent(name)});
  }else if(info.menuItemId==='dy-copy-link'){
    await copyToTab(tab.id,url);
  }else if(info.menuItemId==='dy-copy-name'){
    await copyToTab(tab.id,name);
  }
});