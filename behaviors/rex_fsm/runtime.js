// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_FSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_FSM.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
        this.logic = {};
        this.transfer_action = {};
        this.exit_action = {};
        this.enter_action = {};        
        this.fn_obj = null;
        this.csv_obj = null;
        this.adapter = new cr.behaviors.Rex_FSM.FSMAdapterKlass(this);
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;        
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{      
	    this.is_debug_mode = this.properties[0];  
        this.activated = (this.properties[1]==1);
		var previous_state = "Off";		
		var current_state = this.properties[2];		
        current_state = (current_state!="")? current_state:"Off";	           
		// initial memory
		var mem = this.properties[3];
        try
        {
            mem = (mem!="")? jQuery.parseJSON(mem):{};      
        }
        catch(err)
        {
            alert(err);
            mem = {};            
        }   
        this.fsm = new cr.behaviors.Rex_FSM.FSMKlass(this, 
                                                     previous_state, current_state,
                                                     mem); 
        this.is_echo = false;
        this.is_my_call = false;                                                     
	};  
    
	behinstProto.tick = function ()
	{
	};
    
    var _sn2js = function(code_line)
    {
        var index_end_mark = code_line.lastIndexOf("->");          
        var index_left_brace = code_line.indexOf("(");
        var index_right_brace = code_line.substring(0,index_end_mark).lastIndexOf(")");
        var condition_code = code_line.substring(index_left_brace,index_right_brace+1);
        if (condition_code != "")
            condition_code = "if"+condition_code;
        var return_code;
        if (index_end_mark == -1)
            return_code = code_line;
        else
            return_code = code_line.substring(index_end_mark+2);
        if (return_code!= "")
            return_code = "return "+return_code+";";
        return condition_code+return_code;
    };
    
    var SN2JS = function (code_string)
    {
        var sn_lines = code_string.split("\n");
        var i;
        var line_cnt = sn_lines.length;
        var js_lines = [];
        for (i=0; i<line_cnt; i++)
        {
            js_lines.push(_sn2js(sn_lines[i]));
        }
        return js_lines.join("\n");
    };
    
	behinstProto._load_code = function (dict, name, code_string, code_format)
	{  
        if (code_format == 0)  //Simple notation        
            code_string = SN2JS(code_string);
            
        code_string = "function(fsm, fn, csv){\n"+code_string +"\n}";
        try
        {
            dict[name] = eval("("+code_string+")");
        }
        catch(err)
        {
            alert(err);
        }
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

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnEnter = function (name)
	{
        this.is_echo = true;
		return (this.is_my_call & (this.fsm["CurState"] == name));
	};

	cnds.OnDefaultEnter = function ()
	{
		return (this.is_my_call);
	}; 	
	
	cnds.OnExit = function (name)
	{
        this.is_echo = true;
		return (this.is_my_call && (this.fsm["PreState"] == name));
	};	
    
	cnds.OnDefaultExit = function ()
	{
		return (this.is_my_call);
	}; 	    

	cnds.OnTransfer = function (name_from, name_to)
	{
	    var is_my_call = this.is_my_call &&
                         ((this.fsm["PreState"] == name_from) && 
		                  (this.fsm["CurState"] == name_to));
        this.is_echo |= is_my_call;
		return is_my_call;
	};	
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
    
	acts.SetActivated = function (s)
	{
		this.activated = (s==1);
	};      
    
	acts.CleanMemory = function ()
	{
        this.fsm["Mem"] = {};
	};  
        
	acts.SetMemory = function (index, value)
	{
        this.fsm["Mem"][index] = value;
	};

    acts.Request = function ()
	{
        if (this.activated)
	        this.fsm.Request();
	};  
    
    acts.Transit = function (new_state)
	{
        if (this.activated)    
	        this.fsm.Request(new_state);
	};     

    acts.CSV2Logic = function (csv_string, code_format)
	{
        if (csv_string == "")
            return;
            
        var code_array = CSVToArray(csv_string);   
        var i, state_name, code_string;
        var state_len = code_array.length;
        for (i=1;i<state_len;i++)
        {
            state_name = code_array[i][0];        
            code_string = code_array[i][1];  
            if (code_string != null)
                this._load_code(this.type.logic, state_name, code_string, code_format);    
        }  
	};

    acts.String2Logic = function (state_name, code_string, code_format)
	{
        if (code_string == "")
            return;
        this._load_code(this.type.logic, state_name, code_string, code_format);
	};
    
    acts.ConnectFn = function (fn_objs)
	{  
        var fn_obj = fn_objs.instances[0];
        if (fn_obj.check_name == "FUNCTION")
            this.type.fn_obj = fn_obj.adapter;        
        else
            alert ("Can not connect to a function object");
	};    
    
    acts.ConnectCSV = function (csv_objs)
	{  
        var csv_obj = csv_objs.instances[0];
        if (csv_obj.check_name == "CSV")
            this.type.csv_obj = csv_obj.adapter;        
        else
            alert ("Can not connect to a csv object");
	};   
    
    acts.CSV2Action = function (csv_string)
	{
        if (csv_string == "")
            return;
            
        var code_array = CSVToArray(csv_string);   
        var i, j, pre_state, cur_state, code_string;
        var state_len = code_array.length;
        for (i=1; i<state_len; i++)
        {
            cur_state = code_array[i][0];
            for (j=1; j<state_len; j++)
            {
                pre_state = code_array[0][j];
                code_string = code_array[i][j];
                
                this._load_code(this.type.transfer_action, 
                                (pre_state+"->"+cur_state), 
                                code_string, 1);
            }
        }  
	};    
    
    acts.String2Action = function (pre_state, cur_state, code_string)
	{
        if (code_string == "")
            return;
        this._load_code(this.type.transfer_action, 
                        (pre_state+"->"+cur_state), 
                        code_string, 1);
	};    

    acts.CSV2EnterExit = function (csv_string)
	{
        if (csv_string == "")
            return;
            
        var code_array = CSVToArray(csv_string);   
        var i, j, state_name, enter_code_string, exit_code_string;
        var state_len = code_array.length;
        for (i=1; i<state_len; i++)
        {
            state_name = code_array[i][0];
            enter_code_string = code_array[i][1];
            exit_code_string = code_array[i][2];
            if (enter_code_string != "")
                this._load_code(this.type.enter_action, 
                                state_name, enter_code_string, 1);
            if (exit_code_string != "")
                this._load_code(this.type.exit_action, 
                                state_name, enter_code_string, 1);              
        }  
	};    
    
    acts.String2EnterExit = function (state, 
                                         enter_code_string, exit_code_string)
	{
        if (enter_code_string != "")
            this._load_code(this.type.enter_action, 
                            state_name, enter_code_string, 1);
        if (exit_code_string != "")
            this._load_code(this.type.exit_action, 
                            state_name, enter_code_string, 1);       
	}; 

	acts.InjectJSFunctionObjects = function (code_string)
	{
        var fn = eval("("+code_string+")");
        fn(this.type.adapter, this.type.fn_obj, this.type.csv_obj);
	};    
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.CurState = function (ret)
	{
	    ret.set_string(this.fsm["CurState"]);
	};	
	
	exps.PreState = function (ret)
	{
	    ret.set_string(this.fsm["PreState"]);
	};
	
    exps.Mem = function (ret, index)
	{
        var value = this.fsm["Mem"][index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
                alert ("Can not find index in memory '" + index + "'");
                
        }
	    ret.set_any(value);
	};	
}());

