// ==UserScript==
// @name           SmartProxyForChina.uc.js
// @description    类似AutoProxy的UC脚本
// @author         dannylee
// @namespace      lidanny2012/smartproxy@gmail.com
// @include        main
// @license        MIT License
// @compatibility  Firefox 13-21
// @charset        UTF-8
// @version        1.0.7.3
// @note           1.0.7 2013/5/13 Fixed screen 1360X768 bugs
// @note           1.0.6 2013/5/09 Fixed treeview bug in FF22
// @note           1.0.5 2013/4/30 Fixed bug and change icon
// @note           1.0.4 2013/4/29 Fixed bug and url Unicode's view
// @note           1.0.3 2013/4/28 ADD gfwlist download and update
// @note           1.0.2 2013/4/26 Update For Use ABP 2.2.3 Matcher and Filter Class
// @note           1.0.1 2013/4/11 Remove E4X
// @note           1.0.0 2012/3/16 add UI for rule and import gfwlist file
// @note           0.0.5 2011/10/21 limit proxy server numbers
// @note           0.0.4 2011/8/19 update for nsIProtocolProxyService
// @note           0.0.3 2011/8/18 update filter json file
// @note           0.0.2 2011/8/15 update for abp filter class and match
// @note           0.0.1 2011/8/13 Create Project
// @note           与AutoProxy或其它代理脚本同时使用会冲突
// @note           不依赖ABP, 不安装ABP也可以使用, 也可以与ABP同时使用。
// @note           Firefox代理设置为无，最好打开Firefox远程DNS解析
// @note           附加组件栏按钮, 左键点击切换代理模式，右键点击打开系统规则和设置。
// @note           下拉菜单切换代理模式和智能化的对当前站点的代理规则进行操作
// @note           report bug and linkurl: https://g.mozest.com/thread-43513-1-1
// @updateURL     https://j.mozest.com/ucscript/script/104.meta.js
// @screenshot    http://j.mozest.com/images/uploads/previews/000/00/01/c8e11c00-f2fd-eb7f-cc32-cad6a55ae316.jpg http://j.mozest.com/images/uploads/previews/000/00/01/thumb-c8e11c00-f2fd-eb7f-cc32-cad6a55ae316.jpg
// ==/UserScript==

