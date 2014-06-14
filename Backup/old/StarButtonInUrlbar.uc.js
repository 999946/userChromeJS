// ==UserScript==
// @name           Star-ButtonInUrlbar
// @author		   Aris
// @modified	   林小鹿吧
// @namespace      http://tieba.baidu.com/f?ie=utf-8&kw=firefox
// @description	   代码来自扩展Star-ButtonInUrlbar,还原旧版收藏按钮,修复主页按钮丢失				   
// @include        main
// @charset        utf-8
// @version        1.0
// ==/UserScript==

"use strict";
var icos = [
'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAASCAMAAAAnpt3PAAAAvVBMVEUAAACATQOWlpbx8fHKysrfmjH025OIWjN9PgZ7SQLwzH2urq7qvmJ/UQPlqULtwmp/TAPhnzbwxmN9RwKASwPZvnKkgjPbyHzJycnqu2LQ0NCVlZWjo6PCwsL+/v65hzqVXxjBwcHOzs67u7vbjSHlq0PuyHvqumTTrl6AVwOPj4+Pj4/257jy8fH756L/9Kr90m329vX28uH5+fnr6+ve3t747sz/1n3379T/3nX/6Hv39evj4+O6urr/3YXlFQQFAAAALHRSTlMApzAQ+zL8BA0n+b3dc6zvimH+Tp3etNvjt2Oq34c11cSsXOEh4NKS32JpYyZORIwAAAG0SURBVHhepZLXrqMwFEVNMKbXQICbemuZcaGT/v+fNSfXkBF5nNkvlpa0dOx9jP4zy+Uj8bxH8v39SGaXy2xKtCjSpsRcLMwHzW5be0pyQqbjdDdNXX06DDOGJ+M0i1JLmw4TYjJOn9nnuj7bM/1OtJzu9zTX/hLTTYVIXXMgv5arC25ZXbMWX1bL3wiFnmMRuq+qPSWW44UIzd1AWaTieBTpQgncOWgrfG5YWUNK1pzxCqH3goN0YuwEIi/eEYoTIoQ4QuAgSQDaC27qe5rsBTr0eQdWWYLXcR/6NOOEH4fwJDZBU58wGy2Gn1R082h1KiGnivq35xmmkvDDT3iimAaSXimtEqyhxk5qnSxTB48cCsiVgCVbUZ+HazbPKpL5pFKjnwhJz/26/mhfLlgy9qjdN57DLSEVzcf+A6e/ab0TjBZ6ZXUJqdnrSBzYWtfB5pxRU6z+6lvX3or1EeGStVnWMoYHZESck48Pwnk0kl3vb+N46/eKcf9ZbbbebNZZO35nLSoc2HLoFNGbJOZuG88NY65sd+ao2esNdKFu1vZQyZsXyiZCzxi0ACRdBzEA8q/5A9DzP422fbINAAAAAElFTkSuQmCC',
'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAASCAMAAAAnpt3PAAAAwFBMVEUAAACBQge4YgF/TgaBTAXcwnezXQByNQSJTRByMwLtz4u8jD60ZA62XwB/UQOgYRl/TAP125WlZx+9ZQDRkDikgjOZYSKiWgHryYXxyni7jT/ChDeXWRyKTxCDUAvVnEn766+6YgB8QwLmvWr94I+vejLPk0HEfCPTrl7/9Kr/+ML/7Jn/66XvsVT3uVnen0n/34P/1n3/6ov/wV72zGb/5nn/8p7+0mv/zGb/1nDcs1etbyq8fjTtuFrHiDr/3nTdwShnAAAAKXRSTlMAFKgkot0kAzEJ39WJm3NYivO+c7S0sUTd8/7t3bVk1fdmVOz82/LI3wESa9wAAAGxSURBVHhepY/XjtswFAVVSJFUL+7rbm8h1Yu7d/P/f5VrFSfyYzIAQWCAwcGV/pPl8tVsNq8GoVejDodq32iDgdY39HajfUNsjG3SU4GuB/1slKaj1zHO+3PaQIj+HL0nyf3vOaLamHNsq+RptEAXQg+0P4b6aVmmPm3N2HbREPOi4HiIXHsMJjCVgS44F/pAMQMwy8X8dk+TskzS+22+WEKGsMc5PxwOBXwediXJmqyFEMfjkcO3nliSNP9J4xgq6OI4/ZlDRhGODi0RRhTOsiYQNYiJBQfSt7h8Er9RyBh04a+aECr2OEzRRVgjJopGwEDXq0BBt88uQLaHitTnK+uwAKJ1XQH0I2mq5AOqprO/shOw/7IZadQG8wLgeAOixvw+13ybUgtxd/n5cjnnO5e0xtTDLCyyUDe7zO+y0TND0zybTrN8irpM8aLIezyry96r06l6vPcukxf5zkDI2OUL1hjmR9OVZa28SOnM7FRdDeNaVbNuX/UNtJXlLTJ8tTHa58oaM+ZYq0+tMXR2NRxJcozrTO3W3K3MAHnryq0xHcYIgdDszAgigDgjMP/Kb+aqOwBhBGBNAAAAAElFTkSuQmCC'
]
var overlaysCSS = new Array(
'@import url(chrome://siu_os_special/skin/starinurlextra.css);',
'@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);',
'@-moz-document url(chrome://browser/content/browser.xul) {',
'	#urlbar-icons #bookmarks-menu-button {',
'	  -moz-appearance:none !important;',
'	  min-width:28px!important;',
'	  min-height:10px!important;',
'	  background: none !important;',
'	  padding:0 !important;',
'	  margin:-8px -4px !important;',
'	  border-image:none !important;',
'	  border:0 !important;',
'	  box-shadow:none !important;',
'	}',
'	#nav-bar #urlbar-icons #bookmarks-menu-button .toolbarbutton-icon {',
'	  margin: -8px 0px !important;',
'	}',
'	',
'	#urlbar-icons #bookmarks-menu-button > .toolbarbutton-menubutton-button,',
'	#urlbar-icons #bookmarks-menu-button > .toolbarbutton-menubutton-button > .toolbarbutton-icon{',
'	  -moz-appearance: none !important;',
'	  background: none !important;',
'	  background-image: none !important;',
'	  border-image:none !important;',
'	  border-color: transparent !important;',
'	  box-shadow: none !important;',
'	  transition-property: none !important;',
'      transition-duration: 0ms !important;',
'	}',
'	#urlbar-icons #bookmarks-menu-button,',
'	#urlbar-icons #bookmarks-menu-button[starred]:hover	{',
'	  opacity:0.85 !important;',
'	}',
'	',
'	#urlbar-icons #bookmarks-menu-button:hover,',
'	#urlbar-icons #bookmarks-menu-button[starred],',
'	#urlbar-icons #bookmarks-menu-button .toolbarbutton-icon	{',
'	  opacity:1.0 !important;',
'	}',
'	',
'	/* icons sizes */',
'	#urlbar-icons #bookmarks-menu-button .toolbarbutton-icon {',
'	  -moz-image-region: rect(0px 18px 18px 0px);',
'	}',
'	#urlbar-icons #bookmarks-menu-button:hover .toolbarbutton-icon {',
'	  background-image: radial-gradient(circle closest-side, hsla(45,100%,73%,.3), hsla(45,100%,73%,0));',
'	  -moz-image-region: rect(0px 36px 18px 18px);',
'	}',
'	#urlbar-icons #bookmarks-menu-button:hover:active .toolbarbutton-icon {',
'	  background-image: radial-gradient(circle closest-side, hsla(45,100%,73%,.1), hsla(45,100%,73%,0));',
'	  -moz-image-region: rect(0px 54px 18px 36px);',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred] .toolbarbutton-icon {',
'	  -moz-image-region: rect(0px 18px 18px 0px);',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred]:hover .toolbarbutton-icon {',
'	  background-image: radial-gradient(circle closest-side, hsla(45,100%,73%,.3), hsla(45,100%,73%,0));',
'	  -moz-image-region: rect(0px 36px 18px 18px);',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred]:hover:active .toolbarbutton-icon {',
'	  background-image: radial-gradient(circle closest-side, hsla(45,100%,73%,.1), hsla(45,100%,73%,0));',
'	  -moz-image-region: rect(0px 54px 18px 36px);',
'	}',
'	',
'	/* hide/remove what is not needed */',
'	/*#urlbar[pageproxystate="invalid"] > #urlbar-icons #bookmarks-menu-button,*/',
'	#urlbar-icons #star-button,',
'	#urlbar-icons #bookmarks-menu-button > .toolbarbutton-menubutton-dropmarker,',
'	#bookmarked-notification,',
'	#bookmarked-notification-dropmarker-icon {',
'	  visibility: collapse !important;',
'	}',
'	/* hide bookmarking animation */',
'	#bookmarks-menu-button *,',
'	#bookmarked-notification,',
'	#bookmarked-notification-dropmarker-icon {',
'	  animation: none !important;',
'	}',
'	#urlbar-icons #bookmarks-menu-button .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[0]+'");',
'	}',
'	#urlbar-icons #bookmarks-menu-button:hover .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[0]+'");',
'	}',
'	#urlbar-icons #bookmarks-menu-button:hover:active .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[0]+'");',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred] .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[1]+'");',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred]:hover .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[1]+'");',
'	}',
'	#urlbar-icons #bookmarks-menu-button[starred]:hover:active .toolbarbutton-icon {',
'	  list-style-image: url("'+icos[1]+'");',
'	}',
'}').join("").toString();
var pi = document.createProcessingInstruction('xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(overlaysCSS) + '"');
document.insertBefore(pi, document.documentElement);


Components.utils.import("resource:///modules/CustomizableUI.jsm");

if (typeof starinurlbar == "undefined") {var starinurlbar = {};};
if (!starinurlbar.siu) {starinurlbar.siu = {};};

starinurlbar.siu = {

  init: function() {
	
	CustomizableUI.addWidgetToArea("bookmarks-menu-button", CustomizableUI.AREA_NAVBAR);
	
	// use timeout to improve compatibility
	setTimeout(function(){
		try{
			document.getElementById("urlbar-icons").insertBefore(document.getElementById("bookmarks-menu-button"), null);
		} catch(e){}
	},150);

  }
  
};

starinurlbar.siu.init();
