// ==UserScript==
// @name           tiebaMultiple.uc.js
// @author         林小鹿吧
// @namespace      http://tieba.baidu.com/f?ie=utf-8&kw=firefox
// @include        main
// @license        MIT License
// @charset        UTF-8
// @version        2014/05/27
// @description    贴吧马甲切换
//				   2014/05/27 1.修改马甲过多列表太长不能滚动的问题2.新添加马甲篡改到之前马甲的问题
// ==/UserScript==
var tiebaUtil = {
	getUserName : function () {
		var a = __window.PageData;
		a && a.user && a.user.is_login && a.user.name ? a = a.user.name : (a = __window.s_session) && (a = a.username);
		return a;
	}
}, util = {
	runInUrl : function (a, c) {
		gBrowser.addEventListener("DOMContentLoaded", function (b) {
			b = b.originalTarget.baseURI;
			if (a instanceof Array) {
				for (var e in a) {
					if (a[e].test(b)) {
						c();
						break;
					}
				}
			} else {
				a instanceof String ? a == b && c() : a instanceof RegExp && a.test(b) && c();
			}
		}, !1);
	}
}, tiebaMultiple = {
	getBdussCookie : function () {
		for (var a = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).enumerator, c = null; a.hasMoreElements(); ) {
			var b = a.getNext();
			if (!b) {
				break;
			}
			b = b.QueryInterface(Ci.nsICookie2);
			if (!(0 > b.host.indexOf("baidu.com")) && "BDUSS" == b.name) {
				c = {
					name : b.name,
					value : b.value,
					expires : b.expires,
					path : b.path,
					host : b.host,
					isHttpOnly : b.isHttpOnly,
					isSecure : b.isSecure,
					isSession : b.isSession
				};
				break;
			}
		}
		return c;
	},
	getUsers : function () {
		var a = localStorage.getItem("_tieba_users");
		return a = "null" == a || null == a || "" == a || void 0 == a ? {}

		 : JSON.parse(a);
	},
	setUsers : function (a) {
		localStorage.setItem("_tieba_users", JSON.stringify(a));
	},
	deleteUserItem : function (a, c) {
		delete a[c];
		tiebaMultiple.setUsers(a);
	},
	resetCurrentUser : function (a, c) {
		var b = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2);
		a ? b.add(a.host, a.path, a.name, a.value, a.isSecure, a.isHttpOnly, a.isSession, a.expires || Math.round((new Date).getTime() / 1E3 + 9999999999)) : b.add(".baidu.com", "/", "BDUSS", "", !1, !0, !1, Math.round((new Date).getTime() / 1E3 + 9999999999));
		"function" == typeof c ? c() : "string" == typeof c ? __window.location.replace(c) : __window.location.reload();
	},
	clickHandle : function (a) {
		__window = gBrowser.contentWindow.wrappedJSObject;
		__document = gBrowser.contentDocument;
		localStorage = gBrowser.contentWindow.localStorage;
		var c = tiebaMultiple.getUsers();
		a.preventDefault();
		a = a.target;
		var b;
		if('A' == a.tagName){
			b = null;
			if(/^\/i\//.test(__window.location.pathname)){
				b = "/";
			}
			if(a.nextSibling){
				tiebaMultiple.resetCurrentUser(c[a.innerText || a.textContent], b); 
			}else{
				if("未登录" == a.innerHTML){
					tiebaMultiple.resetCurrentUser();
				}else{
					if("添加马甲" == a.innerHTML){
						var flag = __window.confirm('网页添加[YES]手动输入[NO]')
						if(flag){
							__window.TbCom.process("User", "buildLoginFrame");
						}else{
							var name = __window.prompt('输入用户名');
							var BDUSS = __window.prompt('输入cookie：');
							if(name.length > 0&& BDUSS.length > 0){
								var cookie = {
									name : "BDUSS",
									value : BDUSS,
									expires : Math.round((new Date).getTime() / 1E3 + 9999999999),
									path : "/",
									host : ".baidu.com",
									isHttpOnly : !1,
									isSecure : !0,
									isSession : !1
								};
								c[name] = cookie;
								tiebaMultiple.setUsers(c);
								__window.location.reload();
							}
						}
					}else if('导入导出' == a.innerHTML){
						var flag = __window.confirm('导入[YES]导出[NO]');
						if(flag){
							var value = __window.prompt('输入数据：');
							if(value.length > 0){
								try{
									var cc = JSON.parse(value);
									tiebaMultiple.setUsers(cc);
								}catch(e){
									alert('数据错误');
								}
							}
						}else{
							__window.prompt('所有数据：',JSON.stringify(c));
						}
					} else if('测试用户名' == a.innerHTML){
						var value = __window.prompt('用户名：');
						if(value.length > 0){
							gBrowser.addTab('http://tieba.baidu.com/home/main?un='+value+'&fr=frs&ie=utf-8');
						}
					}
				}
			}
		}else if("SPAN" == a.tagName){
			b = a.previousSibling; 
			delete c[b.innerText || b.textContent];
			tiebaMultiple.deleteUserItem(c, b.innerText || b.textContent);
			(b = b.parentNode).parentNode.removeChild(b);
		}
	},
	addCss : function () {
		var a = __document.createTextNode(".u_ddl_con{width:180px!important;}\
		#ge_users{width:175px!important}\
		.multiple {height:750px;overflow:scroll;}\
		#ge_users>li{position:relative;cursor:pointer;width:165px!important;padding:0 5 0 0px}\
		#ge_users span{background:#77f;color:white;border-radius:0px;border:1px solid;border:none;margin:2px;width:20%;cursor:pointer;text-align:center;padding:1 0 1 0px;}\
		#ge_users:hover {display:block!important;}"),
		c = __document.createElement("style");
		c.type = "text/css";
		c.appendChild(a);
		__document.documentElement.appendChild(c);
	},
	n : function (a) {
		"com_userbar" == a.target.parentNode.id && tiebaMultiple.a(a.target);
	},
	a : function (a) {
		__document.removeEventListener("DOMNodeInserted", tiebaMultiple.n, !0);
		if (!(0 < a.parentNode.innerHTML.indexOf("ge_users"))) {
			tiebaMultiple.addCss();
			
			var d = __document.createElement("li");
			a.insertBefore(d, a.firstChild);
			d.className = "split";
			c = __document.createElement("li");
			c.setAttribute("style", "margin-top: 7px;");
			a.insertBefore(c, d);
			c.innerHTML = "<a href=# >马甲</a>";//\u9a6c\u7532
			c.onmouseover = function () {
				d.style.display = "block";
			};
			c.onmouseout = function () {
				d.style.display = "none";
			};
			d = __document.createElement("div");
			c.appendChild(d);
			d.className = "u_ddl";
			d.setAttribute("style", "display:none;width:165px;top:22px;");
			a = __document.createElement("div");
			d.appendChild(a);
			a.className = "u_ddl_con u_ddl_con_top multiple";
			c = __document.createElement("ul");
			a.appendChild(c);
			c.id = "ge_users";
			c.onclick = tiebaMultiple.clickHandle;
			a = __document.createElement("li");
			a.innerHTML = "<a href=#>未登录</a>";//\u672a\u767b\u5f55
			c.appendChild(a);
			setTimeout(function(){
				var cc = tiebaMultiple.getBdussCookie(),
				b = tiebaUtil.getUserName(),
				e = tiebaMultiple.getUsers();
				null != b && "" != b && (e[b] = cc);
				tiebaMultiple.setUsers(e);
				for (var f in e) {
					f ? (a = __document.createElement("li"), a.innerHTML = "<a href=# style='padding:0px!important'>" + f + '</a><span style="position:absolute;right:0;top:0;">删除</span>', c.appendChild(a)) : delete e[f];
				}
				a = __document.createElement("li");
				a.innerHTML = "<a href=#>添加马甲</a>";//添加马甲\u6dfb\u52a0\u9a6c\u7532
				c.appendChild(a);
				a = __document.createElement("li");
				a.innerHTML = "<a href=#>导入导出</a>";//\u5bfc\u5165\u5bfc\u51fa
				c.appendChild(a);
				a = __document.createElement("li");
				a.innerHTML = "<a href=#>测试用户名</a>";
				c.appendChild(a);
			},500);
			setTimeout(function(){
				var div = __document.createElement("div");
				div.setAttribute("style", "position:fixed;display: block;bottom:0px;right:0px;color:red;font-size:20px;z-index:999999");//background:#cccccc;
				var span = __document.createElement("span");
				span.innerHTML = __document.querySelector('#user_info .profile_right > a').innerHTML.trim();
				div.appendChild(span);
				__document.body.appendChild(div);
			},1000);
		}
	}
}, __window, __document, localStorage;
function main(a) {
	__window = gBrowser.contentWindow.wrappedJSObject;
	__document = gBrowser.contentDocument;
	localStorage = gBrowser.contentWindow.localStorage;
	__document.addEventListener("DOMNodeInserted", tiebaMultiple.n, !0);
}
var urls = Array(RegExp(/^http:\/\/tieba.baidu.com/));
util.runInUrl(urls, main);


