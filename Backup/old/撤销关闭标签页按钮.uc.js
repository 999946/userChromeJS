// ==UserScript==
// @name           undoCloseTabButtonMod.uc.js
// @namespace      undoCloseTabButtonMod@fooxx.cn
// @description    撤销关闭标签页按钮
// @include        chrome://browser/content/browser.xul
// @version        1.1.1.3
// @updateURL     https://j.mozest.com/ucscript/script/71.meta.js
// ==/UserScript==

/* :::: 撤销关闭标签页按钮 :::: */

location == "chrome://browser/content/browser.xul" && (function undoCloseTabButton() {

  const locale = (Components.classes["@mozilla.org/preferences-service;1"]
  .getService(Components.interfaces.nsIPrefBranch).getCharPref("general.useragent.locale")).indexOf("zh")==-1;

  //添加按钮,代码来自:http://blog.bitcp.com/archives/452
  var navigator = document.getElementById("navigator-toolbox");
  if (!navigator || navigator.palette.id !== "BrowserToolbarPalette") return;
  var btn = document.createElement("toolbarbutton");
  btn.id = "undoclosetab-button";
  btn.setAttribute("label", locale?"Undo Close Tab":"\u64A4\u9500\u5173\u95ED\u6807\u7B7E\u9875");
  btn.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
  btn.setAttribute("command", "History:UndoCloseTab");
  btn.setAttribute("tooltiptext", locale?"Undo Close Tab":"\u64A4\u9500\u5173\u95ED\u6807\u7B7E\u9875");
  btn.setAttribute("type", "menu-button"/* 下拉菜单,若需要右键菜单请替换为 "context", "_child" */);
  btn.setAttribute("removable", "true");
  btn.style.listStyleImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAatJREFUeNpi/P//PwMlgImBQsACIrRNbMHOuHb2CCNMQsvYxgFIJQCxPRALAPFBIJ4AVHMApgbkerALWFhYwBgG9Mwd5gP5+4E4HogVgFgAiP1BYiA5ZBcwgkwxtnGFBYQgEK8HYgcCLl9w7uieRJBesLVMUNsZGZkP/v//Vw+mSkFZ7VWQv99NEHvHrj2K165ckIFKJZjYe2wE0hvAOpmZWeGuh4WrnYPTza7agiVA5nYQP9LP2T6roi373OkTSiA+v6BgPtwAFlYWFPclJCSdSInwmcbIyLgYSfjsyUs3OS5dONMK4vz6+cscHo0gFyDjxYsXW9h7hy+y8wpDSSQ37jxYCVPDw8v3Fx6NyDGAD6xevdYJplZJWeUx3IC9G5cux6WJkXEZnP3v378mZhZmMNvSzHg73ACgX6MI2e4ZljgfGEMSIBeoqmk+ifB1mgM3gBDwiUybD02VDHz8fF+r8lOmAy29Dk8H+EBgbOZ+WMLi5eP/mp2euFFcRHACA3J6xgeOnr06JbOs+R0Iv/vwaTpQvTyKXkIGgDS8+fCpD4SBbC40OQaAAAMAZs+cq1JeSBMAAAAASUVORK5CYII=)";
  navigator.palette.appendChild(btn);

  var popup = btn.appendChild(document.createElement("menupopup"));
  popup.setAttribute("onpopupshowing", "this.parentNode.populateUndoSubmenu();");
  popup.setAttribute("oncommand", "event.stopPropagation();");
  popup.setAttribute("context", "");
  popup.setAttribute("tooltip", "bhTooltip");
  popup.setAttribute("popupsinherittooltip", "true");

  btn._ss = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);
  btn._undoCloseMiddleClick = HistoryMenu.prototype._undoCloseMiddleClick;
  btn.populateUndoSubmenu = eval("(" + HistoryMenu.prototype.populateUndoSubmenu.toString().replace(/._rootElt.*/, "") + ")");

  /*
  //强制使用默认主题图标
  var ss = document.styleSheets[0];
  ss.insertRule('#undoclosetab-button .toolbarbutton-icon {list-style-image: url("chrome://browser/skin/Toolbar.png"); -moz-image-region: rect(0, 72px, 18px, 54px); -moz-transform: scaleX(-1) rotate(30deg);}', ss.cssRules.length);
  */

  UpdateUndoCloseTabCommand = function() {
    document.getElementById("History:UndoCloseTab").setAttribute("disabled", Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore).getClosedTabCount(window) == 0);
  };
  UpdateUndoCloseTabCommand();
  gBrowser.mTabContainer.addEventListener("TabClose", function() {UpdateUndoCloseTabCommand();}, false);
  gBrowser.mTabContainer.addEventListener("SSTabRestoring", function() {UpdateUndoCloseTabCommand();}, false);
  gSessionHistoryObserver.observe = eval("(" + gSessionHistoryObserver.observe.toString().replace(/(?=}$)/, "UpdateUndoCloseTabCommand();") + ")");
  
  //更新工具栏,代码来自:http://blog.bitcp.com/archives/452
  var toolbars = document.querySelectorAll("toolbar");
  Array.slice(toolbars).forEach(function (toolbar) {
      var currentset = toolbar.getAttribute("currentset");
      if (currentset.split(",").indexOf("undoclosetab-button") < 0) return;
      toolbar.currentSet = currentset;
      try {
          BrowserToolboxCustomizeDone(true);
      } catch (ex) {
      }
  });
})();