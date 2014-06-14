// ==UserScript==
// @name           关闭时禁用abp等扩展.uc
// @namespace      http://tieba.baidu.com/f?kw=firefox
// @description	   关闭时禁用abp等扩展.uc
// @include        main
// @author         ywzhaiqi
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function(){

	let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
	Cu.import("resource://gre/modules/AddonManager.jsm");

	const ABP_ID = ['{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}','firebug@software.joehewitt.com','elemhidehelper@adblockplus.org'];
	//abp ，firebug ， abphelper

	function disableExtensions(disable){
		for(var i in ABP_ID){
			AddonManager.getAddonByID(ABP_ID[i], function(addon) {
				addon.userDisabled = disable;
			});
		}
	}

	setTimeout(function(){
		disableExtensions(false);
	},3000);

	// firefox 关闭时禁用
	window.addEventListener("unload", function(){
		disableExtensions(true);
	}, false);

})()