// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Nickname = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var pluginProto = cr.plugins_.Rex_Nickname.prototype;

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

	instanceProto.onCreate = function () {
		this.nickname2objtype = {}; // {sid:_sid, index:types_by_index[_index
		this.sid2nickname = {}; // {sid:nickname}
		this.exp_LastCreatedInstUID = -1;
		window.RexC2NicknameObj = this;
	};

	// export	
	instanceProto.AddNickname = function (nickname, objtype) {
		this.nickname2objtype[nickname] = {
			sid: objtype.sid,
			index: -1
		};
		this.sid2nickname[objtype.sid.toString()] = nickname;
	};

	instanceProto.Nickname2Type = function (nickname) {
		var sidInfo = this.nickname2objtype[nickname];
		if (sidInfo == null)
			return null;

		var sid = sidInfo.sid;
		var objtypes = this.runtime.types_by_index;
		var t = objtypes[sidInfo.index];
		if ((t != null) && (t.sid === sid))
			return t;

		var i, len = objtypes.length;
		for (i = 0; i < len; i++) {
			t = objtypes[i];
			if (t.sid === sid) {
				sidInfo.index = i;
				return t;
			}
		}

		return null;
	};

	// export
	instanceProto.CreateInst = function (nickname, x, y, layer, callback, ignore_picking) {
		var objtype = (typeof (nickname) == "string") ? this.Nickname2Type(nickname) :
			nickname;
		if (objtype == null)
			return null;

		var inst = window.RexC2CreateObject.call(this, objtype, layer, x, y, callback, ignore_picking);
		return inst;
	};

	var has_objtype = function (objfamily, objb) {
		if ((!objfamily) || (!objb))
			return false;
		else if (objfamily.is_family) // family contain this objtype
			return (objfamily.members.indexOf(objb) != -1);
		else // objtype is equal
			return (objfamily === objb);
	};

	var clean_sol = function (objtype) {
		var sol = objtype.getCurrentSol();
		sol.select_all = false;
		sol.instances.length = 0; // clear contents    
	};

	var extend_sol = function (objtype, insts) {
		var sol = objtype.getCurrentSol();
		var sol_insts = sol.instances;
		sol_insts.push.apply(sol_insts, insts);
		sol.select_all = false;
	};

	var has_any_picked_inst = function (objtype) {
		return (objtype.getCurrentSol().instances.length > 0);
	};

	// export
	instanceProto.PickAll = function (nickname, family_objtype) {
		var objtype = this.Nickname2Type(nickname);
		if (!has_objtype(family_objtype, objtype)) {
			clean_sol(family_objtype);
		} else if (family_objtype.is_family) {
			var sol = objtype.getCurrentSol();
			var sol_save = sol.select_all;
			sol.select_all = true;
			// set sol of family_objtype
			clean_sol(family_objtype);
			extend_sol(family_objtype, sol.getObjects());
			// recover sol
			sol.select_all = sol_save;
		} else {
			var sol = family_objtype.getCurrentSol();
			sol.select_all = true;
		}
		return has_any_picked_inst(family_objtype);
	};


	instanceProto.PickMatched = function (_substring, family_objtype) {
		if (family_objtype.is_family) {
			clean_sol(family_objtype);
			var nickname;
			var objtype, sol, sol_save;
			for (nickname in this.nickname2objtype) {
				if (nickname.match(_substring) == null)
					continue;

				objtype = this.Nickname2Type(nickname);
				if (!has_objtype(family_objtype, objtype))
					continue;

				sol = objtype.getCurrentSol();
				sol_save = sol.select_all;
				sol.select_all = true;
				extend_sol(family_objtype, sol.getObjects());
				sol.select_all = sol_save;
			}
		} else {
			var nickname = this.sid2nickname[family_objtype.sid];
			if ((nickname != null) && (nickname.match(_substring) != null)) {
				var sol = family_objtype.getCurrentSol();
				sol.select_all = true;
			} else {
				clean_sol(family_objtype);
			}
		}
		return has_any_picked_inst(family_objtype);
	};

	instanceProto.saveToJSON = function () {
		return {
			"sid2name": this.sid2nickname,
		};
	};

	instanceProto.loadFromJSON = function (o) {
		var sid2name = o["sid2name"];
		this.sid2nickname = sid2name;
		var sid, name, objtype;
		for (sid in sid2name) {
			name = sid2name[sid];
			this.nickname2objtype[name] = {
				sid: parseInt(sid, 10),
				index: -1
			};
		}
	};

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections) {
		var porp = [];
		var nickname;
		for (nickname in this.nickname2objtype) {
			porp.push({
				"name": this.Nickname2Type(nickname).name,
				"value": nickname,
				"readonly": true
			});
		}


		propsections.push({
			"title": this.type.name,
			"properties": porp
		});
	};

	instanceProto.onDebugValueEdited = function (header, name, value) {};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.IsNicknameValid = function (nickname) {
		return (this.nickname2objtype[nickname] != null);
	};

	Cnds.prototype.Pick = function (nickname, family_objtype) {
		return this.PickAll(nickname, family_objtype);
	};

	Cnds.prototype.PickMatched = function (_substring, family_objtype) {
		return this.PickMatched(_substring, family_objtype);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.AssignNickname = function (nickname, objtype) {
		if (objtype == null)
			return;
		this.AddNickname(nickname, objtype);
	};

	Acts.prototype.CreateInst = function (nickname, x, y, _layer, family_objtype) {
		var inst = this.CreateInst(nickname, x, y, _layer, null, true);
		4

		this.exp_LastCreatedInstUID = (inst) ? inst.uid : (-1);

		if (!family_objtype)
			return;

		// SOL
		if ((inst == null) ||
			(!has_objtype(family_objtype, inst.type))) {
			clean_sol(family_objtype);
		} else {
			// sol push
			family_objtype.getCurrentSol().pick_one(inst);
			family_objtype.applySolToContainer();
		}
	};

	Acts.prototype.Pick = function (nickname, family_objtype) {
		this.PickAll(nickname, family_objtype);
	};

	Acts.prototype.PickMatched = function (_substring, family_objtype) {
		this.PickMatched(_substring, family_objtype);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastCreatedInstUID = function (ret) {
		ret.set_int(this.exp_LastCreatedInstUID);
	};


}());

(function () {
	// general CreateObject function which call a callback before "OnCreated" triggered
	if (window.RexC2CreateObject != null)
		return;

	// copy from system action: CreateObject
	var CreateObject = function (obj, layer, x, y, callback, ignore_picking) {
		if (!layer || !obj)
			return;

		var inst = this.runtime.createInstance(obj, layer, x, y);

		if (!inst)
			return;

		this.runtime.isInOnDestroy++;

		// call callback before "OnCreated" triggered
		if (callback)
			callback(inst);
		// call callback before "OnCreated" triggered

		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);

		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}

		this.runtime.isInOnDestroy--;

		if (ignore_picking !== true) {
			// Pick just this instance
			var sol = obj.getCurrentSol();
			sol.select_all = false;
			sol.instances.length = 1;
			sol.instances[0] = inst;

			// Siblings aren't in instance lists yet, pick them manually
			if (inst.is_contained) {
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					sol.instances.length = 1;
					sol.instances[0] = s;
				}
			}
		}

		// add solModifiers
		//var current_event = this.runtime.getCurrentEventStack().current_event;
		//current_event.addSolModifier(obj);
		// add solModifiers

		return inst;
	};

	window.RexC2CreateObject = CreateObject;
}());