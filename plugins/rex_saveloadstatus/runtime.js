// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SaveLoadStatus = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var pluginProto = cr.plugins_.Rex_SaveLoadStatus.prototype;
        
    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    
    var typeProto = pluginProto.Type.prototype;

    typeProto.onCreate = function()
    {
    };

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    
    var instanceProto = pluginProto.Instance.prototype;

    instanceProto.onCreate = function()
    {
    };

    instanceProto._get_status = function(uid)
    {
        var inst = this.runtime.getObjectByUID(uid);
        if (inst == null)
            return "";
        
        var status = this.runtime.saveInstanceToJSON(inst);
        status["sid"] = inst.type.sid;
        return JSON.stringify(status);   
    };
    
    instanceProto._set_status = function(inst, status)
    {
        var uid_save = inst.uid;
        this.runtime.loadInstanceFromJSON(inst, status);  
        inst.uid = uid_save;
        
        if (inst.afterLoad)
            inst.afterLoad();
                
        if (inst.behavior_insts)
        {
            var k, lenk=inst.behavior_insts.length, binst;
            for (k = 0; k < lenk; k++)
            {
                binst = inst.behavior_insts[k];
                        
                if (binst.afterLoad)
                    binst.afterLoad();
            }
        }
    };	
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();    

    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();
    
    Acts.prototype.SetStatus = function (obj_type, status)
    {     
        if (!obj_type)
            return; 
        status =  JSON.parse(status); 
        if (obj_type.sid != status["sid"])
            return;
        var insts = obj_type.getCurrentSol().getObjects();
        var i, cnt=insts.length;
        for (i=0; i<cnt; i++)
            this._set_status(insts[i], status);        
    };     
    
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.Status = function (ret, uid)
    {
        ret.set_string( this._get_status(uid) );
    };
    
}());