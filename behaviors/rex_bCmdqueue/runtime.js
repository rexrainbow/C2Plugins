// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_bCmdqueue = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_bCmdqueue.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	var FNTYPE_UK = 0;          // unknow 
	var FNTYPE_NA = 1;	        // not avaiable
	var FNTYPE_REXFNEX = 2;     // rex_functionext
    var FNTYPE_REXFN2 = 3;      // rex_function2
	var FNTYPE_OFFICIALFN = 4;  // official function
	behtypeProto.onCreate = function()
	{
        this._fnobj = null;
        this._fnobj_type = FNTYPE_UK;
	    this._act_call_fn = null;
	    this._act_set_param = null; // for rex_function2
		this._exp_call = null;	    
	};
	
	behtypeProto._setup_cmdhandler = function ()
	{
        var plugins = this.runtime.types;			
        var name, inst;
		//// try to get cmdhandler from function extension
		//if (cr.plugins_.Rex_FnExt != null)
		//{
        //    for (name in plugins)
        //    {
        //        inst = plugins[name].instances[0];
        //        if (inst instanceof cr.plugins_.Rex_FnExt.prototype.Instance)
        //        {
        //            this._fnobj = inst;
        //            this._act_call_fn = cr.plugins_.Rex_FnExt.prototype.acts.CallFunction;
		//	        this._exp_call = cr.plugins_.Rex_FnExt.prototype.exps.Call;
		//		    this._fnobj_type = FNTYPE_REXFNEX;
        //            return;
        //        }                                          
        //    }
		//}
        
               
		// try to get cmdhandler from rex_function2
		if (cr.plugins_.Rex_Function2 != null)
		{
            
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
                {
                    this._fnobj = inst;
                    this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunctionwPT;  // with parameter table
			        this._act_set_param = cr.plugins_.Rex_Function2.prototype.acts.SetParameter;
			        this._exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;
				    this._fnobj_type = FNTYPE_REXFN2;
                    return;
                }                                          
            }
		}        
        
        // try to get cmdhandler from official function
		if (cr.plugins_.Function != null)    
		{	
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Function.prototype.Instance)
                {
                    this._fnobj = inst;
                    this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                    this._exp_call = cr.plugins_.Function.prototype.exps.Call;			
				    this._fnobj_type = FNTYPE_OFFICIALFN;
                    return;
                }                                          
            }
		}
		        
        this._fnobj_type = FNTYPE_NA;  // function object is not avaiable
	};   
    
    var param_list = [];  // for official function object
	behtypeProto.call_function = function(uid, cmd)
	{	  
	    if (this._fnobj_type == FNTYPE_NA)
	        return;
	        
	    if (this._fnobj_type == FNTYPE_UK)
	        this._setup_cmdhandler();	    
	    
	    var name = cmd[0];
	    var param = cmd[1];  // hash table
	    
	    if (this._fnobj_type == FNTYPE_OFFICIALFN)
	    {
	        // transfer hash table to array
	        param_list.length = 0;

            if (param.hasOwnProperty(0))
                param_list.push(param[0]);
            else
                param_list.push(uid);
            
            var i=1;	        
	        while (param.hasOwnProperty(i))
	        {
	            param_list.push(param[i]);
	            i++;
	        }
	        this._act_call_fn.call(this._fnobj, name, param_list);
	    }
	    else if (this._fnobj_type == FNTYPE_REXFN2) 	    
	    {
	        var table_name = "_bcmdqueue";
	        this._act_set_param.call(this._fnobj, "uid", uid, table_name);
	        var k;
	        for (k in param)
	            this._act_set_param.call(this._fnobj, k, param[k], table_name);
	        this._act_call_fn.call(this._fnobj, name, table_name);
	    }
	};    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.CmdQueue = new cr.behaviors.Rex_bCmdqueue.CmdQueueKlass(this,
                                                                     this.properties[0],  // 0=Ring, 1=Ping-pong
                                                                     0);
	    this.pendding_params = {};
	    this.current_cmd = null;
        
        this.init_start = (this.properties[1] == 1);
        this.init_cmds = this.properties[2];
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];
        /**END-PREVIEWONLY**/	        
	};

	behinstProto.tick = function ()
	{
	    if (!this.init_start)
	        return;

        this.CmdQueue.JSON2Queue(this.init_cmds);            
        this.run_command(this.CmdQueue.Next());
	    this.init_start = false; 
        this.init_cmds = null;
	};  
	
    behinstProto.param_get = function (param_index_)
    {
        if (this.current_cmd == null)
            return null;
        else
            return this.current_cmd[1][param_index_];                
    }; 	
	
    behinstProto.run_command = function (cmd)
    {
        if (cmd == null)
            return;
                   
        this.current_cmd = cmd;
        this.runtime.trigger(cr.behaviors.Rex_bCmdqueue.prototype.cnds.OnCommand, this.inst);
        //this.current_cmd = null;              
        
        this.type.call_function(this.inst.uid, cmd);
    }; 	
	behinstProto.saveToJSON = function ()
	{
		return { "cq": this.CmdQueue.saveToJSON(),
		         "pp": this.pendding_params,
                 "cc": this.current_cmd,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.CmdQueue.loadFromJSON(o["cq"]);
		this.pendding_params = o["pp"];
        this.current_cmd = o["cc"];
	};    
	
    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
    {
        this.propsections.length = 0;
        this.propsections.push({"name": "Command count", "value": this.CmdQueue.GetCmdCount()});
        this.propsections.push({"name": "Current index", "value": this.CmdQueue.GetCurCmdIndex()});
        
        if (this.current_cmd != null)
        {
            this.propsections.push({"name": "Command name", "value": this.current_cmd[0]});
            var k, param = this.current_cmd[1];           
            for (k in param)
            {
                this.propsections.push({"name": "Parameter "+k.toString(), "value": param[k]});
            }
        }
        propsections.push({
            "title": this.type.name,
            "properties": this.propsections
        });
    };
    
    behinstProto.onDebugValueEdited = function (header, name, value)
    {
    };
    /**END-PREVIEWONLY**/		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
	// command 
    Cnds.prototype.OnCommand = function (name_)
    {       
        if (this.current_cmd == null)
            return false;
            
        var is_my_call = cr.equals_nocase(name_, this.current_cmd[0]);
        return is_my_call;
    }; 
    Cnds.prototype.CompareParam = function (param_index_, cmp_, value_)
    {
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
        return cr.do_cmp(param_value, cmp_, value_);
    };    
    Cnds.prototype.TypeOfParam = function (param_index_, type_cmp)
    {        
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
            
        var t = (type_cmp == 0)? "number":"string";        
        return (typeof(param_value) == t);
    };
    Cnds.prototype.IsEmpty = function ()
    {
        return this.CmdQueue.IsEmpty();
    };
    Cnds.prototype.IsLast = function ()
    {
        if (this.CmdQueue.IsEmpty())
            return false;
        return ( this.CmdQueue.GetCurCmdIndex() == (this.CmdQueue.GetCmdCount()-1) );
    };   
    Cnds.prototype.IsFirst = function ()
    {
        if (this.CmdQueue.IsEmpty())
            return false;    
        return (this.CmdQueue.GetCurCmdIndex() == 0);
    };    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetParameter = function (name_, value_)
    {
        this.pendding_params[name_] = value_;
    }; 

    Acts.prototype.PushCmd = function (fn_name)
    {  
        this.CmdQueue.Push([fn_name, this.pendding_params]);
        this.pendding_params = {};
    }; 

    Acts.prototype.PopCmd = function ()
    {
        if (this.CmdQueue.IsEmpty())
            return;
        
        this.run_command(this.CmdQueue.Pop());
    }; 
        
    Acts.prototype.CleanCmds = function ()
    {
        this.CmdQueue.Clean();
        this.current_cmd = null;
    }; 

    Acts.prototype.NextCmd = function ()
    {    
        if (this.CmdQueue.IsEmpty())
            return;

        this.run_command(this.CmdQueue.Next());
    };  
        
    Acts.prototype.SetRepeatMode = function (rm)
    {
        this.CmdQueue.SetRepeatMode(rm);            
    }; 
    
    Acts.prototype.LoadJSONCmds = function (json_string)
    {  
        this.CmdQueue.JSON2Queue(json_string); 
        this.current_cmd = null; 
    };
    
    Acts.prototype.LoadCSVCmds = function (csv_string)
    {  
        this.CmdQueue.CSV2Queue(csv_string);  
        this.current_cmd = null;
    };
    
    Acts.prototype.SetNextIndex = function (index)
    {
        this.CmdQueue.SetNextIndex(Math.floor(index));  
    };  
    
    Acts.prototype.InsertCmdAt = function (fn_name, index)
    {   
        this.CmdQueue.InsertAt([fn_name, this.pendding_params], Math.floor(index));
        this.pendding_params = {};
    }; 

    Acts.prototype.RunCurCmd = function ()
    {    
        if (this.CmdQueue.IsEmpty())
            return;

        this.run_command(this.CmdQueue.Current());
    }; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
			
    Exps.prototype.Param = function (ret, param_index_)
    {
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            param_value = 0;
        ret.set_any(param_value);
    };
			
    Exps.prototype.CmdToString = function (ret)
    {
        ret.set_string(this.CmdQueue.CmdToString());
    };    
			
    Exps.prototype.CmdCount = function (ret)
    {
        ret.set_int(this.CmdQueue.GetCmdCount());
    };  
			
    Exps.prototype.CurIndex = function (ret)
    {
        ret.set_int(this.CmdQueue.GetCurCmdIndex());
    };   
			
    Exps.prototype.LastIndex = function (ret)
    {
        ret.set_int(this.CmdQueue.GetCmdCount()-1);
    };    
}());

