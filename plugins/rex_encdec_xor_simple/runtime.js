// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SimpleEncDecXOR = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_SimpleEncDecXOR.prototype;

	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function () {};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};

	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function () {};

	function xor(str, pwd) {
		var res = "";
		var i, strCnt = str.length,
			pwdCnt = pwd.length;
		var encChar, strChar, pwdChar;
		for (i = 0; i < strCnt; i++) {
			strChar = str.charCodeAt(i);
			pwdChar = pwd.charCodeAt(i % pwdCnt);
			encChar = parseInt(strChar ^ pwdChar);
			res += String.fromCharCode(encChar);
		}
		return res;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Encrypt = function (ret, str, pwd) {
		str = encodeURIComponent(str);
		pwd = encodeURIComponent(pwd);
		var res = xor(str, pwd);
		if (res == null)
			res = "";
		ret.set_string(res);
	};
	Exps.prototype.Decrypt = function (ret, dat, pwd) {
		pwd = encodeURIComponent(pwd);
		var res = xor(dat, pwd);
		if (res == null)
			res = "";
		ret.set_string(decodeURIComponent(res));
	};
}());