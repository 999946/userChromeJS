// ==UserScript==
// @Name 			UndoClosedTabs.uc.js
// @author 			lyttmonkey
// @version 		0.1
// @description     http://www.kafan.cn/forum.php?mod=viewthread&tid=1729699
// @description		历史按钮上右键撤销最近一个关闭的标签
// @compatibility   Firefox 29+
// ==/UserScript==
if(location == "chrome://browser/content/browser.xul"){
	function changeHistoryAction() {
		var UndoClosedTabs = document.getElementById('history-panelmenu');
		if(UndoClosedTabs && !UndoClosedTabs.changeHistoryAction){
			UndoClosedTabs.addEventListener("click", function (e) {
				if (e.button == 2) {
					e.preventDefault();
					undoCloseTab();
				}
			}, false);
			UndoClosedTabs.changeHistoryAction = 1 ;
		}
	};
	window.addEventListener("aftercustomization", changeHistoryAction, false);
	changeHistoryAction();
}