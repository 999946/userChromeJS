// ==UserScript==
// @name           临时userscripts.org重定向.uc.js
// @namespace      externalAppButton@gmail.com
// @description    临时userscripts.org重定向添加8080
//from：http://stackoverflow.com/questions/2237108/redirecting-request-nsihttpchannel-in-firefox-extensions
// @include        main
// @charset        UTF-8
// @version        1
// ==/UserScript==

var httpRequestObserver =
{ 
  observe: function(subject, topic, data) {
    if (topic == "http-on-modify-request") {
        var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);     
        var uri = subject.URI;
		//console.log('[request]>>>>'+uri.host);
		if(uri.host == "userscripts.org" && uri.port != '8080'){
			var channel = subject.QueryInterface(Ci.nsIHttpChannel);
                channel.cancel(Cr.NS_BINDING_ABORTED);
				var newURL = 'http://userscripts.org:8080'+uri.path;
                var domWin = channel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
                var browser = gBrowser.getBrowserForDocument(domWin.top.document);
                //redirect
                browser.loadURI(newURL);
		}
    }
  },

  get observerService() {
    return Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
  },

  register: function() {
    this.observerService.addObserver(this, "http-on-modify-request", false);

  },

  unregister: function() {
    this.observerService.removeObserver(this, "http-on-modify-request");

  }
};
httpRequestObserver.register();