(function ()
{
    cr.behaviors.Rex_FSM.FSMKlass = function(plugin, 
                                             previous_state, current_state,
                                             mem)
    {
        this["_plugin"] = plugin;
        this["_type"] = plugin.type; 
        this["inst"] = plugin.inst;
        
        this["PreState"] = previous_state;
        this["CurState"] = current_state;
        this["Mem"] = mem;
    };
    var FSMKlassProto = cr.behaviors.Rex_FSM.FSMKlass.prototype;
    
    FSMKlassProto.Request = function(new_state)
    {
        if (new_state == null)
        {
            var fn = this["_type"].logic[this["CurState"]];
            if (fn == null)
                return;
        
            // fn != null        
            new_state = fn(this, this["_type"].fn_obj, this["_type"].csv_obj);
            if (new_state == null)
                return;
        }
            
        // new_state != null
        this["PreState"] = this["CurState"];
        this["CurState"] = new_state;
                
        var pre_state = this["PreState"];
        var cur_state = this["CurState"];
        
        // try to run transfer_action
        var is_echo = this._run_transfer_action(pre_state, cur_state);
        if (is_echo)
            return;
         
        // (fn == null) && (this["_plugin"].is_echo==false)
        this._run_exit_action(pre_state);
        this._run_enter_action(cur_state);
    };
    
    FSMKlassProto._run_transfer_action = function(pre_state, cur_state)
    {
        var name = pre_state+"->"+cur_state;
        var fn = this["_type"].transfer_action[name];
        if (fn != null)
        {
            fn(this, this["_type"].fn_obj, this["_type"].csv_obj);
        }        
        this["_plugin"].is_echo = false;
        this["_plugin"].is_my_call = true;
        this["_plugin"].runtime.trigger(
            cr.behaviors.Rex_FSM.prototype.cnds.OnTransfer,this["inst"]);
        this["_plugin"].is_my_call = false;  

        return ( (fn != null) || this["_plugin"].is_echo);        
    };
    
    FSMKlassProto._run_exit_action = function(pre_state)
    {
        var fn = this["_type"].exit_action[pre_state];
        if (fn != null)
             fn(this, this["_type"].fn_obj, this["_type"].csv_obj);
        
        this["_plugin"].is_echo = false;
        this["_plugin"].is_my_call = true;
        this["_plugin"].runtime.trigger(
            cr.behaviors.Rex_FSM.prototype.cnds.OnExit, this["inst"]); 
        this["_plugin"].is_my_call = false; 
        // no exit handle event, try to trigger default exit event
        if (!this["_plugin"].is_echo)
        {
            this["_plugin"].is_my_call = true;
            this["_plugin"].runtime.trigger(
                cr.behaviors.Rex_FSM.prototype.cnds.OnDefaultExit, this["inst"]); 
            this["_plugin"].is_my_call = false;            
        }      
    };
    
    FSMKlassProto._run_enter_action = function(cur_state)
    {
        var fn = this["_type"].enter_action[cur_state];
        if (fn != null)
            fn(this, this["_type"].fn_obj, this["_type"].csv_obj);

        this["_plugin"].is_echo = false;
        this["_plugin"].is_my_call = true;
        this["_plugin"].runtime.trigger(
            cr.behaviors.Rex_FSM.prototype.cnds.OnEnter, this["inst"]); 
        this["_plugin"].is_my_call = false; 
        // no enter handle event, try to trigger default enter event
        if (!this["_plugin"].is_echo)
        {
            this["_plugin"].is_my_call = true;
            this["_plugin"].runtime.trigger(
                cr.behaviors.Rex_FSM.prototype.cnds.OnDefaultEnter, this["inst"]);             
            this["_plugin"].is_my_call = false; 
        }      
    };    
    
    // adapter for exporting to javascript
    cr.behaviors.Rex_FSM.FSMAdapterKlass = function(type)
    {
        this["_type"] = type; 
        this["fn"] = type.fn_obj;
        this["csv"] = type.csv_obj;
    };
    var FSMAdapterKlassProto = cr.behaviors.Rex_FSM.FSMAdapterKlass.prototype;
    
	FSMAdapterKlassProto["InjectLogic"] = function(state_name, fn)
	{
	    this["_type"].logic[state_name] = fn;
	}; 
    
	FSMAdapterKlassProto["InjectExitAction"] = function(state_name, fn)
	{
	    this["_type"].exit_action[state_name] = fn;
	}; 
    
	FSMAdapterKlassProto["InjectEnterAction"] = function(state_name, fn)
	{
	    this["_type"].enter_action[state_name] = fn;
	}; 
    
	FSMAdapterKlassProto["InjectTransferAction"] = function(pre_state, cur_state, fn)
	{
	    this["_type"].transfer_action[(pre_state+"->"+cur_state)] = fn;
	};     
}());