(function(css){
  if (window.SmartProxy) {
  	window.SmartProxy.uninit();
  	delete window.SmartProxy;
  }
  
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cr = Components.results;
  const Cu = Components.utils;
  if (!window.Services)
     Cu.import("resource://gre/modules/XPCOMUtils.jsm");
  const ProxySrv = Cc['@mozilla.org/network/protocol-proxy-service;1'].getService(Ci.nsIProtocolProxyService);
  const dirService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
  const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
  const _eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
  const _idnService = Cc["@mozilla.org/network/idn-service;1"].getService(Ci.nsIIDNService);
  const promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
  const clipboard = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
  const clipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  const FileInputStream = Components.Constructor("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream", "init");
  const ConverterInputStream = Components.Constructor("@mozilla.org/intl/converter-input-stream;1", "nsIConverterInputStream", "init");
  const FileOutputStream = Components.Constructor("@mozilla.org/network/file-output-stream;1", "nsIFileOutputStream", "init");
  const ConverterOutputStream = Components.Constructor("@mozilla.org/intl/converter-output-stream;1", "nsIConverterOutputStream", "init");
  
  const IPREG = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
  const PORTREG = /^\+?[1-9][0-9]*$/;
  const SUBSCRIPTION_UPDATE_SUCCESS = 'DOWNLOAD SUCCESS';
  var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  
  var EXPORTED_SYMBOLS = ["SmartProxy"];
  
window.SmartProxy = {
	QueryInterface: function(uuid) {
      if (!uuid.equals(Ci.nsISupports)) {
        throw Cr.NS_ERROR_NO_INTERFACE;
      }
      return this;
  },
    
	_ps:  Components.classes["@mozilla.org/preferences-service;1"].
	      getService(Components.interfaces.nsIPrefService).
	      getBranch("userChromeJS.SmartProxy.").
	      QueryInterface(Components.interfaces.nsIPrefBranch2),
	
	Prefs: {},
	SPfile: null,
	SPfilters: [],
  icon: null,
  popupid: null,
  MsgBox: null,
  SVRROWS: null,
  modebtn: null,
  noproxy: null,
  autoproxy: null,
  globalproxy: null,
  siteProxyOn: null,
  reportgfwlist: null,
  Treevisible: false,
  SPfilterActionMenu: null,
  _isready: false,
  _FilterIsReady: false,
  mode: ['disabled', 'auto', 'global'],
	
	init: function(){
		this._isready = false;
		this._FilterIsReady = false;
		this.loadSPoverloay();
	},
	
	uninit: function(){
		if (SmartProxy.Proxy.isRegisted)
		  ProxySrv.uninit();
		SPdefaultMatcher.clear();
		this.SPfilters = null;
		this._ps.removeObserver("", this, false);
    this.popupid.parentNode.removeChild(this.popupid);
    this.icon.parentNode.removeChild(this.icon);
		var e = E("sp-mains");
  	  if (e) e.parentNode.removeChild(e);
  	var e = E("SP-splitter");
  	  if (e) e.parentNode.removeChild(e);
		this.Prefs = {};
	},
	
	loadSPjson: function(){
		this.SPfile = this._getSmartProxyfile(this.Prefs.patternsfile);
		var afile = this._getSmartProxyfile("SPpatterns.json");
		if (afile.exists())
		  this._importpatternsfile(afile);
		else {
		  if (this.SPfile.exists()) {
		    this._importSUBpatternsfile(this.SPfile);
		  } else {
		  	this.showMsg("没有任何代理规则！");
		  	this._ps.setCharPref("proxyMode", "disabled");
		  }
		}
	},
	
	loadSPoverloay: function() {//urlbar-icons  
	   var overlay = '\
        <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                 xmlns:html="http://www.w3.org/1999/xhtml"> \
            <toolbarpalette id="addon-bar">\
                 <toolbarbutton id="SmartProxy-button" label="SmartProxy" \
                               class="toolbarbutton-1 chromeclass-toolbar-additional" type="menu" removable="true"\
                               state="disabled" popup="sp-popup" tooltiptext="代理状态:" onclick="SmartProxy.iconclick(event);">\
                   <menupopup id="SmartProxy-popup" onpopupshowing="SmartProxy.setpopupenabled(event);">\
                     <menuitem id="siteProxyOn" label="对%s启用代理" hidden="true" onclick="SmartProxy.setUrlproxy(event);"/>\
                     <menuitem id="reportgfwlist" label="向\'哥扶我\'报告本站问题" onclick="SmartProxy.commandreport();"/>\
                     <menu label="默认代理服务器" id="DefaultProxyID">\
                       <menupopup id="sp-popup" />\
                     </menu>\
                   </menupopup>\
                 </toolbarbutton>\
            </toolbarpalette>\
            <vbox id="appcontent">\
              <splitter id="SP-splitter" hidden="true"/>\
              <vbox id="sp-mains" hidden="true">\
              <hbox>\
                <vbox id="sprulelist-details" height="300"  flex="1">\
                 <groupbox  flex="1">\
 			           <caption label="代理规则列表" />\
 			             <hbox pack="end">\
 			              <button id="SPupdateSubUrl" label="订阅Url" max-width="50" tooltiptext="修改\'哥扶我\'规则下载地址" oncommand="SmartProxy.updatesubUrl();"/>\
 			              <button id="SPupdateSubFilter" label="更新订阅" max-width="50" tooltiptext="强制更新\'哥扶我\'规则" oncommand="SmartProxy.updatesubFilter();"/>\
 			              <button id="SPaddSubFilter" label="载入订阅" max-width="50" tooltiptext="合并\'哥扶我\'规则到全局规则" oncommand="SmartProxy.addsubFilter();"/>\
 			              <spacer flex="1" />\
 			              <label value="规则主页" max-width="50" class="actionbtn" onclick="SmartProxy.loadGFWurl();"/>\
 			              <spacer flex="1" />\
 			              <button id="SPfindButton" label="查找" max-width="30" oncommand="SmartProxy.EID(\'findbar\').startFind(SmartProxy.EID(\'findbar\').FIND_NORMAL)"/>\
                    <button id="SPfilterActionButton" type="menu" max-width="50" label="规则动作">\
                      <menupopup id="SPfilterActionMenu" onpopupshowing="SmartProxy.FilterActions.fillActionsPopup();">\
                        <menuitem id="SPfilters-edit-command" label="编辑" oncommand="SmartProxy.FilterActions.startEditing();"/>\
                        <menuitem id="SPfilters-copy-command" label="复制" oncommand="SmartProxy.FilterActions.copySelected(true);"/>\
                        <menuitem id="SPfilters-delete-command" label="删除" oncommand="SmartProxy.FilterActions.deleteSelected();"/>\
                        <menuitem id="SPfilters-Unicode-command" label="查看解码" oncommand="SmartProxy.FilterActions.ConvertUnicode();"/>\
                      </menupopup>\
                    </button>\
                    <button id="SPaddFilterButton" label="添加规则" max-width="50" oncommand="SmartProxy.FilterActions.insertFilter();"/>\
                    <button id="SPsaveAllFilter" label="保存规则" max-width="50" tooltiptext="保存全部规则" oncommand="SmartProxy.saveAllFilter();"/>\
                  </hbox>\
                   <tree id="SPfiltersTree" flex="1" editable="true" seltype="multiple" enableColumnDrag="false" hidecolumnpicker="true">\
                    <treecols>\
                      <treecol id="col-enabled" label="启用" cycler="true" flex="0" persist="width ordinal sortDirection hidden"/>\
                      <splitter class="tree-splitter"/>\
                      <treecol id="col-filter" label="规则" flex="10" persist="width ordinal sortDirection hidden"/>\
                      <splitter class="tree-splitter"/>\
                      <treecol id="col-slow" label="!" flex="0" width="16" persist="width ordinal sortDirection hidden"/>\
                    </treecols>\
                    <treechildren id="SPfiltersTreeChildren" oncontextmenu="SmartProxy.SPfilterActionMenu.openPopupAtScreen(event.screenX, event.screenY, true);"/>\
                  </tree>\
                  <findbar id="findbar"/>\
             	  </groupbox>\
                </vbox>\
                <vbox id="sp-contents" width="520">\
                   <hbox>\
                   <spacer flex="1" />\
                   <toolbarbutton id="closesliderbar" width="18" height="12" tooltiptext="关闭" oncommand="SmartProxy.closeslitterbar();"/>\
                   </hbox>\
                   <hbox id="sp-main">\
                         <groupbox  id="sp-proxy" flex="2" hidden="false" height="200" width="100%"><caption id="SPPROXY" label="代理服务器设置" />\
                           <grid>\
                            <rows id="SROWS">\
                              <row id="discription">\
                                <label value="名称"/>\
                                <label value="主机"/>\
                                <label value="端口"/>\
                                <hbox>\
                                  <label value="http"/>\
                                  <label value="socks4"/>\
                                  <label value="socks5"/>\
                                </hbox>\
                                <label value="默认"/>\
                              </row>\
                           </rows>\
                          </grid>\
                          <spacer flex="1" />\
                          <radiogroup id="proxymode" oncommand="SmartProxy.setMode();">\
                             <p><radio label="禁用代理" id="noproxy" value="disabled" checked="true"/>\
                             <radio label="自动代理" id="autoproxy" value="auto" />\
                             <radio label="全局代理" id="globalproxy" value="global" /><spacer flex="1" /><label value="保存服务器配置" class="actionbtn" onclick="SmartProxy.savePrefs();" /></p>\
                           </radiogroup>\
                         </groupbox>\
                   </hbox>\
                   <hbox id="sp-footer">\
                    <label id="SPMESSAGE" value="" />\
                   </hbox>\
                </vbox>\
              </hbox>\
              </vbox>\
            </vbox>\
        </overlay>';
        overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
        window.userChrome_js.loadOverlay(overlay, SmartProxy);
        SmartProxy.style = addStyle(css);
	},
	
	observe: function(aSubject, aTopic, aData){
    	if (aTopic == "xul-overlay-merged") {
    		if (!this._isready) {
    			this.refreshPrefs();
    			this._ps.addObserver("", this, false);
      		Application.console.log("SmartProxy界面加载完毕！");
      		this.icon = E("SmartProxy-button");
      		this.popupid = E("sp-popup");
      		this.MsgBox = E("SPMESSAGE");
      		this._isready = true;
      		this.updateUI();
      		this._addSVRlist();
      		this.loadSPjson();
      		SmartProxy.FilterActions.init();
      		SmartProxy.FilterSearch.init();
      		if (!SmartProxy.Proxy.isRegisted)
      		SmartProxy.Proxy.init();
        }
      }
      if (aTopic == "nsPref:changed") {
        switch (aData) {
          case 'default_proxy':
              this.Prefs.default_proxy = this._ps.getIntPref("default_proxy");
              this.updatetips();
              SmartProxy.Proxy.setdefaultProxy();
							break;
					case 'knownProxy':
              this.Prefs.knownProxy = this._ps.getCharPref("knownProxy");
              if (SmartProxy.Proxy.isRegisted)
              SmartProxy.Proxy.uninit();
              this._setproxyConfig();
              this._addSVRlist();
              this.updatetips();
              if (!SmartProxy.Proxy.isRegisted)
              SmartProxy.Proxy.init();
							break;
				  case 'proxyMode':
              this.Prefs.proxyMode = this._ps.getCharPref("proxyMode");
              this.updateSHOWMODE();
              this.updatetips();
							break;
        }
      }
  },
  
  updateUI: function() {
    this.SVRROWS = E("SROWS");
  	this.modebtn = E("proxymode");
  	this.noproxy = E("noproxy");
  	this.autoproxy = E("autoproxy");
  	this.globalproxy = E("globalproxy");
  	this.siteProxyOn = E("siteProxyOn");
    this.reportgfwlist = E("reportgfwlist");
    this.SPfilterActionMenu = E("SPfilterActionMenu");
  	this.updateSHOWMODE();
    this.updatetips();
  },
  
  updateSHOWMODE: function() {
  	this.modebtn.value = this.Prefs.proxyMode;
  	if (this.Prefs.proxyMode == this.mode[0])
  	  this.modebtn.selectedItem = this.noproxy;
    else if (this.Prefs.proxyMode == this.mode[1])
    	this.modebtn.selectedItem = this.autoproxy;
    else if (this.Prefs.proxyMode == this.mode[2])
    	this.modebtn.selectedItem = this.globalproxy;
  },
  
  _addSVRlist: function(){
  	var pmenu = null;
  	while (this.SVRROWS.lastChild) {
  		if (this.SVRROWS.lastChild.id != "discription")
        this.SVRROWS.removeChild(this.SVRROWS.lastChild);
      else
      	break;
    }
    while (this.popupid.firstChild) {
        this.popupid.removeChild(this.popupid.firstChild);
    }
    for (var i=0; i < this.proxyConfigs.length; i++) {
  	  this._createServerList(i, this.proxyConfigs[i]);
  	  pmenu = document.createElement("menuitem");
  	  pmenu.setAttribute("id", "POPUP_" + i.toString());
  	  pmenu.setAttribute("type", "radio");
  	  pmenu.setAttribute("name", "SVRDEF");
  	  pmenu.setAttribute("label", this.proxyConfigs[i].name + " " + this.proxyConfigs[i].host + ":" + this.proxyConfigs[i].port);
  	  if (i == this.Prefs.default_proxy)
  	    pmenu.setAttribute("checked", true);
  	  pmenu.setAttribute("oncommand", "SmartProxy.popdefaultproxy(event);");
  	  this.popupid.appendChild(pmenu);
  	}
  },
  
  updatetips: function(){
  	if (this.icon.state != this.Prefs.proxyMode)
      this.icon.setAttribute("state", this.Prefs.proxyMode);
	  if (this.Prefs.proxyMode == this.mode[0])
  	  this.icon.setAttribute("tooltiptext", "代理状态: 无");
    else if (this.Prefs.proxyMode == this.mode[1])
    	this.icon.setAttribute("tooltiptext", "代理状态: 自动代理 \n " + this.formattiptext());
    else if (this.Prefs.proxyMode == this.mode[2])
    	this.icon.setAttribute("tooltiptext", "代理状态: 全局代理 \n " + this.formattiptext());
    this.showMsg(this.icon.getAttribute("tooltiptext") + " " + this.formattiptext());
  },
  
  formattiptext: function(){
  	var tips = this.proxyConfigs[this.Prefs.default_proxy].name + " " + this.proxyConfigs[this.Prefs.default_proxy].host + ":" + this.proxyConfigs[this.Prefs.default_proxy].port;
  	return tips;
  },
  
  savePrefs: function() {
  	var svrstr = "";
  	for (let row=this.SVRROWS.firstChild.nextSibling; row; row=row.nextSibling) {
  	  var setstr = "";
  	  var aELM = row.firstChild;
  	  if (aELM.value.trim() == "")
  	     setstr = "未命名";
  	  else
  	  	 setstr = aELM.value.trim();
  	  aELM = aELM.nextSibling;
  	  if (aELM.value.trim() == "")
  	     setstr = setstr + ";" + "127.0.0.1";
  	  else if (IPREG.test(aELM.value.trim())) {
  	     setstr = setstr + ";" + aELM.value.trim();
  	  } else {
  	    alert("你输入的是神马主机?");
  	    return;
  	  }
  	  aELM = aELM.nextSibling;
  	  if (aELM.value.trim() == "")
  	     setstr = setstr + ";" + "80";
  	  else if (PORTREG.test(aELM.value.trim())) {
  	     setstr = setstr + ";" + aELM.value.trim();
  	  } else {
  	    alert("你输入的是神马端口号?");
  	    return;
  	  }
  	  aELM = aELM.nextSibling;
  	  setstr = setstr + ";" + aELM.value;
  	  if (svrstr == "")
  	    svrstr = setstr;
  	  else 
  	  	svrstr = svrstr+ "$" + setstr;
  	}
  	this._ps.setCharPref("knownProxy", svrstr);
  	this.showMsg("服务器配置保存成功!");
  },
  
  refreshPrefs: function() {
  	if (!this._ps.prefHasUserValue("knownProxy")) { 
        this._ps.setCharPref("knownProxy","Free Gate;;8580;$Puff;;1984;$ssh -D;;7070;socks$Toonel;;8080;$Tor;;9050;socks$Wu Jie;;9666;$Your Freedom;;8080;");
    }
    if (!this._ps.prefHasUserValue("default_proxy")) { 
        this._ps.setIntPref("default_proxy", 5);
    }
    if (!this._ps.prefHasUserValue("proxyMode")) { 
        this._ps.setCharPref("proxyMode", "auto");
    }
    if (!this._ps.prefHasUserValue("curVersion")) { 
        this._ps.setCharPref("curVersion", "0.4b2.2011041023");
    }
    if (!this._ps.prefHasUserValue("patternsfile")) { 
        this._ps.setCharPref("patternsfile", "SPpatterns.ini");
    }
    if (!this._ps.prefHasUserValue("url")) { 
        this._ps.setCharPref("url", "https://autoproxy-gfwlist.googlecode.com/svn/trunk/gfwlist.txt");
    }
    this.Prefs = {
  	    default_proxy : this._ps.getIntPref("default_proxy"),
  	    knownProxy : this._ps.getCharPref("knownProxy"),
  	    proxyMode : this._ps.getCharPref("proxyMode"),
  	    curVersion : this._ps.getCharPref("curVersion"),
  	    patternsfile : this._ps.getCharPref("patternsfile"),
  	    url : this._ps.getCharPref("url")
  	}
  	this._setproxyConfig();
	},
	
	_setproxyConfig: function(){
		this.proxyConfigs = [];
	  this.proxyConfigs = this.Prefs.knownProxy.split("$").map(
		   function(str) {
			   var entry = str.split(";");
			   var SRV = {};
			   SRV.name = entry[0];
         SRV.host = entry[1] == '' ? '127.0.0.1' : entry[1];
         SRV.port = entry[2];
         SRV.type = /^socks4?$/i.test(entry[3]) ? entry[3] : 'http';
			   return(SRV);
		   }
    );
	},
	
	_createServerList: function(aid, aProxy) {
		var proxyRow  = document.createElement("row");
		proxyRow.setAttribute("id", "PROXY_" + aid.toString());
		var proxyName = document.createElement("textbox");
    var proxyHost = document.createElement("textbox");
    var proxyPort = document.createElement("textbox");
    var proxyType = document.createElement("radiogroup");
    var proxySel = document.createElement("checkbox");
    proxySel.setAttribute("checked", (this.Prefs.default_proxy == aid) ? true : false);
    proxySel.setAttribute("oncommand", "SmartProxy.setdefaultproxy(event);");
    proxyName.setAttribute("class", "proxyName");
    proxyHost.setAttribute("class", "proxyHost");
    proxyPort.setAttribute("class", "proxyPort");
    proxySel.setAttribute("class", "selBox");
    proxyType.setAttribute("orient", "horizontal");
    var http = document.createElement("radio");
    var socks = document.createElement("radio");
    var socks4 = document.createElement("radio");
    http.setAttribute("class", "proxyHttp");
    http.setAttribute("value", "http");
    socks.setAttribute("class", "proxySocks5");
    socks.setAttribute("value", "socks");
    socks4.setAttribute("class", "proxySocks4");
    socks4.setAttribute("value", "socks4");
    http.setAttribute("selected", aProxy && aProxy.type == "http"  );
    socks.setAttribute("selected", aProxy && aProxy.type == "socks" );
    socks4.setAttribute("selected", aProxy && aProxy.type == "socks4");
    if (aProxy) {
      proxyName.setAttribute("value", aProxy.name);
      proxyHost.setAttribute("value", aProxy.host);
      proxyPort.setAttribute("value", aProxy.port);
    }
    proxyType.appendChild(http);
    proxyType.appendChild(socks4);
    proxyType.appendChild(socks);
    proxyRow.appendChild(proxyName);
    proxyRow.appendChild(proxyHost);
    proxyRow.appendChild(proxyPort);
    proxyRow.appendChild(proxyType);
    proxyRow.appendChild(proxySel);
	  this.SVRROWS.appendChild(proxyRow);
	},
	
	setdefaultproxy: function(evt) {
	  if (!evt.target.checked)
	    evt.target.setAttribute("checked", true);
	  else {
	  	var evp = evt.target.parentNode;
	  	var oevp;
	  	for (var i=0; i < this.proxyConfigs.length; i++){
	  	  oevp = E("PROXY_" + i.toString());
	  	  if (oevp != evp) {
	  	    oevp.getElementsByTagName("checkbox")[0].setAttribute("checked", false);
	  	  }else {
	  	  	this._ps.setIntPref("default_proxy", i);
	  	  	E("POPUP_" + i.toString()).setAttribute("checked", true);
	  	  }
	  	}
	  }
	},
	
	popdefaultproxy: function(evt) {
	  	var evp = evt.target.id;
	  	evp = evp.substring(6);
	  	var oevp;
	  	for (var i=0; i < this.proxyConfigs.length; i++){
	  	  oevp = E("PROXY_" + i.toString());
	  	  if (i.toString() != evp) {
	  	    oevp.getElementsByTagName("checkbox")[0].setAttribute("checked", false);
	  	  }else {
	  	  	this._ps.setIntPref("default_proxy", i);
	  	  	oevp.getElementsByTagName("checkbox")[0].setAttribute("checked", true);
	  	  }
	  	}
	},
	
	setMode: function() {
		this._ps.setCharPref("proxyMode", this.modebtn.value);
	},
	
	iconclick: function(evt) {
		if (evt.target != this.icon) return;
		if (evt.button == 0){
			if (this.Prefs.proxyMode == this.mode[0]) {
  	    this._ps.setCharPref("proxyMode", this.mode[1]);
  	    return;
      }else if (this.Prefs.proxyMode == this.mode[1]){
    	  this._ps.setCharPref("proxyMode", this.mode[2]);
    	  return;
      }else if (this.Prefs.proxyMode == this.mode[2]) {
    	  this._ps.setCharPref("proxyMode", this.mode[0]);
    	  return;
    	}
		}else if (evt.button == 2) {
			var QW1 = E("sp-mains");
      var QW2 = E("SP-splitter");
      if (QW1.hidden) {
        QW1.hidden = QW2.hidden = false;
        this.Treevisible = true;
        SmartProxy.FilterView.updateData();
      } else {
        QW1.hidden = QW2.hidden = true;
        this.Treevisible = false;
      }
		}
	},
	
	showMsg: function(Msg){
	  this.MsgBox.value = Msg;
	},
	
	closeslitterbar: function(){
	    var QW1 = E("sp-mains");
      var QW2 = E("SP-splitter");
      QW1.hidden = QW2.hidden = true;
      this.Treevisible = false;
	},
	
	commandreport: function() {
		var crurl= getFocusedWindow().content.document.location;
		crurl = makeURI(crurl);
		if (crurl.scheme != "http" && crurl.scheme != "https" && crurl.scheme != "ftp") return;
    crurl = "https://gfwlist.autoproxy.org/report/?url=" + crurl.spec;
    let protocolService = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
    protocolService.loadURI(makeURI(crurl), null);
  },
  
  setpopupenabled: function(evt) {
    var crurl= getFocusedWindow().content.document.location.href;
    //Application.console.log(crurl);
    var srurl = makeURI(crurl);
    if ((srurl.scheme != "http" && srurl.scheme != "https" && srurl.scheme != "ftp") || this.Prefs.proxyMode == "disabled") {
      this.siteProxyOn.setAttribute("hidden", true);
      this.reportgfwlist.setAttribute("hidden", true);
      return;
    } else {
    	//var docDomain = getHostname(crurl);
    	var topDomain = getDomain(crurl);
    	var matchs = SPdefaultMatcher.matchesAny(crurl, topDomain);
    	if (matchs && matchs instanceof SPWhitelistFilter) {
    		this.siteProxyOn.setAttribute("hidden", true);
    		this.reportgfwlist.setAttribute("hidden", true);
    		return;
    	} else if (matchs && matchs instanceof SPBlockingFilter) {
    		this.siteProxyOn.setAttribute("value", true);
      	this.siteProxyOn.filter = matchs;
      	this.siteProxyOn.setAttribute("label", "禁用" + topDomain + "的代理规则");
    		return;
    	}
    	this.siteProxyOn.setAttribute("hidden", false);
    	this.siteProxyOn.setAttribute("value", "blocked");
    	this.siteProxyOn.newfilter = [crurl, topDomain];
    	this.siteProxyOn.setAttribute("label", "对" + topDomain + "使用代理");
    	this.reportgfwlist.setAttribute("hidden", false);
    }
  },
  
  setUrlproxy: function(evt){
  	if (evt.button != 0) return;
  	if (evt.target.value != "blocked") {
  	   if (evt.target.filter) {
  	     for (let i = 0; i < this.SPfilters.length; i++) {
           if (this.SPfilters[i] == evt.target.filter) {
             this.SPfilters[i].disabled = evt.target.value;
             SmartProxy.FilterView.updateFilter(this.SPfilters[i]);
             if (this.SPfilters[i].disabled && this.SPfilters[i] instanceof SPRegExpFilter && SPdefaultMatcher.hasFilter(this.SPfilters[i])) 
                 SPdefaultMatcher.remove(this.SPfilters[i]);
             break;
           }
         }
  	   }
  	} else {
  		if (evt.target.value == "blocked" && evt.target.newfilter && evt.target.newfilter.length == 2) {
  			 var val = [];
  			 val = evt.target.newfilter;
  			 var ishave = false;
  			 for (let i = 0; i < this.SPfilters.length; i++) {
  			   if (this.SPfilters[i].matches(val[0], val[1])) {
  			   	  if (this.SPfilters[i] instanceof SPWhitelistFilter) {
  			   	  	ishave = true;
  			   	    break;
  			      }else if (this.SPfilters[i].disabled) {
  			         this.SPfilters[i].disabled = false;
  			         SmartProxy.FilterView.updateFilter(this.SPfilters[i]);
  			         if (this.SPfilters[i] instanceof SPRegExpFilter && !SPdefaultMatcher.hasFilter(this.SPfilters[i]))
                   SPdefaultMatcher.add(this.SPfilters[i]);
                 ishave = true;
                 SmartProxy.FilterView.updateData();
  			   	     break;
  			      }
  			   }
  			 }
  			 if (!ishave) {
  			   let filter = SPFilter.fromText(SPFilter.normalize(val[1]));
  			   if (filter && filter instanceof SPRegExpFilter) {
  			     this.SPfilters.push(filter);
  			     var position = SmartProxy.FilterView.data.length;
  			     SmartProxy.FilterView.addFilterAt(position++, filter);
  			     if (!SPdefaultMatcher.hasFilter(filter))
               SPdefaultMatcher.add(filter);
  			   }
  			 }
  		}
  	}
  },
  
  loadGFWurl: function() {
  	window.openNewTabWith("https://autoproxy.org/zh-CN/Subscriptions", null, null, null, false);
  },
	
	_getSmartProxyfile : function(afile) {
		var profileDir = dirService.get("ProfD", Ci.nsIFile);
    var filedir = profileDir.clone().QueryInterface(Ci.nsILocalFile);
    filedir.appendRelativePath("SmartProxy");
    if(!filedir.exists()) {
      filedir.create(Ci.nsIFile.DIRECTORY_TYPE, 0700);
    }
	  filedir.appendRelativePath(afile);
    return filedir;
  },
  
  stringToFile : function(str, file) {
  	var stream = new FileOutputStream(file, 0x02 | 0x08 | 0x10 | 0x20, -1, 0);
    var cos = new ConverterOutputStream(stream, "UTF-8", 16384, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    cos.writeString(str);
    cos.close();
    stream.close();
  },
    
  _exportpatternsfile : function(file) {
		const PR_WRONLY 	 = 0x02;
		const PR_CREATE_FILE = 0x08;
		const PR_TRUNCATE	 = 0x20;
		
		var rjson = { createdBy : 'SmartProxy', createdAt : new Date(), SPfilters : [], DisbledFilter : [] };
		for (var i = 0; i < this.SPfilters.length; i++) {
			rjson.SPfilters.push(this.SPfilters[i].text);
			if (this.SPfilters[i].disabled)
			rjson.DisbledFilter.push(this.SPfilters[i].text);
		}
		var fileStream = new FileOutputStream(file, PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE, 0644, 0);
		var stream = new ConverterOutputStream(fileStream, "UTF-8", 16384, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
		stream.writeString(JSON.stringify(rjson, null, 4));
		stream.close();
	},
  
  _importpatternsfile : function(file) {
		var fileStream = new FileInputStream(file, 0x01, 0444, 0);
		var stream = new ConverterInputStream(fileStream, "UTF-8", 16384, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
		var str = {};
		var rjson = '';
		while (stream.readString(0xffffffff, str) != 0) {
			rjson += str.value;
		}
		stream.close();
		rjson = JSON.parse(rjson);
		this._FilterIsReady = false;
		this.SPfilters = [];
		SPdefaultMatcher.clear();
		for (var i = 0; i < rjson.SPfilters.length; i++) {
			let filter = SPFilter.fromText(SPFilter.normalize(rjson.SPfilters[i]));
      if (filter && filter instanceof SPRegExpFilter && !SPdefaultMatcher.hasFilter(filter)) {
        SPdefaultMatcher.add(filter);
        this.SPfilters.push(filter);
      }
		}
		for (var i = 0; i < rjson.DisbledFilter.length; i++) {
			let filter = SPFilter.fromObject(SPFilter.normalize(rjson.DisbledFilter[i]));
			continue;
		}
		this._FilterIsReady = true;
		this.showMsg("共:" + this.SPfilters.length +"个规则！");
	},
	
	_importSUBpatternsfile : function(file) {
		var fileStream = new FileInputStream(file, 0x01, 0444, 0);
		var stream = new ConverterInputStream(fileStream, "UTF-8", 16384, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    stream = stream.QueryInterface(Ci.nsIUnicharLineInputStream);
    var line = {};
    this._FilterIsReady = false;
    var val = "";
    var cont;
    var newcow = 0;
    do {
      cont = stream.readLine(line);
      val = line.value;
      val = val.trim();
      if (val != "" && val[0] != "[" && val[0] != "!") {
      	let filter = SPFilter.fromText(SPFilter.normalize(val));
      	if (filter && filter instanceof SPRegExpFilter && !SPdefaultMatcher.hasFilter(filter)) {
          SPdefaultMatcher.add(filter);
          this.SPfilters.push(filter);
          if (this.Treevisible) {
            var position = SmartProxy.FilterView.data.length;
  			    SmartProxy.FilterView.addFilterAt(position++, filter);
  			  }
          newcow = newcow + 1;
        }
      }
    } while (cont);
    stream.close();
    this._FilterIsReady = true;
    this.showMsg("共新增了:" + newcow.toString() +"个规则！");
	},
	
	updatesubUrl: function(){
	  var nUrl = window.prompt('设置新的下载地址:',this.Prefs.url);
    if(!nUrl) return;
    nUrl = nUrl.trim();
    var anew = makeURI(nUrl);
    if (anew && (anew.scheme == "http" || anew.scheme == "https")) {
      this._ps.setCharPref("url", nUrl);
      this.Prefs.url = nUrl;
    } else 
    	alert("非法的地址!");
	},
	
	updatesubFilter: function(){
		function errorCallback(result) {
    		SmartProxy.showMsg(result);
    		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
		      SmartProxy.showMsg("订阅规则更新成功!");
    		}
    }
		SmartProxy.showMsg("请等待，正在更新...");
		let url = this.Prefs.url;
		var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
		let me = this;
		request.onerror = function (event) {
    	setTimeout(function () { errorCallback(request.statusText); }, 0);
    	var error = request.statusText;
    	return error;
    };
    request.onload = function (event) {
      try {
        self._rawData = request.responseText;
        if (!self._rawData) {
        	var error = '返回了一个空文件！';
          setTimeout(function () { errorCallback(error); }, 0);
          return;
        }
        self._rawData = self._rawData.replace(/[\r\n]/g, '');
        self._rawData = windowMediator.getMostRecentWindow("").atob(self._rawData);
        SmartProxy.stringToFile(self._rawData, SmartProxy.SPfile);
        setTimeout(function () {
              errorCallback(SUBSCRIPTION_UPDATE_SUCCESS);
        }, 0);
      } catch (e) {
      	setTimeout(function () { errorCallback(e.toString()); }, 0);
      }
    };
    request.open("GET", url);
    request.send(null);
  },
  
  addsubFilter: function() {
      if (this.SPfile.exists()) {
		    this._importSUBpatternsfile(this.SPfile);
		    if (!SmartProxy.Proxy.isRegisted)
		      SmartProxy.Proxy.init();
		  } else {
		  	this.showMsg("没有找到订阅规则文件！");
		  }
  },
  
  saveAllFilter: function() {
    var afile = this._getSmartProxyfile("SPpatterns.json");
		  this._exportpatternsfile(afile);
	    this.showMsg("规则文件保存成功！");
  },
  
  EID: function(id){
    return document.getElementById(id);
  },
  
};

SmartProxy.Proxy = {
  proxyserver: null,
  defaultProxy: null,
  proxyConfigs: [],
  DirectProxy: null,
  isRegisted: false,
  
  init: function() {
  	if (!SmartProxy._FilterIsReady) return;
    SmartProxy.Proxy.proxyserver = [];
    SmartProxy.Proxy.DirectProxy = null;
    SmartProxy.Proxy.defaultProxy = null;
    for each (var aproxy in SmartProxy.proxyConfigs) {
      SmartProxy.Proxy.proxyserver.push(ProxySrv.newProxyInfo(aproxy.type, aproxy.host, aproxy.port, 1, 0, null));
    }
    SmartProxy.Proxy.DirectProxy = ProxySrv.newProxyInfo('direct', '', -1, 0, 0, null);
    SmartProxy.Proxy.defaultProxy = SmartProxy.Proxy.proxyserver[SmartProxy.Prefs.default_proxy];
    if (!SmartProxy.Proxy.defaultProxy) {
      SmartProxy.showMsg("无效的默认代理!");
      return;
    }
    ProxySrv.registerFilter(SmartProxy.Proxy, 0);
    SmartProxy.Proxy.isRegisted = true;
  },
  
  uninit: function() {
    ProxySrv.unregisterFilter(SmartProxy.Proxy);
    SmartProxy.Proxy.isRegisted = false;
  },
  
  setdefaultProxy: function() {
    SmartProxy.Proxy.defaultProxy = SmartProxy.Proxy.proxyserver[SmartProxy.Prefs.default_proxy];
  },
  
  applyFilter: function(ProxySrv, uri, aProxy) {
    if (SmartProxy.Prefs.proxyMode == 'disabled' || uri.schemeIs('feed'))
      return SmartProxy.Proxy.DirectProxy;
    if (SmartProxy.Prefs.proxyMode == 'auto')
      	  SmartProxy.icon.setAttribute("state", "auto");
    var match = SPdefaultMatcher.matchesAny(uri.spec, uri.host);
    if (match) {
      if (SmartProxy.Proxy.CanNotProxy(match)) 
        return SmartProxy.Proxy.DirectProxy;
      else {
      	if (SmartProxy.Prefs.proxyMode == 'auto')
      	  SmartProxy.icon.setAttribute("state", "auto-on");
      	return SmartProxy.Proxy.defaultProxy;
      }
    }else{
    	if (SmartProxy.Prefs.proxyMode == 'auto')
         return SmartProxy.Proxy.DirectProxy;
      else
      	 return SmartProxy.Proxy.defaultProxy;
    }
  },
  
  CanNotProxy: function(amatch) {
  	if (amatch.disabled)
  	   return true;
    else if (amatch instanceof SPWhitelistFilter)
          return true;
    else
      return false;
  },
};

SmartProxy.FilterActions = {
  init: function() {
    let me = this;
    this.treeElement.parentNode.addEventListener("keypress", function(event) {
      me.keyPress(event);
    }, true);
    SmartProxy.FilterView.filters = SmartProxy.SPfilters;
    this.treeElement.view = SmartProxy.FilterView;
    this.treeElement.inputField.addEventListener("keypress", function(event) {
      if (event.keyCode >= event.DOM_VK_PAGE_UP && event.keyCode <= event.DOM_VK_DOWN)
        event.stopPropagation();
    }, false);
  },
  get treeElement() E("SPfiltersTree"),
  get visible() {
    return !this.treeElement.parentNode.collapsed;
  },
  get focused() {
    let focused = document.commandDispatcher.focusedElement;
    while (focused)
    {
      if ("treeBoxObject" in focused && focused.treeBoxObject == SmartProxy.FilterView.boxObject)
        return true;
      focused = focused.parentNode;
    }
    return false;
  },
  setSortOrder: function(sortOrder) {
    let col = (SmartProxy.FilterView.sortColumn ? SmartProxy.FilterView.sortColumn.id : "col-filter");
    SmartProxy.FilterView.sortBy(col, sortOrder);
  },
  selectionToggleDisabled: function() {
    if (this.treeElement.editingColumn)
      return;

    let items = SmartProxy.FilterView.selectedItems.filter(function(i) i.filter instanceof SPActiveFilter);
    if (items.length) {
      SmartProxy.FilterView.boxObject.beginUpdateBatch();
      let newValue = !items[0].filter.disabled;
      for (let i = 0; i < items.length; i++) {
        items[i].filter.disabled = newValue;
        SmartProxy.FilterView.updateFilter(items[i].filter);
        if (newValue) {
        	if (items[i].filter instanceof SPRegExpFilter && SPdefaultMatcher.hasFilter(items[i].filter))
            SPdefaultMatcher.remove(items[i].filter);
        } else {
        	if (items[i].filter instanceof SPRegExpFilter && !SPdefaultMatcher.hasFilter(items[i].filter))
            SPdefaultMatcher.add(items[i].filter);
        }
      }
      SmartProxy.FilterView.boxObject.endUpdateBatch();
    }
  },
  startEditing: function() {
    if (this.treeElement.editingColumn)
      return;
    this.treeElement.startEditing(SmartProxy.FilterView.selection.currentIndex, SmartProxy.FilterView.boxObject.columns.getNamedColumn("col-filter"));
  },
  insertFilter: function()  {
    if (!SmartProxy.FilterView.editable || this.treeElement.editingColumn)
      return;

    SmartProxy.FilterView.insertEditDummy();
    this.startEditing();

    let tree = this.treeElement;
    let listener = function(event) {
      if (event.attrName == "editing" && tree.editingRow < 0) {
        tree.removeEventListener("DOMAttrModified", listener, false);
        SmartProxy.FilterView.removeEditDummy();
      }
    }
    tree.addEventListener("DOMAttrModified", listener, false);
  },
  deleteItems: function(/**Array*/ items) {
    let oldIndex = SmartProxy.FilterView.selection.currentIndex;
    items.sort(function(entry1, entry2) entry2.index - entry1.index);

    for (let i = 0; i < items.length; i++) {
    	if (SmartProxy.FilterView.filters[items[i].index] == items[i].filter) {
    		SmartProxy.FilterView.filters.splice(items[i].index, 1);
    		SmartProxy.FilterView.removeFilterAt(items[i].index);
        if (items[i].filter instanceof SPRegExpFilter && SPdefaultMatcher.hasFilter(items[i].filter))
            SPdefaultMatcher.remove(items[i].filter);
      }
    }
    SmartProxy.FilterView.selectRow(oldIndex);
  },
  deleteSelected: function() {
    if (!SmartProxy.FilterView.editable || this.treeElement.editingColumn)
      return;

    let items = SmartProxy.FilterView.selectedItems; 
    if (items.length == 0 || (items.length >= 2 && !promptService.confirm(window, "确认删除吗？", "SmartProxy")))
      return;
    this.deleteItems(items)
  },
  keyPress: function(/**Event*/ event) {
    if (event.target != E("SPfiltersTree"))
      return;
    let modifiers = 0;
    if (event.charCode == " ".charCodeAt(0) && modifiers == 0 && !E("col-enabled").hidden)
      this.selectionToggleDisabled();
  },
  fillActionsPopup: function() {
    let editable = SmartProxy.FilterView.editable;
    let items = SmartProxy.FilterView.selectedItems.filter(function(i) !i.filter.dummy);
    items.sort(function(entry1, entry2) entry1.index - entry2.index);
    E("SPfilters-edit-command").setAttribute("disabled", !editable || !items.length);
    E("SPfilters-delete-command").setAttribute("disabled", !editable || !items.length);
    E("SPfilters-copy-command").setAttribute("disabled", !items.length);
    E("SPfilters-Unicode-command").setAttribute("disabled", !editable || !items.length);
  },
  copySelected: function(/**Boolean*/ keep) {
    let items = SmartProxy.FilterView.selectedItems;
    if (!items.length)
      return;

    items.sort(function(entry1, entry2) entry1.index - entry2.index);
    let text = items.map(function(i) i.filter.text).join("\n");
    clipboardHelper.copyString(text);

    if (!keep && SmartProxy.FilterView.editable && !this.treeElement.editingColumn)
      this.deleteItems(items);
  },
  ConvertUnicode: function() {
    let items = SmartProxy.FilterView.selectedItems;
    if (!items.length)
      return;

    items.sort(function(entry1, entry2) entry1.index - entry2.index);
    let text = items.map(function(i) i.filter.text).join("\n");
    clipboardHelper.copyString(text);
    alert("已复制到剪切板: \n" + convertpEnc2Char(text));
  },
};

SmartProxy.FilterView = {
  init: function() {
    if (this.sortProcs)
      return;
    function compareText(/**Filter*/ filter1, /**Filter*/ filter2) {
      if (filter1.text < filter2.text)
        return -1;
      else if (filter1.text > filter2.text)
        return 1;
      else
        return 0;
    }
    function compareSlow(/**Filter*/ filter1, /**Filter*/ filter2) {
      let isSlow1 = filter1 instanceof SPRegExpFilter && SPdefaultMatcher.isSlowFilter(filter1);
      let isSlow2 = filter2 instanceof SPRegExpFilter && SPdefaultMatcher.isSlowFilter(filter2);
      return isSlow1 - isSlow2;
    }
    function compareEnabled(/**Filter*/ filter1, /**Filter*/ filter2) {
      let hasEnabled1 = (filter1 instanceof SPActiveFilter ? 1 : 0);
      let hasEnabled2 = (filter2 instanceof SPActiveFilter ? 1 : 0);
      if (hasEnabled1 != hasEnabled2)
        return hasEnabled1 - hasEnabled2;
      else if (hasEnabled1)
        return (filter2.disabled - filter1.disabled);
      else
        return 0;
    }
    function createSortFunction(cmpFunc, fallbackFunc, desc) {
      let factor = (desc ? -1 : 1);

      return function(entry1, entry2) {
        let isLast1 = ("origFilter" in entry1 && entry1.filter == null);
        let isLast2 = ("origFilter" in entry2 && entry2.filter == null);
        if (isLast1)
          return (isLast2 ? 0 : 1)
        else if (isLast2)
          return -1;

        let ret = cmpFunc(entry1.filter, entry2.filter);
        if (ret == 0 && fallbackFunc)
          return fallbackFunc(entry1.filter, entry2.filter);
        else
          return factor * ret;
      }
    }
    this.sortProcs = {
      filter: createSortFunction(compareText, null, false),
      filterDesc: createSortFunction(compareText, null, true),
      slow: createSortFunction(compareSlow, compareText, true),
      slowDesc: createSortFunction(compareSlow, compareText, false),
      enabled: createSortFunction(compareEnabled, compareText, false),
      enabledDesc: createSortFunction(compareEnabled, compareText, true)
    };
  },
  boxObject: null,
  atoms: null,
  noFiltersDummy: null,
  editDummy: null,
  data: [],
  get treeElement() this.boxObject ? this.boxObject.treeBody.parentNode : null,
  get isEmpty() {
    return !this.filters.length;
  },
  get editable() {
    return true;
  },
  get currentItem() {
    let index = this.selection.currentIndex;
    if (index >= 0 && index < this.data.length)
      return this.data[index];
    return null;
  },
  get selectedItems() {
    let items = []
    for (let i = 0; i < this.selection.getRangeCount(); i++)
    {
      let min = {};
      let max = {};
      this.selection.getRangeAt(i, min, max);
      for (let j = min.value; j <= max.value; j++)
        if (j >= 0 && j < this.data.length)
          items.push(this.data[j]);
    }
    return items;
  },
  getItemAt: function(x, y) {
    let row = this.boxObject.getRowAt(x, y);
    if (row >= 0 && row < this.data.length)
      return this.data[row];
    else
      return null;
  },
  _filters: 0,
  get filters() this._filters,
  set filters(value) {
    if (value == this._filters)
      return;
    if (this.treeElement)
      this.treeElement.stopEditing(true);
    this._filters = value;
    this.refresh(true);
  },
  _dirty: false,
  refresh: function(force) {
    if (SmartProxy.Treevisible) {
      if (!force && !this._dirty)
        return;
      this._dirty = false;
      this.updateData();
      this.selectRow(0);
    }
    else
      this._dirty = true;
  },
  sortProcs: null,
  sortColumn: null,
  sortProc: null,
  sortBy: function(col, direction) {
    let newSortColumn = null;
    if (col) {
      newSortColumn = this.boxObject.columns.getNamedColumn(col).element;
      if (!direction) {
        if (this.sortColumn == newSortColumn)
          direction = (newSortColumn.getAttribute("sortDirection") == "ascending" ? "descending" : "ascending");
        else
          direction = "ascending";
      }
    }
    if (this.sortColumn && this.sortColumn != newSortColumn)
      this.sortColumn.removeAttribute("sortDirection");
    this.sortColumn = newSortColumn;
    if (this.sortColumn) {
      this.sortColumn.setAttribute("sortDirection", direction);
      this.sortProc = this.sortProcs[col.replace(/^col-/, "") + (direction == "descending" ? "Desc" : "")];
    } else
      this.sortProc = null;
    if (this.data.length > 1) {
      this.updateData();
      this.boxObject.invalidate();
    }
  },
  addDummyRow: function() {
    if (this.boxObject && this.data.length == 0)
    {
      //if (this._subscription)
        this.data.splice(0, 0, this.noFiltersDummy);
      this.boxObject.rowCountChanged(0, 1);
    }
  },
  removeDummyRow: function() {
    if (this.boxObject && this.isEmpty && this.data.length)
    {
      this.data.splice(0, 1);
      this.boxObject.rowCountChanged(0, -1);
    }
  },
  insertEditDummy: function() {
    SmartProxy.FilterView.removeDummyRow();
    let position = this.selection.currentIndex;
    if (position >= this.data.length)
      position = this.data.length - 1;
    if (position < 0)
      position = 0;

    this.editDummy.index = (position < this.data.length ? this.data[position].index : this.data.length);
    this.editDummy.position = position;
    this.data.splice(position, 0, this.editDummy);
    this.boxObject.rowCountChanged(position, 1);
    this.selectRow(position);
  },
  removeEditDummy: function() {
    let position = this.editDummy.position;
    if (typeof position != "undefined" && position < this.data.length && this.data[position] == this.editDummy)
    {
      this.data.splice(position, 1);
      this.boxObject.rowCountChanged(position, -1);
      SmartProxy.FilterView.addDummyRow();

      this.selectRow(position);
    }
  },
  selectRow: function(row) {
    if (this.selection)
    {
      row = Math.min(Math.max(row, 0), this.data.length - 1);
      this.selection.select(row);
      this.boxObject.ensureRowIsVisible(row);
    }
  },
  selectFilter: function(/**Filter*/ filter) {
    let index = -1;
    for (let i = 0; i < this.data.length; i++)
    {
      if (this.data[i].filter == filter)
      {
        index = i;
        break;
      }
    }
    if (index >= 0)
    {
      this.selectRow(index);
      this.treeElement.focus();
    }
  },
  updateData: function() {
    let oldCount = this.rowCount;
    if (this.filters && this.filters.length) {
      this.data = this.filters.map(function(f, i) ({index: i, filter: f}));
      if (this.sortProc) {
        let followingFilter = null;
        for (let i = this.data.length - 1; i >= 0; i--) {
            followingFilter = this.data[i].filter;
        }
        this.data.sort(this.sortProc);
        for (let i = 0; i < this.data.length; i++) {
          if ("origFilter" in this.data[i]) {
            this.data[i].filter = this.data[i].origFilter;
            delete this.data[i].origFilter;
          }
        }
      }
    }
    else
      this.data = [];

    if (this.boxObject) {
      this.boxObject.rowCountChanged(0, -oldCount);
      this.boxObject.rowCountChanged(0, this.rowCount);
    }
    this.addDummyRow();
  },
  updateFilter: function(/**Filter*/ filter) {
    for (let i = 0; i < this.data.length; i++)
      if (this.data[i].filter == filter) {
      	if (SmartProxy.Treevisible)
         this.boxObject.invalidateRow(i);
      }
  },
  addFilterAt: function(/**Integer*/ position, /**Filter*/ filter) {
    if (this.data.length == 1 && this.data[0].filter.dummy) {
      this.data.splice(0, 1);
      this.boxObject.rowCountChanged(0, -1);
    }
    if (this.sortProc) {
      this.updateData();
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].index == position) {
          position = i;
          break;
        }
      }
    } else {
      for (let i = 0; i < this.data.length; i++)
        if (this.data[i].index >= position)
          this.data[i].index++;
      this.data.splice(position, 0, {index: position, filter: filter});
    }
    if (SmartProxy.Treevisible)
      this.boxObject.rowCountChanged(position, 1);
    this.selectRow(position);
  },
  removeFilterAt: function(/**Integer*/ position) {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].index == position) {
        this.data.splice(i, 1);
        this.boxObject.rowCountChanged(i, -1);
        i--;
      }
      else if (this.data[i].index > position)
        this.data[i].index--;
    }
    this.addDummyRow();
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsITreeView]),

  setTree: function(boxObject) {
    this.init();
    this.boxObject = boxObject;
    if (this.boxObject) {
      this.noFiltersDummy = {index: 0, filter: {text: this.boxObject.treeBody.getAttribute("noFiltersText"), dummy: true}};
      this.editDummy = {filter: {text: ""}};
      let atomService = Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);
      let stringAtoms = ["col-filter", "col-enabled", "type-filterlist", "type-whitelist"];
      let boolAtoms = ["selected", "dummy", "slow", "disabled"];
      this.atoms = {};
      for each (let atom in stringAtoms)
        this.atoms[atom] = atomService.getAtom(atom);
      for each (let atom in boolAtoms) {
        this.atoms[atom + "-true"] = atomService.getAtom(atom + "-true");
        this.atoms[atom + "-false"] = atomService.getAtom(atom + "-false");
      }
      let columns = this.boxObject.columns;
      for (let i = 0; i < columns.length; i++)
        if (columns[i].element.hasAttribute("sortDirection"))
          this.sortBy(columns[i].id, columns[i].element.getAttribute("sortDirection"));
      this.refresh(true);
    }
  },
  selection: null,
  get rowCount() this.data.length,
  getCellText: function(row, col) {
    if (row < 0 || row >= this.data.length)
      return null;
    col = col.id;
    if (col != "col-filter" && col != "col-slow")
      return null;
    let filter = this.data[row].filter;
    if (col == "col-filter")
      return filter.text;
    else if (col == "col-slow")
      return (filter instanceof SPRegExpFilter && SPdefaultMatcher.isSlowFilter(filter) ? "!" : null);
    return null;
  },
  generateProperties: function(list, properties) {
    if (properties)
    {
      // Gecko 21 and below: we have an nsISupportsArray parameter, add atoms
      // to that.
      for (let i = 0; i < list.length; i++)
        if (list[i] in this.atoms)
          properties.AppendElement(this.atoms[list[i]]);
      return null;
    }
    else
    {
      // Gecko 22+: no parameter, just return a string
      return list.join(" ");
    }
  },
  getColumnProperties: function(col, properties) {
    return this.generateProperties(["col-" + col.id], properties);
  },
  getRowProperties: function(row, properties) {
    if (row < 0 || row >= this.data.length)
      return "";

    let list = [];
    let filter = this.data[row].filter;
    list.push("selected-" + this.selection.isSelected(row));
    list.push("slow-" + (filter instanceof SPRegExpFilter && SPdefaultMatcher.isSlowFilter(filter)));
    if (filter instanceof SPActiveFilter)
      list.push("disabled-" + filter.disabled);
    list.push("dummy-" + ("dummy" in filter));

    if (filter instanceof SPBlockingFilter)
      list.push("type-filterlist");
    else if (filter instanceof SPWhitelistFilter)
      list.push("type-whitelist");
    return this.generateProperties(list, properties);
  },
  getCellProperties: function(row, col, properties) {
    return this.getRowProperties(row, properties) + " " + this.getColumnProperties(col, properties);
  },
  cycleHeader: function(col) {
    let oldDirection = col.element.getAttribute("sortDirection");
    if (oldDirection == "ascending")
      this.sortBy(col.id, "descending");
    else if (oldDirection == "descending")
      this.sortBy(null, null);
    else
      this.sortBy(col.id, "ascending");
  },
  isSorted: function() {
    return (this.sortProc != null);
  },
  isEditable: function(row, col) {
    if (row < 0 || row >= this.data.length)
      return false;

    let filter = this.data[row].filter;
    if (col.id == "col-filter")
      return !("dummy" in filter);
    else
      return false;
  },
  setCellText: function(row, col, value)  {
    if (row < 0 || row >= this.data.length || col.id != "col-filter")
      return;
    let oldFilter = this.data[row].filter;
    let position = this.data[row].index;
    value = SPFilter.normalize(value);
    if (!value || value == oldFilter.text)
      return;
    this.treeElement.stopEditing();
    let newFilter = SPFilter.fromText(value);
    if (this.data[row] == this.editDummy)
      this.removeEditDummy();
    else {
      if (this.filters[position] == oldFilter) {
        this.filters.splice(position, 1);
        if (oldFilter instanceof SPRegExpFilter && SPdefaultMatcher.hasFilter(oldFilter))
        SPdefaultMatcher.remove(oldFilter);
      }
    }
    this.filters.splice(position, 0, newFilter);
    if (newFilter instanceof SPRegExpFilter && !SPdefaultMatcher.hasFilter(newFilter))
    SPdefaultMatcher.add(newFilter);
  },
  cycleCell: function(row, col) {
    if (row < 0 || row >= this.data.length || col.id != "col-enabled")
      return;

    let filter = this.data[row].filter;
    if (filter instanceof SPActiveFilter)
      filter.disabled = !filter.disabled;
  },
  isContainer: function(row) false,
  isContainerOpen: function(row) false,
  isContainerEmpty: function(row) true,
  getLevel: function(row) 0,
  getParentIndex: function(row) -1,
  hasNextSibling: function(row, afterRow) false,
  toggleOpenState: function(row) {},
  getProgressMode: function() null,
  getImageSrc: function() null,
  isSeparator: function() false,
  performAction: function() {},
  performActionOnRow: function() {},
  performActionOnCell: function() {},
  getCellValue: function() null,
  setCellValue: function() {},
  selectionChanged: function() {},
};

