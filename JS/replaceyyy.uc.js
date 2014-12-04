// (function (x) {
// 	gBrowser.tabContainer.addEventListener("TabAttrModified", x, false);
// })(function (e) {
// 	var tab = e.target;
// 	var yyy = /YYY/ig;
// 	var lxlb = "\u7b28\u86cb";
// 	tab.label = tab.label.replace(yyy,lxlb);
// 	content.document.title = content.document.title.replace(yyy,lxlb);
// 	var es = content.document.body.querySelectorAll("*");
// 	Array.map(es, function(e){
// 		if(e.innerHTML && e.innerHTML.search(yyy) != -1 && e.nodeName != 'SCRIPT' && e.children.length < 1){
// 			e.innerHTML = e.innerHTML.replace(yyy,lxlb);
// 		}
// 		if(e.value && e.value.search(yyy) != -1){
// 			e.value = e.value.replace(yyy,lxlb);
// 		}
// 	});
// });