function initMsg(){let a=document.querySelectorAll("[data-i18n]");for(const b of a)b.textContent=chrome.i18n.getMessage(b.dataset.i18n);document.getElementById("search-input").placeholder=chrome.i18n.getMessage("popSearch")}function init(){initMsg();document.getElementById("options").addEventListener("click",function(a){a.preventDefault();chrome.runtime.openOptionsPage()})}init();