SmartProxy.FilterSearch = {
  init: function() {
    let findbar = E("findbar");
    findbar.browser = SmartProxy.FilterSearch.fakeBrowser;
    findbar.addEventListener("keypress", function(event){
      if (event.keyCode == KeyEvent.DOM_VK_RETURN)
        event.preventDefault();
    }, false);
    findbar.toggleHighlight = function() {};
  },
  search: function(text, direction, caseSensitive) {
    function normalizeString(string) caseSensitive ? string : string.toLowerCase();
    function findText(text, direction, startIndex) {
      let list = E("SPfiltersTree");
      let col = list.columns.getNamedColumn("col-filter");
      let count = list.view.rowCount;
      for (let i = startIndex + direction; i >= 0 && i < count; i += (direction || 1)) {
        let filter = normalizeString(list.view.getCellText(i, col));
        if (filter.indexOf(text) >= 0) {
          SmartProxy.FilterView.selectRow(i);
          return true;
        }
      }
      return false;
    }

    text = normalizeString(text);
    if (findText(text, direction, E("SPfiltersTree").currentIndex))
      return Ci.nsITypeAheadFind.FIND_FOUND;
    return Ci.nsITypeAheadFind.FIND_NOTFOUND;
  }
};

SmartProxy.FilterSearch.fakeBrowser = {
  fastFind: {
    searchString: null,
    foundLink: null,
    foundEditable: null,
    caseSensitive: false,
    get currentWindow() SmartProxy.FilterSearch.fakeBrowser.contentWindow,
    find: function(searchString, linksOnly) {
      this.searchString = searchString;
      return SmartProxy.FilterSearch.search(this.searchString, 0, this.caseSensitive);
    },

    findAgain: function(findBackwards, linksOnly) {
      return SmartProxy.FilterSearch.search(this.searchString, findBackwards ? -1 : 1, this.caseSensitive);
    },

    init: function() {},
    setDocShell: function() {},
    setSelectionModeAndRepaint: function() {},
    collapseSelection: function() {}
  },
  currentURI: makeURI("http://example.com/"),
  contentWindow: {
    focus: function() {
      E("SPfiltersTree").focus();
    },
    scrollByLines: function(num) {
      E("SPfiltersTree").boxObject.scrollByLines(num);
    },
    scrollByPages: function(num) {
      E("SPfiltersTree").boxObject.scrollByPages(num);
    },
  },

  addEventListener: function(event, handler, capture) {
    E("SPfiltersTree").addEventListener(event, handler, capture);
  },
  removeEventListener: function(event, handler, capture) {
    E("SPfiltersTree").addEventListener(event, handler, capture);
  },
};