(function ()
{
    cr.behaviors.Rex_bCmdqueue.CmdQueueKlass = function(plugin, rm, dir)
    {
        this.plugin = plugin;
	    this.cmd_queue = [];
        this.repeat_mode = rm;  // 0=Ring, 1=Ping-pong
        this.queue_index = 0;
        this.execute_index = 0;
        this.dir = dir;  // 0=Increase, 1=Decrease       
    };
    var CmdQueueKlassProto = cr.behaviors.Rex_bCmdqueue.CmdQueueKlass.prototype;

    CmdQueueKlassProto.IsEmpty = function ()
    {        
        return (this.cmd_queue.length == 0);
    };   

    CmdQueueKlassProto.GetCmdCount = function ()
    {        
        return this.cmd_queue.length;
    };  

    CmdQueueKlassProto.GetCurCmdIndex = function ()
    {        
        return this.execute_index;
    };  
    
	CmdQueueKlassProto.getNextIndex = function ()
	{        
        var q_len = this.cmd_queue.length;
        if (q_len == 1)
            return 0;
            
        if (this.queue_index >= q_len)
        {
            if (this.repeat_mode == 0)
            {
                this.queue_index = 0;
            }
            else
            {
                this.dir = 1;  // roll back
                this.queue_index = q_len-2;
            }
        }
        else if (this.queue_index < 0)
        {
            this.queue_index = 1;
            this.dir = 0;
        }
        this.execute_index = this.queue_index;
        
        
        // get next index
        if (this.dir == 0)
        {
            this.queue_index += 1;
        }
        else
        {
            this.queue_index -= 1;
        }
        
        return this.execute_index;
	}; 

    CmdQueueKlassProto.Push = function (cmd)
    {
        this.cmd_queue.push(cmd);
    }; 

    CmdQueueKlassProto.InsertAt = function (cmd, index)
    {
        if (index >= this.cmd_queue.length)
            this.cmd_queue.push(cmd);
        else
            this.cmd_queue.splice(index, 0, cmd);
    }; 
    CmdQueueKlassProto.Pop = function ()
    {
        return this.cmd_queue.shift();
    }; 
        
    CmdQueueKlassProto.Clean = function ()
    {
        this.cmd_queue.length = 0;
        this.queue_index = 0;
        this.dir = 0;              
    }; 

    CmdQueueKlassProto.Next = function ()
    {
        var queue_index = this.getNextIndex();
        return this.cmd_queue[queue_index];
    };  

    CmdQueueKlassProto.Current = function ()
    {
        var queue_index = this.GetCurCmdIndex();
        return this.cmd_queue[queue_index];        
    };    
    
    CmdQueueKlassProto.SetRepeatMode = function (rm)
    {
        this.repeat_mode = rm;            
    }; 
    
    CmdQueueKlassProto.SetNextIndex = function (index)
    {
        this.queue_index = index;            
    };
    
    CmdQueueKlassProto.CmdToString = function ()
    {
        return JSON.stringify(this.cmd_queue);
    };     
    
    CmdQueueKlassProto.JSON2Queue = function (in_string)    
    {             
        this.Clean();   
        if (in_string == "")
            return;

        this.cmd_queue = JSON.parse(in_string);
    }; 
    CmdQueueKlassProto.CSV2Queue = function (in_string)    
    {      
        this.Clean();   
        if (in_string == "")
            return;
          
        var arr = CSVToArray(in_string);
        var i,line_cnt = arr.length;
        var l, name, params, ci, cell_cnt;
        for (i=0; i<line_cnt; i++)
        {
            l = arr[i];
            cell_cnt = l.length;
            name = l[0];
            params = [];
            for (ci=1; ci<cell_cnt; ci++)
            {
                params.push(value_get(l[ci]));
            }
            this.cmd_queue.push([name, params]);
        }
    }; 
    
	CmdQueueKlassProto.saveToJSON = function ()
	{
		return { "cq": this.CmdQueue,
                 "rm": this.repeat_mode,
                 "qi": this.queue_index,
                 "dir": this.dir
                };
	};
	
	CmdQueueKlassProto.loadFromJSON = function (o)
	{
		this.CmdQueue = o["cq"];
        this.repeat_mode = o["rm"];
        this.queue_index = o["qi"];
        this.dir = o["dir"];
	}; 
    
	var value_get = function(v)
	{
	    if (v == null)
	        v = 0;
	    else
	        v = eval("("+v+")");
        
        return v;
	};
	
    // copy from    
    // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    var CSVToArray = function ( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
                (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                        strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                        ){

                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else {

                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }; 
}());    