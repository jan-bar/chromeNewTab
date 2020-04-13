/* https://chrome.google.com/webstore/detail/oficfgdfeoknbjfhommlpiekdapmnebh */
var reopen_tab_id = null;
var creating_tab = false;
var activate_tab = false;
function keep_two() {
  chrome.windows.getAll({populate: true}, function(windows){
    var tab_count = 0;
    for (var i=0; i<windows.length; i++) {
      var w = windows[i];
      tab_count += w.tabs.length;
      if (tab_count > 1) return;
    }
    if (tab_count == 1 && !creating_tab) {
      creating_tab = true;
      activate_tab = w.tabs[0].pinned;

      chrome.tabs.create({active: activate_tab, pinned: !w.tabs[0].pinned}, function(tab){
        reopen_tab_id = tab.id;
        creating_tab = false;
      });
    }
  });
}
function close_one(tab) {
  chrome.tabs.getAllInWindow(tab.windowId, function(tabs){
    if (tabs.length!=3)
      return;
    for (var i=0, closed=0; i<tabs.length && closed < tabs.length-2; i++) {
      if (tabs[i].id != tab.id && tabs[i].pinned &&
        (tabs[i].url == 'chrome://newtab/' || tabs[i].url.match('chrome-extension://.*/janbar.html'))) {
        chrome.tabs.remove(tabs[i].id);
        return;
      }
    }
  });
}
keep_two();
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (reopen_tab_id == tabId) {
    setTimeout(keep_two, 100);
    return;
  }
  keep_two();
});
chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.id != reopen_tab_id)
    reopen_tab_id = null;
  close_one(tab);
});
chrome.tabs.onActivated.addListener(function(tab) {
  chrome.windows.getAll({populate: true}, function(windows){
    var tab_count = 0;
    for (var i=0; i<windows.length; i++) {
      var w = windows[i];
      tab_count += w.tabs.length;
      if (tab_count > 2) return;
    }

    if (tab_count == 2 && w.tabs[0].pinned && w.tabs[0].id == tab.tabId &&
      (w.tabs[0].url == 'chrome://newtab/' || w.tabs[0].url.match('chrome-extension://.*/janbar.html'))) {
      chrome.tabs.update(w.tabs[1].id, {active: true});
    }
  });
});