function SPFilter(text) {
  this.text = text;
}
SPFilter.prototype = {
  text: null,
  serialize: function(buffer) {
    buffer.push("[Filter]");
    buffer.push("text=" + this.text);
  },
  toString: function() {
    return this.text;
  }
};
SPFilter.knownFilters = {__proto__: null};
SPFilter.regexpRegExp = /^(@@)?\/.*\/(?:\$~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)?$/;
SPFilter.optionsRegExp = /\$(~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)$/;
SPFilter.fromText = function(text) {
  if (text in SPFilter.knownFilters)
    return SPFilter.knownFilters[text];
  let ret;
  if (text[0] == "!")
    ret = null;
  else
    ret = SPRegExpFilter.fromText(text);
  SPFilter.knownFilters[ret.text] = ret;
  return ret;
}
SPFilter.fromObject = function(text) {
  let ret = SPFilter.fromText(text);
  if (ret instanceof SPActiveFilter)
  {
      ret._disabled = true;
  }
  return ret;
}
SPFilter.normalize = function(text) {
  if (!text)
    return text;
  text = text.replace(/[^\S ]/g, "");
  if (/^\s*!/.test(text)) {
    return text.replace(/^\s+/, "").replace(/\s+$/, "");
  }  else
    return text.replace(/\s/g, "");
}

