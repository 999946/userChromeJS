// ==UserScript==
// @name           还原自定义按钮位置.uc
// @namespace      http://tieba.baidu.com/f?kw=firefox
// @description	   还原自定义按钮位置
// @include        main
// @compatibility  Firefox 29+
// @author         林小鹿吧
// ==/UserScript==
function $(id) { 
	return document.getElementById(id) || gNavToolbox.palette.querySelector("#" + id);
}

window.addEventListener("DOMContentLoaded", function(){
	window.removeEventListener("DOMContentLoaded", arguments.callee, false);
	let areas = CustomizableUI.areas;
	for(var i in areas){
		try {
			let customizableNode = CustomizableUI.getWidgetIdsInArea(areas[i]);
			customizableNode.forEach(function (node) {
				let placement = CustomizableUI.getPlacementOfWidget(node);
				let doc = $(node);
				if (doc && placement && placement.area && node != 'personal-bookmarks') {
					//console.log(node +' ---->> '+ placement.area);
					CustomizableUI.addWidgetToArea(node, placement.area);
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
}, false);