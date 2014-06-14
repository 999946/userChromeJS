// ==UserScript==
// @name           copy.uc
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    ダウンロードマネージャー用のダウンロードを監視し音を鳴らす
// @include        main
// @compatibility  Firefox 3.0 more
// @author         Alice0775
// @version        2009/11/28
// ==/UserScript==
gURLBar.addEventListener("focus", function(e){
	goDoCommand("cmd_copy");
}, false);