function SPActiveFilter(text, domains)
{
  SPFilter.call(this, text);

  this.domainSource = domains;
}
SPActiveFilter.prototype = {
  __proto__: SPFilter.prototype,
  _disabled: false,
  get disabled() this._disabled,
  set disabled(value) {
    if (value != this._disabled)
    {
      let oldValue = this._disabled;
      this._disabled = value;
    }
    return this._disabled;
  },

  domainSource: null,
  domainSeparator: null,
  ignoreTrailingDot: true,

  get domains() {
    let domains = null;
    if (this.domainSource) {
      let list = this.domainSource.split(this.domainSeparator);
      if (list.length == 1 && list[0][0] != "~") {
        domains = {__proto__: null, "": false};
        if (this.ignoreTrailingDot)
          list[0] = list[0].replace(/\.+$/, "");
        domains[list[0]] = true;
      } else {
        let hasIncludes = false;
        for (let i = 0; i < list.length; i++) {
          let domain = list[i];
          if (this.ignoreTrailingDot)
            domain = domain.replace(/\.+$/, "");
          if (domain == "")
            continue;

          let include;
          if (domain[0] == "~") {
            include = false;
            domain = domain.substr(1);
          } else {
            include = true;
            hasIncludes = true;
          }
          if (!domains)
            domains = {__proto__: null};
          domains[domain] = include;
        }
        domains[""] = !hasIncludes;
      }
      delete this.domainSource;
    }

    this.__defineGetter__("domains", function() domains);
    return this.domains;
  },

  isActiveOnDomain: function(/**String*/ docDomain) /**Boolean*/ {
    if (!this.domains)
      return true;
    if (!docDomain)
      return this.domains[""];
    if (this.ignoreTrailingDot)
      docDomain = docDomain.replace(/\.+$/, "");
    docDomain = docDomain.toUpperCase();
    while (true) {
      if (docDomain in this.domains)
        return this.domains[docDomain];

      let nextDot = docDomain.indexOf(".");
      if (nextDot < 0)
        break;
      docDomain = docDomain.substr(nextDot + 1);
    }
    return this.domains[""];
  },

  isActiveOnlyOnDomain: function(/**String*/ docDomain) /**Boolean*/ {
    if (!docDomain || !this.domains || this.domains[""])
      return false;

    if (this.ignoreTrailingDot)
      docDomain = docDomain.replace(/\.+$/, "");
    docDomain = docDomain.toUpperCase();

    for (let domain in this.domains)
      if (this.domains[domain] && domain != docDomain && (domain.length <= docDomain.length || domain.indexOf("." + docDomain) != domain.length - docDomain.length - 1))
        return false;

    return true;
  },

  serialize: function(buffer) {
    if (this._disabled) {
      SPFilter.prototype.serialize.call(this, buffer);
      if (this._disabled)
        buffer.push("disabled=true");
    }
  }
};

function SPRegExpFilter(text, regexpSource, domains) {
  SPActiveFilter.call(this, text, domains);
  if (regexpSource.length >= 2 && regexpSource[0] == "/" && regexpSource[regexpSource.length - 1] == "/") {
    let regexp = new RegExp(regexpSource.substr(1, regexpSource.length - 2), "i");
    this.__defineGetter__("regexp", function() regexp);
  } else {
    this.regexpSource = regexpSource;
  }
}
SPRegExpFilter.prototype = {
  __proto__: SPActiveFilter.prototype,
  length: 1,
  domainSeparator: "|",
  regexpSource: null,
  get regexp() {
    let source = this.regexpSource.replace(/\*+/g, "*");
    if (source[0] == "*")
      source = source.substr(1);
    let pos = source.length - 1;
    if (pos >= 0 && source[pos] == "*")
      source = source.substr(0, pos);

    source = source.replace(/\^\|$/, "^")       
                   .replace(/\W/g, "\\$&")    
                   .replace(/\\\*/g, ".*")    
                   .replace(/\\\^/g, "(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x80]|$)")
                   .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^.\\/]+\\.)*?") 
                   .replace(/^\\\|/, "^")       
                   .replace(/\\\|$/, "$");     
    let regexp = new RegExp(source, "i");
    delete this.regexpSource;
    this.__defineGetter__("regexp", function() regexp);
    return this.regexp;
  },
  matches: function(location, docDomain) {
    if (this.regexp.test(location) &&  this.isActiveOnDomain(docDomain)) {
      return true;
    }
    return false;
  }
};
SPRegExpFilter.prototype.__defineGetter__("0", function() {
  return this;
});
SPRegExpFilter.fromText = function(text) {
  let blocking = true;
  let origText = text;
  if (text.indexOf("@@") == 0) {
    blocking = false;
    text = text.substr(2);
  }
  let domains = null;
  try {
    if (blocking)
      return new SPBlockingFilter(origText, text, domains);
    else
      return new SPWhitelistFilter(origText, text, domains);
  } catch (e) {
    return null;
  }
}

function SPBlockingFilter(text, regexpSource, domains) {
  SPRegExpFilter.call(this, text, regexpSource, domains);
}
SPBlockingFilter.prototype = {
  __proto__: SPRegExpFilter.prototype,
};

function SPWhitelistFilter(text, regexpSource, domains) {
  SPRegExpFilter.call(this, text, regexpSource, domains);
}
SPWhitelistFilter.prototype = {
  __proto__: SPRegExpFilter.prototype,
}

function SPMatcher() {
  this.clear();
}
SPMatcher.prototype = {
  filterByKeyword: null,
  keywordByFilter: null,
  clear: function() {
    this.filterByKeyword = {__proto__: null};
    this.keywordByFilter = {__proto__: null};
  },
  add: function(filter) {
    if (filter.text in this.keywordByFilter)
      return;
    let keyword = this.findKeyword(filter);
    let oldEntry = this.filterByKeyword[keyword];
    if (typeof oldEntry == "undefined")
      this.filterByKeyword[keyword] = filter;
    else if (oldEntry.length == 1)
      this.filterByKeyword[keyword] = [oldEntry, filter];
    else
      oldEntry.push(filter);
    this.keywordByFilter[filter.text] = keyword;
  },
  remove: function(filter) {
    if (!(filter.text in this.keywordByFilter))
      return;
    let keyword = this.keywordByFilter[filter.text];
    let list = this.filterByKeyword[keyword];
    if (list.length <= 1)
      delete this.filterByKeyword[keyword];
    else {
      let index = list.indexOf(filter);
      if (index >= 0)
      {
        list.splice(index, 1);
        if (list.length == 1)
          this.filterByKeyword[keyword] = list[0];
      }
    }
    delete this.keywordByFilter[filter.text];
  },
  findKeyword: function(filter) {
    let result = "";
    let text = filter.text;
    if (SPFilter.regexpRegExp.test(text))
      return result;

    let match = SPFilter.optionsRegExp.exec(text);
    if (match)
      text = match.input.substr(0, match.index);
    if (text.substr(0, 2) == "@@")
      text = text.substr(2);

    let candidates = text.toLowerCase().match(/[^a-z0-9%*][a-z0-9%]{3,}(?=[^a-z0-9%*])/g);
    if (!candidates)
      return result;

    let hash = this.filterByKeyword;
    let resultCount = 0xFFFFFF;
    let resultLength = 0;
    for (let i = 0, l = candidates.length; i < l; i++) {
      let candidate = candidates[i].substr(1);
      let count = (candidate in hash ? hash[candidate].length : 0);
      if (count < resultCount || (count == resultCount && candidate.length > resultLength))
      {
        result = candidate;
        resultCount = count;
        resultLength = candidate.length;
      }
    }
    return result;
  },
  hasFilter: function(/**RegExpFilter*/ filter) /**Boolean*/ {
    return (filter.text in this.keywordByFilter);
  },
  getKeywordForFilter: function(/**RegExpFilter*/ filter) /**String*/ {
    if (filter.text in this.keywordByFilter)
      return this.keywordByFilter[filter.text];
    else
      return null;
  },
  _checkEntryMatch: function(keyword, location, docDomain) {
    let list = this.filterByKeyword[keyword];
    for (let i = 0; i < list.length; i++)
    {
      let filter = list[i];
      if (filter.matches(location, docDomain))
        return filter;
    }
    return null;
  },
  matchesAny: function(location, docDomain) {
    let candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
    if (candidates === null)
      candidates = [];
    candidates.push("");
    for (let i = 0, l = candidates.length; i < l; i++) {
      let substr = candidates[i];
      if (substr in this.filterByKeyword) {
        let result = this._checkEntryMatch(substr, location, docDomain);
        if (result)
          return result;
      }
    }
    return null;
  }
};

function SPCombinedMatcher() {
  this.blacklist = new SPMatcher();
  this.whitelist = new SPMatcher();
  this.keys = {__proto__: null};
  this.resultCache = {__proto__: null};
}
SPCombinedMatcher.maxCacheEntries = 1000;
SPCombinedMatcher.prototype = {
  blacklist: null,
  whitelist: null,
  keys: null,
  resultCache: null,
  cacheEntries: 0,
  clear: function()
  {
    this.blacklist.clear();
    this.whitelist.clear();
    this.keys = {__proto__: null};
    this.resultCache = {__proto__: null};
    this.cacheEntries = 0;
  },
  add: function(filter) {
    if (filter instanceof SPWhitelistFilter)
      this.whitelist.add(filter);
    else
      this.blacklist.add(filter);
    if (this.cacheEntries > 0)  {
      this.resultCache = {__proto__: null};
      this.cacheEntries = 0;
    }
  },
  remove: function(filter) {
    if (filter instanceof SPWhitelistFilter) 
        this.whitelist.remove(filter);
    else
      this.blacklist.remove(filter);
    if (this.cacheEntries > 0) {
      this.resultCache = {__proto__: null};
      this.cacheEntries = 0;
    }
  },
  findKeyword: function(filter) {
    if (filter instanceof SPWhitelistFilter)
      return this.whitelist.findKeyword(filter);
    else
      return this.blacklist.findKeyword(filter);
  },
  hasFilter: function(filter) {
    if (filter instanceof SPWhitelistFilter)
      return this.whitelist.hasFilter(filter);
    else
      return this.blacklist.hasFilter(filter);
  },
  getKeywordForFilter: function(filter) {
    if (filter instanceof SPWhitelistFilter)
      return this.whitelist.getKeywordForFilter(filter);
    else
      return this.blacklist.getKeywordForFilter(filter);
  },
  isSlowFilter: function(/**RegExpFilter*/ filter) /**Boolean*/ {
    let matcher = (filter instanceof SPWhitelistFilter ? this.whitelist : this.blacklist);
    if (matcher.hasFilter(filter))
      return !matcher.getKeywordForFilter(filter);
    else
      return !matcher.findKeyword(filter);
  },
  matchesAnyInternal: function(location, docDomain) {
    let candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
    if (candidates === null)
      candidates = [];
    candidates.push("");
    let blacklistHit = null;
    for (let i = 0, l = candidates.length; i < l; i++) {
      let substr = candidates[i];
      if (substr in this.whitelist.filterByKeyword) {
        let result = this.whitelist._checkEntryMatch(substr, location, docDomain);
        if (result)
          return result;
      }
      if (substr in this.blacklist.filterByKeyword && blacklistHit === null)
        blacklistHit = this.blacklist._checkEntryMatch(substr, location, docDomain);
    }
    return blacklistHit;
  },
  matchesAny: function(location, docDomain) {
    let key = location + " " + docDomain;
    if (key in this.resultCache)
      return this.resultCache[key];
    let result = this.matchesAnyInternal(location, docDomain);
    if (this.cacheEntries >= SPCombinedMatcher.maxCacheEntries) {
      this.resultCache = {__proto__: null};
      this.cacheEntries = 0;
    }
    this.resultCache[key] = result;
    this.cacheEntries++;
    return result;
  },
  matchesByKey: function(/**String*/ location, /**String*/ key, /**String*/ docDomain) {
    key = key.toUpperCase();
    if (key in this.keys)
    {
      let filter = SPFilter.knownFilters[this.keys[key]];
      if (filter && filter.matches(location, "DOCUMENT", docDomain, false))
        return filter;
      else
        return null;
    }
    else
      return null;
  }
}
let SPdefaultMatcher = new SPCombinedMatcher();

SmartProxy.init();
window.SmartProxy = SmartProxy;
function addStyle(css) {
	var pi = document.createProcessingInstruction(
		'xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
	);
	return document.insertBefore(pi, document.documentElement);
}
function getFocusedWindow(){
    var focusedWindow = document.commandDispatcher.focusedWindow;
    if (!focusedWindow || focusedWindow == window)
        return window.content;
    else
        return focusedWindow;
}
function getDomain(uri) {
      var host = getHostname(uri);
      try {
        var baseDomain = _eTLDService.getBaseDomainFromHost(host, 0);
        return _idnService.convertToDisplayIDN(baseDomain, {});
      } catch (e) {
        if (e.name == "NS_ERROR_HOST_IS_IP_ADDRESS") {
          return host;
        } else if (e.name == "NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS") {
          return host;
        } else {
          throw e;
        }
      }
}
function getHostname(url)  {
    try {
      return unwrapURL(url).host;
    } catch(e) {
      return null;
    }
}
function unwrapURL(url) {
    if (!(url instanceof Ci.nsIURI))
      url = makeURI(url);

    if (url instanceof Ci.nsINestedURI)
      return url.innermostURI;
    else
      return url;
}
function makeURI(url) {
    try
    {
      return ioService.newURI(url, null, null);
    }
    catch (e) {
      return null;
    }
}
function E(id) {
  return document.getElementById(id);
}
function convertpEnc2Char(str) { 
	str = str.replace(/((%[A-Fa-f0-9]{2})+)/g, 
					function(matchstr, parens) {
						return convertpEsc2Char(parens); 
           }); 
	return str;
}
function convertpEsc2Char( str ) {
  var outputString = "";
	var counter = 0;
	var n = 0;
	var listArray = str.split('%');
	for ( var i = 1; i < listArray.length; i++ ) {
		var b = parseInt(listArray[i], 16);  
		switch (counter) {
		case 0:
			if (0 <= b && b <= 0x7F) {  
				outputString += dec2char(b); } 
			else if (0xC0 <= b && b <= 0xDF) {  
				counter = 1;
				n = b & 0x1F; }
			else if (0xE0 <= b && b <= 0xEF) {  
				counter = 2;
				n = b & 0xF; }
			else if (0xF0 <= b && b <= 0xF7) {  
				counter = 3;
				n = b & 0x7; }
			else {
				outputString += 'convertpEsc2Char: error!';
			}
			break;
		case 1:
			if (b < 0x80 || b > 0xBF) {
				outputString += 'convertpEsc2Char: error!';
			}
			counter--;
			outputString += dec2char((n << 6) | (b-0x80));
			n = 0;
			break;
		case 2: case 3:
			if (b < 0x80 || b > 0xBF) {
				outputString += 'convertpEsc2Char: error!';
			}
			n = (n << 6) | (b-0x80);
			counter--;
			break;
		}
	}
	return outputString;
}
function dec2char(n) {
	var result = '';
    if (n <= 0xFFFF) { 
    	result += String.fromCharCode(n);
    } else if (n <= 0x10FFFF) {
		  n -= 0x10000
		  result += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    } else { 
    	result += 'dec2char error!'; 
    }
	  return result;
}
})('\
#SmartProxy-button[state="disabled"] {\
   list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADGklEQVQ4jW3TW0zbZRjH8fd20QtNjN5MuyC1KZQeYQKlG23X9k/XlkL372ESBj3xB0riLoyJyZwauNALMdrOZDiN2cZwQOYS0Zk5cBlKUhilTEUQjwFZjERvdsBEvl40GTHhTX6X7+fi9zyPYJc3feMaS0uLLC/f4oflbx9kdXWJn39aYXXlO4oLs6z99gtiNyAot1Cm0VBhNKEzW6gwmdEaTGgNBrQGI5oqPapyNXNzX+8ORDtimOuthGJh4ukErVEZj99Ho9tNg9PJgUMuKqurKRbyuwPyc2EeeUqFL9RCulehIxUn1tGGx++j1uFAazSzV13OreIc4t79e6yv/crt2+tsbKxx5+4dfK1BHt6rQr+/FqfXiyfgxy5JHG4N4pAk9jfaUeurKC7MIq5/eRWPrwnJd5hAKEggFKQ93k5KSZBWkiTScY5EjnDy1ZewOp3YXC6q6hsoq9CWgMLNGaobbJisNqSAn0PeJuocDizWAxifrcNUW4/OUkNPXxduvw+718tRlwutQV8qsVDI84xOR53dgZLppuf5PjpTcVqiMk5JwmI7iLqyio7kMXLZQTY2/4BPP2Zm6gqLi/OIYiGPulKHRm/A2xJEbosRjMgE5BBuvw+r00mlpYZUJsXR1DHkZBuTM9cfFC4WFmYp11bwRNnTaI1mHJKE1Bwolef3UedwojHXkOhNMv/Ccb4/3kf2xIv8uLFeAoqFPI/uUyH2PMSexx7nyXI1FttBLLZGTFYbGoMJvaUGYjJ43CB5wOPmTJ9SAr6aniSXe4vh8x/w+ZXLjF8a4Z3cINnsm0x8dpmbNyahLcK/XQm2h3Jsv/s2vN7Pn3Y7m/D/Rfrowof097+MonSiKJ0MDJxk9ItP4I0B/gqH2Lo6wdbEJe6ezvG7KH0VAFv/3Oe9oVOke9J0ZxSUTBfdGYWejEKyV2Hq7Bm+EYK8EMwKwbQQ/P3aiR0gmx3E39yEHGkmHA0SiZUSjgaRIwH87TKrYyOs7FMxLwSbA6/sTIHtbU4PneLiyDnGx4YZH7uwk9FhRi+e59zZ97k2PbXb2fAf/WWXltr24jwAAAAASUVORK5CYII=);\
}\
#SmartProxy-button[state="auto"] {\
   list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADA0lEQVQ4jX3SXUxTBwDF8ZvsyexpZtmelhFXxH6MApdSu1JxLVnLtS23lkKJGFpKy4V1ZotLliXOxUySPQ0TPkx02bKoFfnIoo4oIZihqECF25YWqksWMKC4ly0jm24P/PdAolnS7STn9fdwcgQK5NbNSXLpRZZSOfLqEvn0MvczyzzI5fk5/xMPlvKkkvdYe7iCUAg42OLD2Kih+mM9+47rsR7VY47qMAW1mPx6RHkPexy7SM7cLQy0Ks04z5XRtlzLkUduQlkHDdPVyFf2cuBMFe6BKizHtMzfuVcYaFb8CJdKaPhlP58gE9+UaHtSizNnpnLGSNGEDuG0hoVbaYSnz56yvrbKxsY6jx+v8cfmn8gtHoQTReiu6ambN+NNW7HfEfGsVVOTraQ0WcpLQyWoUyrC1I8TON11uNwH8PplvH6Z1lArkcMx2g4phINRfFKQTyPdlN2voCpbwc5ZA0Ji9zagzt+lstpGudWGy+uhVqrDYrcjWvdRZrZQvvcdDKIJJRJHumnGMV5J7KqR0p5i5qZmEVR1jt0GA5Z37SjxTro+/IBwtA1fMIDD5UK01VCsf5tQeyu9X/ayvvorW4Nj3L46QSazgJBW5yjWGygpNSL5ZAItzchNAbwBP+953FgdDvSiiY54lFgsTKT9MNMzU88HF1KpJBqtjtd3vYW2rAK7y4Wr3otDknB63FjsDnSiiY73o0SVdpSuDj46eoQnG4+2gbQ6xytFbyLseJkdr77GG5piRFsNom0/5VYbWmMFmhItoVgI2SdxsMGN5HYSCh/aBm5P36C//xSJC98yfv0yo98P0tvfQ1/fV4xdu0zmxnVWvviMY90nyGZT5BZVFjMLJGen2fz9t38f6dLF7zh58jiKEkZRwnR3f87waKLQ115sAPDX38/4+uwAsa4YnXEFJd5BZ1yhK67QrkT44crI/wN9fT146usINNXTGJRpat5uY1Am0OTFI0s8XF35D2BrizNnBxgaPM/oSILRkYsvOpxgeOgC5899w+TEWEHgHyipu09Ruh2CAAAAAElFTkSuQmCC);\
}\
#SmartProxy-button[state="auto-on"] {\
   list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADAUlEQVQ4jX3SW0yTBwDF8e99yaJL9rAHdUCwtrR+bREdnZdS6JUPKGW9YCHc8QMajcGHGQnLWHXZwwKL1YexLVlEnFASQ9SQGNRlxYGtpS0g47JNGZdpYmbUKNuD/z2waJZ0O8l5/T2cHIE0ifwwyuxsirm5KRbmZl51cXGWX3+ZZ3H+LslElOWlewjpAKfHRaZCgUqrQ63PRaXToxR1KEURpahFodGQkb2dWOxWesBfexC94X0qKj3UNzfg8rmxlkgYLRb2Fhayv8iMJm83ycnb6QG338OmrduQKsppbpOpbaqnsrYKa4nEeyYTSq2erdnbSSZjCC/WX7C8tMTqb6us3F/h2ePnSKVO3nh7G+rcfEw2BxaplAKrjWKXE5PNxm5jAYqdIolEFOHm9WuUVtmpaLNR3VGM/4SE3FXJ4Y9rCByvo+3DGqrbnAQ/PUG+qYh9ZjMaw16yVDkkE1GE6NgE5vZdWMJa3KkDlEcNWK/oKeoTMXVrMAbVGDp30H6qCYtdosDh4KDZTI6o2xjxTiSKvjMbw6SO4+vldDyvoHXNjvcnI9bxPPJHNGSFFbR85iPU3cPao4dw9RK3boyQSsUR4mMx1MeyeOdmDq6VA9T8UYR3zUj58n4sC3vQx7UItzUcOVNFU309DY3VRMa/fzW4EB+/g8r/Lm99nknmqArT3V3Yf86ncCYP6/wecqMiwriaI2eqaGxoQm49xNH2wzz4ffUfYCLGloI3EfybEU5lIAwryZoRUUyLZKR2IvyoRoioaTnto6y4GNcHEg7JSm2dfwMYi1zndM8X9PWe4/LFqwx8PURPMETPJyGGz48QD99g4WgXHV1dTE8nmJmaZCoVJzoR4emTx/8+0sUL3xIMdiLLdchyHSdPfsTgUH+6r73eAODPv9b5qvcsza3NtARk5MAhWgIyrQGZRrmBy8Ph/wdCoW5Kyuy4vWV4fE68lRv1+Jy4vaWUOB0s3b/3H8DLl3zZe5aB7/oYCvczFL7wuoP9DA6cp+/cN4xeu5IW+BunrL9kzjmPpAAAAABJRU5ErkJggg==);\
}\
#SmartProxy-button[state="global"] {\
   list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADA0lEQVQ4jX3STUzTdwDG8V+yu8m87WBUUIG2UIRCBYkgMLtCgfLaIhClvPhvbTQEzWJEtiCa7LCAsbJEtiUGRIFy4cVoCExmqy2FFkoLHUQjCKg7zGUawR347sAys6TbkzzXz+HJIwiTRz+PEZydY34mSMg3T2h2gV/8CywGQzwLLbE4H2LGM8XqynNEOKCoshBl2T7Szsk50izncKMcdZ2MJGMMScVyEvXRRGdF4HE9CQ+ckMrRdMVjWsjmzLqOk4EsShxp6AcPkXszGV1HMilNMUw/ngoPlEvFiN4oSn7N4Ev0WN/mYHqdjSaoRuVSsmdUhvhuH95Hs4iNzQ1WV1ZYf7HO2vIa737bIN+Yh7i0G/mQjJxJNTrvYTKdieStppEeUBHnieOTvih8Ez7Ew/FR8iu1FJ/+gqqmXCou6jB/Xc7p8yYsljoki4njVSVcMl9FGTpIciCBnW4FoufANuBxuvm8UcUxezyl/nQKPaloRhLI7laS2RZLRquC1OZoGi6Y0Y6ryXqgon5ISVzbfiYn3Ihph4eE5v2k+g5yYbOQpvfFWF5qMYQy0LiSSLkfS6Q9CvM3Rq5dtrG2/IatuyM4h0bx+70Ir3MKxblIPnsop2gtnRNvsjG8zKBw9QjHltQkeOMRk7GcvVFJnclETW0VDtfEP4MLr2saWcUedn4bQcSYjMx5FdqnKWQFk9Asqkn0KBEuBWdvVFJbU4dkOUVD4xlev1r/G3BPsevoDkTFp4irexGDMUQGlUQFlOz1xyGeKBAOBebrRgpycykq0ZGj03CyumIbcDrGud5+je7OLoZ779H3wwDtrTbaL9sYvH0fr/0nlhpaaGppIRCYITjnY87vxeN28PaP3/99pN47t2htbUaSqpGkaq5c+Yr+gZ5wX/u4AcCHPzf5vrODeks9ZquEZD2F2SphsUrUSjUMD9r/H7DZ2sgr0FJqKKDMqMdQvt0yo55SQz55+hxWlp//B7C1xc3ODvrudjNg72HAfudj+3vo77tNd9ePjI2OhAX+Amntz3+RACcAAAAAAElFTkSuQmCC);\
}\
textbox.proxyName{ width: 110px; } .proxyHost{ width: 120px; } .proxyPort{ width: 45px; } radiogroup > .proxyHttp{ margin-left: 10px; } radiogroup > .proxySocks4, radiogroup > .proxySocks5{ margin-left: 21px;} .selBox{ margin-left: 10px; }\
#sp-contents {list-style-image: none; font-size: 14px; padding: 0; margin: 0; }\
.actionbtn { list-style-image: none; color: #484; font-size: 14px; margin: 0 10px 0 10px; }\
.actionbtn:hover { list-style-image: none; color: #555; text-decoration: underline; cursor: pointer; }\
#closesliderbar { list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABj0lEQVQ4jaXRsUsCYRjHcf8YNcQg1CGUAk1RvJOLaIlAJKPBQVzMIVu8amlNCQQbDqIhwqGlocWzwUMknByEONH5kIIav03dS4mg9MBveH4872d5HZ/mG6NqjY6yu1BG1Rqf5hs/4zCvqryrFbjTFsq7WsG8qgqgLe+A1mBSLvGSTfOSTTMpl0BrzO3b8o4AWtI21Gu003t22S+XGBcLjIsF+uWS3bfTe1Cv0ZK2BfCcUODygnHuiH6xIJBiYWYf547g8oLnhCKAp7gMJ8dwcswos89rPsffec3nGGX27bunuCyAx5iEtbZmx3C50eWkfaDLSQyX+9fNY0wSQDOSmPt4HtKMJARwH45j+fwY7hX0lJD1lDSzG+4VLJ+f+3BcALebMabBEA9OlzhWUnS9q3S9q+hKyu4fnC6mwRC3mzEBaKEtPqJRev4ATY+HpsdDzx/gIxqd22uhLQHcrEf4kqWlcrMeEYBxfoZ5eACV04ViHh5gnJ8JwBoO6Kgq14GNhdJRVazhQAAzf7bk/Bv4Bv7RCf77/Pb2AAAAAElFTkSuQmCC) !important;}\
tree { margin: 0px; } #col-slow { text-align: center; } #col-enabled { min-width: 48px; } #col-slow { min-width: 30px; }\
treechildren:-moz-locale-dir(rtl)::-moz-tree-cell(col-filter, type-whitelist),\
treechildren:-moz-locale-dir(rtl)::-moz-tree-cell(col-filter, type-filterlist) { direction: ltr; text-align: end; }\
treechildren::-moz-tree-cell-text(col-filter, type-whitelist, selected-false) { color: #008000; }\
treechildren::-moz-tree-cell-text(col-filter, dummy-true) { font-style: italic; }\
treechildren::-moz-tree-cell-text(col-filter, type-whitelist, selected-false),\
treechildren::-moz-tree-cell-text(col-slow) { font-size: 12px; }\
treechildren::-moz-tree-cell-text(col-filter, disabled-true, selected-false) { color: #808080; }\
treechildren::-moz-tree-image(col-enabled, disabled-true) { list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAaCAYAAABsONZfAAABD0lEQVQ4je2TMa5FQBSGrUIURiURhVJH3BXYgg1IprYGHa1FCGtheslf0UgkFMZ51ZUn3rvkJvdVr/iLKb4z55z5Ronj+ME5p7uJ4/ihcM5pmiYQ0a9ZlgVEhGmawDknhXNOr4BxHBFFEYQQIKJraBgG+L4PxhjSNIWU8git6woiwrZteJ7DMISqqsiybC90gNq2RV3XO1gUBRhjSJJkL3SCgiCAYRioqgp938OyLLiui3meDy0foKZp4DgOGGPwPA+6rqMsy9Ocp0U0TQPbtqFpGhhj+5wvISKCEAKmaSLPc0gp70FSSggh0HXdj8+wQ1dGPLMb8ZZ7HxP21N6VsLe29w+9C33/bJ+56U+E/QKpA0b/pEOBQAAAAABJRU5ErkJggg==); -moz-image-region: rect(13px 13px 26px 0px); }\
treechildren::-moz-tree-image(col-enabled, disabled-false) { list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAaCAYAAABsONZfAAABD0lEQVQ4je2TMa5FQBSGrUIURiURhVJH3BXYgg1IprYGHa1FCGtheslf0UgkFMZ51ZUn3rvkJvdVr/iLKb4z55z5Ronj+ME5p7uJ4/ihcM5pmiYQ0a9ZlgVEhGmawDknhXNOr4BxHBFFEYQQIKJraBgG+L4PxhjSNIWU8git6woiwrZteJ7DMISqqsiybC90gNq2RV3XO1gUBRhjSJJkL3SCgiCAYRioqgp938OyLLiui3meDy0foKZp4DgOGGPwPA+6rqMsy9Ocp0U0TQPbtqFpGhhj+5wvISKCEAKmaSLPc0gp70FSSggh0HXdj8+wQ1dGPLMb8ZZ7HxP21N6VsLe29w+9C33/bJ+56U+E/QKpA0b/pEOBQAAAAABJRU5ErkJggg==); -moz-image-region: rect(0px 13px 13px 0px); }\
treechildren::-moz-tree-image(col-slow, slow-true) { list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAQCAYAAAAI0W+oAAACIklEQVQ4jZWUXWsTQRSG35sQFe/ygSwmNQlVDBqKSsS2QtGLRNIWaqUMfiDRNH6UBlSKVPBrbUrUK4ObRPSmf8BLCSIEvMsvmCsv/CWvF5PdnWxmiz1w2Jkze95nzp6ZBcJtEQBD/FVITmW0rhsBfA6DfHFF60vg0zXljdUx2K+QXAJ4FNjscdOLXwFwS4B722Zv1T3Yb0P+T62qqqFCAMAdAHx9NxziervhweyAxuwoHgfwB8AnY9n1JV+sWQMXZsDlOfDq+UnYu3sezPT57NFzI7j4GPBFXtxWIkcOgRsrYCqp5vOFcVg8Hg822wZAIQTz+by7kWkd9FIHAeDcGXNvLpzyY7lcjgC+aZVwMBhQSkkppQt6q4O2XNCzNdCKmXvTeaLE3HmhUPBOYiqV4nA49CAa6IOxIlesseoLbl4HPz5U4xPHwHMnwRsL6j3bttnv98cAUkr2ej0XNK+D1vWdPr/p90RcUeNWXa3lp9Q8nU7TcZwJQK1Wo2VZLmQveBj+AuDpKR+2cx9cvAQuz4Lbt1Ts2kUF6XQ6EwApJR3HcQHvg4AfsViMlmVRSslSqcRIJMKZaXWfdtfB1gNw5TJ49LCCdLtdI0TryfcgxDspyWSSzWbTlEQAzGQyrFaroQApJYvFYti9GrNdAIxGoxRC7CsY9Ha7rZ++A9mmEIKVSsWrKJFIMJvNTvzJ3Vi5XD4wZD87C2AH6gK+GY1z/5P4D/B9/dnqz8gaAAAAAElFTkSuQmCC); }\
'.replace(/[\r\n\t]/g, ''));
//.findbar-highlight { display: none; }\