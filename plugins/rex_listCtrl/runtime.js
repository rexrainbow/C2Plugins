// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ListCtrl = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ListCtrl.prototype;
		
	pluginProto.onCreate = function ()
	{
		pluginProto.acts.Destroy = function ()
		{
			this.runtime.DestroyInstance(this);
            this.set_lines_count(0);
		};        
	};
    
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
	    this.lines_mgr = new cr.plugins_.Rex_ListCtrl.LinesMgrKlass(this);    
	    this.is_vertical_scrolling = (this.properties[4] === 1); 	    
	    this.is_clamp_OY = (this.properties[3] === 1);
	    this.lines_mgr.SetDefaultLineHeight(this.properties[1]);
	    this.update_flag = true;
	    this.OY = 0;
	    

	    this.lines_mgr.SetLinesCount(this.properties[2]);
        this.visibleLineIndexes = {};
        this.pre_visibleLineIndexes = {};
        
        this.visible_start = 0;     
        this.visible_end = 0;
        
        // monitor ListCtrl changing
        this.pre_instX = this.x;
        this.pre_instY = this.y;
        this.pre_instHeight = this.get_inst_height();
        this.is_out_top_bound = false;
        this.is_out_bottom_bound = false;
        this.bound_type = null;
        
        this.exp_LineIndex = 0;
        this.exp_LineTLX = 0;
        this.exp_LineTLY = 0;
        this.exp_LastRemovedLines = "";        
        this.exp_LastBoundOY = 0;
        
        this.runtime.tick2Me(this);
        
        this.lines_mgr_save = null;
	};
    
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};  

    instanceProto.tick2 = function()
    {            
        var cur_instHeight = this.get_inst_height();
        var is_heightChanged = (this.pre_instHeight !== cur_instHeight);
        var is_XChanged = (this.pre_instX !== this.x);
        var is_YChanged = (this.pre_instY !== this.y);
        var is_areaChange = is_heightChanged || is_XChanged || is_YChanged;
        
        if (is_areaChange)
            this.update_flag = true;
        
        if (!this.update_flag)
            return;
                
        this.update();
        this.update_flag = false;        
        
        this.pre_instX = this.x;
        this.pre_instY = this.y;        
        this.pre_instHeight = cur_instHeight;
    };
    
	instanceProto.onDestroy = function ()
	{		
        //this.set_lines_count(0);
	};
        
	instanceProto.get_inst_height = function()
	{
	    return (this.is_vertical_scrolling)? this.height : this.width;
	};
	
	instanceProto.get_inst_width = function()
	{
	    return (this.is_vertical_scrolling)? this.width : this.height;
	};	    	
	    	
	    	
    instanceProto.update = function(refresh)
    {     
        if (refresh)
        {
            this.prepare();
            this.hide_lines();   
        }
        
        this.prepare();
        this.show_lines();
        this.hide_lines();
        
        this.exp_LineIndex = -1;        
    };  
    
    instanceProto.prepare = function()
    {            
        var tmp = this.pre_visibleLineIndexes;
        this.pre_visibleLineIndexes = this.visibleLineIndexes;        
        this.visibleLineIndexes = tmp;
        
        clean_table(this.visibleLineIndexes);
        
    };    

    instanceProto.show_lines = function()
    {
        // index
        var line_index = this.lines_mgr.Height2LineIndex(-this.OY);          
        var line_tlx = this.get_tlX();       
        var line_tly = this.get_tlY(line_index);
        // end condition
        var bottom_bound = this.get_bottom_bound();    
        var last_index = this.lines_mgr.GetLinesCount() -1;
        
        var line;
        this.visible_start = null;
        this.visible_end = null;
        // visible lines
        while ((line_tly < bottom_bound) && (line_index <= last_index))
        {
            if (this.lines_mgr.IsInRange(line_index))
            {
                if (this.visible_start === null)            
                {
                    this.visible_start = line_index; 
                }                    
                this.visible_end = line_index;                    
                this.visibleLineIndexes[line_index] = true; 
                
                line = this.lines_mgr.GetLine(line_index);
                line_tly += line.offsety;
                line.SetTLXY(line_tlx, line_tly);
                
                if (this.pre_visibleLineIndexes.hasOwnProperty(line_index))
                {
                    line.PinInsts();
                }
                else
                {
                    // on line visible
                    this.show_line(line_index, line_tlx, line_tly);
                }
            }
            
            line_tly += this.lines_mgr.GetLineHeight(line_index);            
            line_index += 1;
        }
    }; 
    
    instanceProto.show_line = function(line_index, tlx, tly)
    {
        this.exp_LineIndex = line_index;
        
        if (this.is_vertical_scrolling)
        {
            this.exp_LineTLX = tlx;
            this.exp_LineTLY = tly;
        }
        else
        {
            this.exp_LineTLX = tly;
            this.exp_LineTLY = tlx;            
        }
        
        this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnLineVisible, this);     
    };
    
    instanceProto.hide_lines = function()
    {          
        // invisible lines
        var i, insts;
        for (i in this.pre_visibleLineIndexes)
        {        
            if (this.visibleLineIndexes.hasOwnProperty(i))
                continue;            
                
            this.hide_line(i);              
        }
    };
    
    instanceProto.hide_line = function(line_index)
    {          
        this.exp_LineIndex = parseInt(line_index);
        this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnLineInvisible, this);
            
        // destroy instances in the line  
        this.lines_mgr.DestroyPinedInsts(line_index);     
    };

    instanceProto.get_tlX = function()
    {                
        this.update_bbox(); 
        return (this.is_vertical_scrolling)? this.bquad.tlx : this.bquad.tly;
    };
        
    instanceProto.get_tlY = function(line_index)
    {            
        this.update_bbox(); 
        var poy = (this.is_vertical_scrolling)? this.bquad.tly : this.bquad.tlx;       
        var py = this.OY +  this.lines_mgr.LineIndex2Height(0, line_index-1) + poy;       
       
        return py;
    };
        
    instanceProto.get_bottom_bound = function()
    {            
        this.update_bbox(); 
        return (this.is_vertical_scrolling)? this.bquad.bly : this.bquad.trx;
    };  
          
	instanceProto.set_OY = function(oy)
	{    
	    // check out-of-bound
	    var is_out_top_bound = this.is_OY_out_bound(oy, 0);
	    var is_out_bottom_bound = this.is_OY_out_bound(oy, 1);
	    	    	      	                	    
	    if (this.is_clamp_OY)
	    {
	        var total_lines=this.lines_mgr.GetLinesCount();
	        var visible_lines=this.lines_mgr.Height2LineIndex(this.get_inst_height(), true);
	        
            // less then 1 page
	        if (total_lines === visible_lines)
	            oy = 0;
	            
	        else if (oy > 0)
	            oy = 0;
	            
	        else 
	        {
	            var list_height = this.get_list_height();
	            if (oy < -list_height)
	                oy = -list_height;
	        }
	    }
	    
        if (this.OY !== oy )
        {
	        this.update_flag = true;
	        this.OY = oy;	  
        }
  
        // trigger out-of-bound	    	    
	    if (is_out_top_bound && (!this.is_out_top_bound))
	    {
	        this.bound_type = 0;
	        this.exp_LastBoundOY = 0;
	        this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnOYOutOfBound, this);  
	        this.bound_type = null;
	    }
	    if (is_out_bottom_bound && !this.is_out_bottom_bound)
	    {
	        this.bound_type = 1;
	        this.exp_LastBoundOY = -this.get_list_height();
	        this.runtime.trigger(cr.plugins_.Rex_ListCtrl.prototype.cnds.OnOYOutOfBound, this);
	        this.bound_type = null;
	    }
	          
        this.is_out_top_bound = is_out_top_bound;	
        this.is_out_bottom_bound = is_out_bottom_bound;		    
	};

	instanceProto.is_visible = function(line_index)
	{
	    if (this.visible_start == null)
	        return false;
	        
	    return (line_index >= this.visible_start) && (line_index <= this.visible_end);
	};

	var NEWLINES = [];	
	var get_content = function (content)
	{
	    if (content === "")
	        return null;
	        
	    if (typeof(content) === "string")
	    {
	        try {
		    	return JSON.parse(content);
		    }
		    catch(e) { return null; }
	    }
	    else if (typeof(content) === "number")
	    {
	        NEWLINES.length = content;
	        var i;
	        for (i=0; i<content; i++)
	            NEWLINES[i] = null;	 
	        return NEWLINES;       
	    }
	    else
	        return content;
	};

    instanceProto.set_lines_count = function (cnt)
	{
	    if (cnt < 0)
	        cnt = 0;

	    this.lines_mgr.SetLinesCount(cnt);
        this.update();
	};	
	
    instanceProto.insert_lines = function (line_index, content)
	{
	    content = get_content(content);
	    if (content === null)
	        return;
	        
	    var cnt = content.length;
        if (this.is_visible(line_index))
        {
            var i;
            for(i=0; i<cnt; i++)
            {
	            delete this.visibleLineIndexes[line_index + i];
	            this.visibleLineIndexes[this.visible_end+1 + i] = true; 
	        }	        
        }	    
	    this.lines_mgr.InsertLines(line_index, content);	    
	    this.update();
	};	
	
    instanceProto.remove_lines = function (line_index, cnt)
	{   
	    var total_lines = this.lines_mgr.GetLinesCount();
	    if ( (line_index + cnt) > total_lines)
	        cnt = total_lines - line_index;
	        
        if (this.is_visible(line_index))
        {
            var i;
            for(i=0; i<cnt; i++)
            {
                delete this.visibleLineIndexes[this.visible_end-i];
            }                        
        }	    
	    var removed_lines = this.lines_mgr.RemoveLines(line_index, cnt);
	    this.exp_LastRemovedLines = JSON.stringify( removed_lines );
        this.update();
	};	    
			
    instanceProto.for_each_line = function (start_, end_, filter_fn)
	{   
	    var total_lines = this.lines_mgr.GetLinesCount();	    
	    var start = (start_ == null)? 0: Math.min(start_, end_);	    
	    var end = (end_ == null)? total_lines-1: Math.max(start_, end_);
	    if (start < 0)
	        start = 0;
	    if (end > total_lines)
	        end = total_lines-1;
	        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
		var i;
		for(i=start; i<=end; i++)
		{
            if ((!filter_fn) || filter_fn(i))
            {
			
                if (solModifierAfterCnds)
                {
                    this.runtime.pushCopySol(current_event.solModifiers);
                }
            

                this.exp_LineIndex = i;
                current_event.retrigger();

            
		        if (solModifierAfterCnds)
		        {
		            this.runtime.popSol(current_event.solModifiers);
		        }  

            }			
		}
    		
		return false;	        
	    
	};	 

    instanceProto.get_list_height = function ()
	{
        var h;
        var totalLinesHeight = this.lines_mgr.GetTotalLinesHeight();
        var inst_height = this.get_inst_height();
        if (totalLinesHeight > inst_height)
            h = totalLinesHeight - inst_height;
        else
            h = 0;
        
        return h;
	};    

    instanceProto.is_OY_out_bound = function (OY, bound_type)
	{
	    var is_out_bound;
	    // top
	    if (bound_type === 0)
	        is_out_bound = (OY > 0);
	        
	    // bottom	    
	    else   
	        is_out_bound = (OY < -this.get_list_height()); 
            
	    return is_out_bound;
	};
	
    instanceProto._uid2inst = function(uid, objtype)
    {
	    if (uid == null)
		    return null;
        var inst = this.runtime.getObjectByUID(uid);
        if (inst == null)
			return null;

        if ((objtype == null) || (inst.type == objtype))
            return inst;        
        else if (objtype.is_family)
        {
            var families = inst.type.families;
            var cnt=families.length, i;
            for (i=0; i<cnt; i++)
            {
                if (objtype == families[i])
                    return inst;
            }
        }
        // objtype mismatch
        return null;
    };	
	
    instanceProto.pick_insts_on_line = function (line_index, objtype)
	{
	    var line = this.lines_mgr.GetLine(line_index, true);
	    if (line == null)
	        return false;
	        
	    var insts_uid = line.GetPinInstsUID();
	    
        var sol = objtype.getCurrentSol();  
        sol.select_all = false;   
        sol.instances.length = 0;   // clear contents
        var uid, inst;
        for (uid in insts_uid)
        {
            inst = this._uid2inst(uid, objtype)
            if (inst != null)
                sol.instances.push(inst);
        }
        objtype.applySolToContainer();
        return  (sol.instances.length >0);       
	};
	
    var name2type = {};  // private global object
	instanceProto.pick_all_insts_on_line = function (line_index)
	{	    
	    var line = this.lines_mgr.GetLine(line_index, true);
	    if (line == null)
	        return false;
	    var insts_uid = line.GetPinInstsUID();

	    var uid, inst, objtype, sol;
	    clean_table(name2type);
	    var has_inst = false;    
	    for (uid in insts_uid)
	    {
	        inst = this._uid2inst(uid);
            if (inst == null)
                continue;
	        objtype = inst.type; 
	        sol = objtype.getCurrentSol();
	        if (!(objtype.name in name2type))
	        {
	            sol.select_all = false;
	            sol.instances.length = 0;
	            name2type[objtype.name] = objtype;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
	    var name;
	    for (name in name2type)
	        name2type[name].applySolToContainer();
	    clean_table(name2type);
	    return has_inst;
	};  		
	    
    var clean_table = function(o)
    {
        for(var k in o)
            delete o[k];
    };
	        
	instanceProto.saveToJSON = function ()
	{
        // monitor ListCtrl changing
        this.pre_instX = this.x;
        this.pre_instY = this.y;
        this.pre_instHeight = this.height;      
        
		return { 
                 "update_flag": this.update_flag,
		         "OY": this.OY,
		         "lines_mgr": this.lines_mgr.saveToJSON(),
		         "visible_lines": this.visibleLineIndexes,
		         "pre_visible_lines": this.pre_visibleLineIndexes,
		         "visible_start": this.visible_start,
		         "visible_end": this.visible_end,
		         
		         "pre_instX": this.pre_instX,
		         "pre_instY": this.pre_instY,
		         "pre_instHeight": this.pre_instHeight,    
		         "topb": this.is_out_top_bound,
		         "bottomb": this.is_out_bottom_bound  
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.update_flag = o["update_flag"];	   
	    this.OY = o["OY"];	    
	    this.lines_mgr_save = o["lines_mgr"]; 
	    this.visibleLineIndexes = o["visible_lines"];
	    this.pre_visibleLineIndexes = o["pre_visible_lines"];
	    this.visible_start = o["visible_start"];
	    this.visible_end = o["visible_end"];
	    
	    this.pre_instX = o["pre_instX"];
	    this.pre_instY = o["pre_instY"];
	    this.pre_instHeight = o["pre_instHeight"];	    
        this.is_out_top_bound = o["topb"];	
        this.is_out_bottom_bound = o["bottomb"];	  	    
	};		  
	
	instanceProto.afterLoad = function ()
	{
	    this.lines_mgr.afterLoad( this.lines_mgr_save ); 	    
	    this.lines_mgr_save = null;
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{	  
        var visible_index_range;
        if (this.visible_start != null)
            visible_index_range = this.visible_start.toString() + " - " + this.visible_end.toString();
        else
            visible_index_range = "";
	    	    
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Offset Y", "value": this.OY},	
			               {"name": "Visible line indexes", "value": visible_index_range},		               			               
			               ]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnLineVisible = function ()
	{
		return true;
	}; 

	Cnds.prototype.OnLineInvisible = function ()
	{
		return true;
	};

	Cnds.prototype.ForEachLine = function (start, end)
	{
		return this.for_each_line(start, end);
	};	

	Cnds.prototype.ForEachVisibleLine = function ()
	{
		return this.for_each_line(this.visible_start, this.visible_end);
	};	

	Cnds.prototype.ForEachMatchedLine = function (k_, cmp, v_)
	{
        var self = this;
        var filter_fn = function (line_index)
        {
            var d = self.lines_mgr.GetCustomData(line_index, k_);
            if (d == null)
                return false;
                
    		return cr.do_cmp(d, cmp, v_);
        }
		return this.for_each_line(null, null, filter_fn);
	};	

	Cnds.prototype.IsOYOutOfBound = function (bound_type)
	{
	    if ((bound_type === 0) || (bound_type === 1))
	        return this.is_OY_out_bound(this.OY, bound_type);
	    else
		    return this.is_OY_out_bound(this.OY, 0) || this.is_OY_out_bound(this.OY, 1);
	}; 
	
	Cnds.prototype.OnOYOutOfBound = function (bound_type)
	{
	    if ((bound_type === 0) || (bound_type === 1))
	        return (this.bound_type === bound_type);
	    else
	        return true;
	}; 	 

	Cnds.prototype.PickInstsOnLine = function (line_index, objtype)
	{
	    if (!objtype)
	        return false;	    
		return this.pick_insts_on_line(line_index, objtype);
	}; 	  

	Cnds.prototype.PickAllInstsOnLine = function (line_index)
	{
	    return this.pick_all_insts_on_line(line_index);
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetOY = function (oy)
	{
	    this.set_OY(oy);
	};	
    Acts.prototype.AddOY = function (dy)
	{
	    this.set_OY(this.OY + dy);
	};		
    Acts.prototype.PinInstToLine = function (objs)
	{
        if ((!objs) || (this.exp_LineIndex == -1))
            return;
        
		var insts = objs.getCurrentSol().getObjects();
		var i, cnt=insts.length;
        for (i=0; i<cnt; i++)  
        {      
	        this.lines_mgr.AddInstToLine(this.exp_LineIndex, insts[i]);
	    }        
	};
    Acts.prototype.UnPinInst = function (objs)
	{
        if (!objs)
            return;
            
	    if (this.visible_start !== null)
	    {
		    var insts = objs.getCurrentSol().getObjects();
	        var i, j, cnt=insts.length, uid;
			for (i=0; i<cnt; i++)  
			{
			    uid = insts[i].uid;
	            for(j=this.visible_start; j<=this.visible_end; j++)
	                this.lines_mgr.RemoveInstFromLine(j, uid)
		    }
	    }  
	};    
    
    Acts.prototype.SetLinesCount = function (cnt)
	{
	    this.set_lines_count(cnt);
	};
    
    Acts.prototype.SetOYToLineIndex = function (line_index)
	{
        var p = this.lines_mgr.LineIndex2Height(0, line_index);
	    this.set_OY( -p );
	};	
    
    Acts.prototype.SetOYByPercentage = function (percentage)
	{
        var p = this.get_list_height() *percentage;
        this.set_OY( -p );
	};			
    Acts.prototype.SetValue = function (line_index, key_, value_)
	{
	    this.lines_mgr.SetCustomData(line_index, key_, value_);
	};	
    Acts.prototype.CleanKeyInAllLine = function (key_)
	{
	    this.lines_mgr.SetCustomData(null, key_, null);
	};		
    Acts.prototype.CleanKeyInAllLine = function ()
	{
	    this.lines_mgr.SetCustomData(null, null, null);
	};	    
    Acts.prototype.InsertNewLines = function (line_index, cnt)
	{
	    this.insert_lines(line_index, cnt);
	};
	
    Acts.prototype.RemoveLines = function (line_index, cnt)
	{
	    this.remove_lines(line_index, cnt);
	};	
	
    Acts.prototype.InsertLines = function (line_index, content)
	{
	    this.insert_lines(line_index, content);
	};

    Acts.prototype.PushNewLines = function (where, cnt)
	{
	    var line_index = (where==1)? 0: this.lines_mgr.GetLinesCount();
	    this.insert_lines(line_index, cnt);
	};	
	
    Acts.prototype.PushLines = function (where, content)
	{
	    var line_index = (where==1)? 0: this.lines_mgr.GetLinesCount();
	    this.insert_lines(line_index, content);
	};	
	
    Acts.prototype.SetDefaultLineHeight = function (height)
	{
	    if (height <= 0)
		    return;
        var is_changed = this.lines_mgr.SetDefaultLineHeight(height);      
        if (is_changed)  this.update_flag = true;
	};	
	
    Acts.prototype.SetLineOffsetY = function (line_index, offsety)
	{
        var line = this.lines_mgr.GetLine(line_index);
        if (!line)
            return;
        var is_changed = (line.offsety != offsety);        
	    line.offsety = offsety;        
        if (is_changed)  this.update_flag = true;
	};	
	
    Acts.prototype.SetLineHeight = function (line_index, height)
	{
        if (!this.lines_mgr.IsInRange(line_index))
            return;
        
	    if (height < 0)
		    return;
                       
        var is_changed = this.lines_mgr.SetLineHeight(line_index, height);   
        if (is_changed)  this.update_flag = true;
	};	
    Acts.prototype.RefreshVisibleLines = function ()
	{
        this.update(true);
	};	
	
	Acts.prototype.PickInstsOnLine = function (line_index, objtype)
	{
	    if (!objtype)
	        return;
		this.pick_insts_on_line(line_index, objtype);
	};

	Acts.prototype.PickAllInstsOnLine = function (line_index)
	{
	    return this.pick_all_insts_on_line(line_index);
	};	 			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.LineIndex = function (ret)
	{
		ret.set_int(this.exp_LineIndex);
	};	

    Exps.prototype.LineTLX = function (ret)
	{
		ret.set_float(this.exp_LineTLX);
	};	
    Exps.prototype.LineTLY = function (ret)
	{
		ret.set_float(this.exp_LineTLY);
	};
	
    Exps.prototype.UID2LineIndex = function (ret, uid)
	{   
	    var line_index;
	    if (this.visible_start !== null)
	    {
	        var i;
	        for(i=this.visible_start; i<=this.visible_end; i++)
	        {
	            if (this.lines_mgr.LineHasInst(i, uid))
	            {
	                line_index = i;
	                break;
	            }
	        }
	    }
	    if (line_index == null)
	        line_index = -1;
	        
		ret.set_int(line_index);
	};			
	
    Exps.prototype.LineIndex2LineTLY = function (ret, line_index)
	{ 
		ret.set_float(this.get_tlY(line_index));
	};	
	
    Exps.prototype.TotalLinesCount = function (ret)
	{ 
		ret.set_int(this.lines_mgr.GetLinesCount());
	};	
	
    Exps.prototype.DefaultLineHeight = function (ret)
	{ 
		ret.set_float(this.lines_mgr.defaultLineHeight);
	};			
	
    Exps.prototype.LineHeight = function (ret, index_)
	{ 
		ret.set_float(this.lines_mgr.GetLineHeight(index_));
	};    
	
    Exps.prototype.ListHeight = function (ret)
	{ 
		ret.set_float(this.lines_mgr.GetTotalLinesHeight());
	};        
    
    Exps.prototype.At = function (ret, index_, key_, default_value)
	{
	    var v = this.lines_mgr.GetCustomData(index_, key_);   
        if (v == null)       
            v = default_value || 0;        
        
		ret.set_any(v);
	};
	
    Exps.prototype.LastRemovedLines = function (ret)
	{
		ret.set_string(this.exp_LastRemovedLines);
	};	
	
    Exps.prototype.CustomDataInLines = function (ret, line_index, cnt)
	{	    
	    var dataInLines = this.lines_mgr.GetCustomDataInLines(line_index, cnt);
		ret.set_string(JSON.stringify( dataInLines ));
	};	
	
    Exps.prototype.OY = function (ret)
	{ 
		ret.set_float(this.OY);
	};	
	
    Exps.prototype.BotomOY = function (ret)
	{ 
		ret.set_float(-this.get_list_height());
	};    
	
    Exps.prototype.TopOY = function (ret)
	{ 
		ret.set_float(0);
	};  	
	
    Exps.prototype.LastBoundOY = function (ret)
	{ 
		ret.set_float(this.exp_LastBoundOY);
	};  
	
    Exps.prototype.LineCX = function (ret)
	{
	    var x = this.exp_LineTLX + (0.5 * this.get_inst_width());
		ret.set_float(x);
	};
    	
    Exps.prototype.CurLineIndex = function (ret)
	{
		ret.set_int(this.exp_LineIndex);
	};	    
    	
    Exps.prototype.FirstVisibleLineIndex = function (ret)
	{         
		ret.set_int(this.visible_start || 0);
	};		
    	
    Exps.prototype.LastVisibleLineIndex = function (ret)
	{     
		ret.set_int(this.visible_end || 0);  
	};	    
    
}());


(function ()
{
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;       
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
    var lineCache = new ObjCacheKlass();
        
    // LinesMgr
    cr.plugins_.Rex_ListCtrl.LinesMgrKlass = function(plugin)
    {
        this.plugin = plugin; 
        this.lines = [];     
	    this.defaultLineHeight = 0;     
        this.defaultLineHeightMode = true; 
        this.totalLinesHeight = null;        
    };
    var LinesMgrKlassProto = cr.plugins_.Rex_ListCtrl.LinesMgrKlass.prototype;  

	LinesMgrKlassProto.SetLinesCount = function(cnt)
	{
        var end=this.GetLinesCount();
        if (end > cnt)
        {
            var i, line;
            for(i=cnt; i<end; i++)
            {
                // release lines
                line = this.lines[i];
                if (!line)
                    continue;
                    
                line.Clean();
                lineCache.freeLine( line );                
            }
            this.lines.length = cnt;            
        }
        else if (end < cnt)
        {
            var i,start=end;
            this.lines.length = cnt
            for(i=start; i<cnt; i++)
            {
                this.lines[i] = null;
            }
        }
        
        if (this.GetLinesCount() === 0)
            this.defaultLineHeightMode = true;
        
        this.totalLinesHeight = null;
	};
    
    LinesMgrKlassProto.GetLinesCount = function()
    {
        return this.lines.length;
    };

    LinesMgrKlassProto.IsInRange = function(line_index)
    {        
        return ((line_index >= 0) && (line_index < this.GetLinesCount()));
    };
         
    LinesMgrKlassProto.GetNewLine = function()
    {        
        // allocate line
        var line = lineCache.allocLine();
        if (line == null)
            line = new LineKlass(this.plugin);
        else
            line.Reset(this.plugin); 
                    
        return line;
    };
                
	LinesMgrKlassProto.GetLine = function(line_index, dont_create_line_inst)
	{	   
        if (!this.IsInRange(line_index))
            return;
            
        if ((this.lines[line_index] == null) && (!dont_create_line_inst))
        {
            this.lines[line_index] = this.GetNewLine();
        }
        
        return this.lines[line_index];
	};
		
	LinesMgrKlassProto.AddInstToLine = function(line_index, inst)
	{	   
	    if (inst == null)
	        return;
        var line = this.GetLine(line_index);
        if (line == null)
            return;
        
        line.AddInst(inst);
	};
	LinesMgrKlassProto.RemoveInstFromLine = function(line_index, uid)
	{	   
	    if (inst == null)
	        return;
        var line = this.GetLine(line_index, true);
        if (line == null)
            return;
        
        line.RemoveInst(uid);
	};    
	LinesMgrKlassProto.LineHasInst = function(line_index, uid)
	{
        var line = this.GetLine(line_index, true);
        if (line == null)
            return;
        
        return line.HasInst(uid);
	};		
				     
	LinesMgrKlassProto.DestroyPinedInsts = function(line_index)
	{
	    var line = this.GetLine(line_index, true);
        if (line == null)
            return;
        
        line.DestroyPinedInsts();    	    
	};
	
	LinesMgrKlassProto.SetCustomData = function(line_index, k, v)
	{
	    if (line_index != null)  // set custom data in a line
		{
            var line = this.GetLine(line_index);
            if (line == null)
                return;
        
            line.SetCustomData(k, v);
	    }
        else    // set custom data in all lines
		{
		    var i, cnt=this.GetLinesCount(), line;
			var is_clean_key = (v == null);
			for(i=0; i<cnt; i++)
			{
			    line = this.GetLine(i, is_clean_key);
				if (line == null)
				    continue;
					
			    line.SetCustomData(k, v);
	        }
		}
	}; 
	
	LinesMgrKlassProto.GetCustomData = function(line_index, k)
	{
	    var line = this.GetLine(line_index, true);
        if (line == null)
            return;
        
        return line.GetCustomData(k);
	};	
	
	LinesMgrKlassProto.InsertLines = function(line_index, content)
	{
	    var cnt = content.length;
	    
	    if (line_index < 0)
	        line_index = 0;
	    else if (line_index > this.GetLinesCount())
	        line_index = this.GetLinesCount();
	        	    
	    this.lines.length += cnt;
	    var start = this.GetLinesCount() - 1;
	    var end = line_index + cnt;
	    var i, insert_line, new_line;
	    for (i=start; i>=line_index; i--)
	    {
	        if (i>=end)  // shift line down
	            this.lines[i] = this.lines[i-cnt];
	        else        // empty space
	        {
	            insert_line = content[i-line_index];
	            if (insert_line == null)
	                this.lines[i] = null;
	            else
	            {
	                new_line = this.GetNewLine();
	                new_line.SetCustomData( insert_line );
	                this.lines[i] = new_line;
	            }
	        }
	    }
        
        this.totalLinesHeight = null;
	};	
	
	LinesMgrKlassProto.RemoveLines = function(line_index, cnt)
	{
	    var i, line, removed_lines=[];
	    removed_lines.length = cnt;
	    for (i=0; i<cnt; i++)
	    {
	        line = this.GetLine(line_index+i, true);
	        if (line)
	        {
	            // save custom data
	            removed_lines[i] = line.GetCustomData();
	            
	            // clean line and recycle
                line.Clean();
                lineCache.freeLine( line );  
	        }
	        else
	        {
	            removed_lines[i] = null;
	        }
	    }
	    var start = line_index+cnt;
	    var end = this.GetLinesCount() -1;
	    for (i=start; i<=end; i++)
	    {
	        this.lines[i-cnt] = this.lines[i];
	    }
	    this.lines.length -= cnt;
	    
        if (this.GetLinesCount() === 0)
            this.defaultLineHeightMode = true;
        
        this.totalLinesHeight = null;
	    return removed_lines;
	};
	
	LinesMgrKlassProto.GetCustomDataInLines = function(line_index, cnt)
	{
	    var i, line, dataInLines=[];
	    dataInLines.length = cnt;
	    for (i=0; i<cnt; i++)
	    {
	        line = this.GetLine(line_index+i, true);
	        if (line)
	            dataInLines[i] = line.GetCustomData();
	        else
	            dataInLines[i] = null;
	    }

	    return dataInLines;
	};	
    
	LinesMgrKlassProto.SetDefaultLineHeight = function(height)
	{
        if (this.defaultLineHeight === height)
            return false;
        
        this.defaultLineHeight = height;
        this.totalLinesHeight = null;  
        return true;
	};	      
    
	LinesMgrKlassProto.GetLineHeight = function(line_index)
	{
        if (!this.IsInRange(line_index))
            return 0;
        
        var line_height;
        if (this.defaultLineHeightMode)
            line_height = this.defaultLineHeight;
        else
        {
            var line = this.GetLine(line_index, true);
            var deltaHeight = (line)? line.deltaHeight : 0;
            line_height = this.defaultLineHeight + deltaHeight;
        }
        
        return line_height;
	};	    
    
	LinesMgrKlassProto.SetLineHeight = function(line_index, height)
	{
        if (!this.IsInRange(line_index))
            return;
        
        var curHeight = this.GetLineHeight(line_index);
        if (curHeight === height)
            return false;
        
        var deltaHeight = height - this.defaultLineHeight;
        var line = this.GetLine(line_index);
        var dd = deltaHeight - line.deltaHeight;
        line.deltaHeight = deltaHeight;
        
        if (deltaHeight !== 0)
            this.defaultLineHeightMode = false;          
        
        if (this.totalLinesHeight !== null)
            this.totalLinesHeight += dd;  

        return true;        
	};	  
      
	LinesMgrKlassProto.Height2LineIndex = function(h, isCeil)
	{
        if (this.defaultLineHeightMode)
        {
            var line_index = h / this.defaultLineHeight;
            if (isCeil)
                line_index = Math.ceil(line_index);
            else
                line_index = Math.floor(line_index);

            return line_index;
        }
        else
        {
            var total_ines_cnt = this.GetLinesCount();       
            var remain=h, line_cnt=0, is_valid_index;
            var line, line_height, line_index=0;
            
            while (1)
            {
                line_height = this.GetLineHeight(line_index);
                remain -=  line_height;
                
                is_valid_index = (line_index >=0) && (line_index < total_ines_cnt);
                if ((remain > 0) && is_valid_index)
                {
                    line_index += 1;                
                }
                else if (remain === 0)
                    return line_index;  
                else
                {
                    if (isCeil)
                    {  
                        var line_index_save = line_index;              
                        line_index += 1;
                        is_valid_index = (line_index >=0) && (line_index < total_ines_cnt);
                        
                        if (!is_valid_index)
                            line_index = line_index_save;
                    }
                    
                    return line_index;
                }                    
            }
        }        
	};	 

	LinesMgrKlassProto.LineIndex2Height = function(start, end)
	{
        if (this.defaultLineHeightMode)
            return (end - start + 1) * this.defaultLineHeight;
        else
        {            
            var i, h, sum=0;
            var all_default_height = true;
            for(i=start; i<=end; i++)
            {
                h = this.GetLineHeight(i);
                sum += h;                
                
                if (h !== this.defaultLineHeight)
                    all_default_height = false;
            }
            
            var all_lines = (start===0)  && (end >= (this.GetLinesCount()-1));
            if (all_default_height && all_lines)
                this.defaultLineHeightMode = true;
            
            return sum;
        }        
	}; 

    LinesMgrKlassProto.GetTotalLinesHeight = function ()
    {
        if (this.totalLinesHeight === null)
            this.totalLinesHeight = this.LineIndex2Height(0, (this.GetLinesCount()-1));
        
        return this.totalLinesHeight;
    };
    
	LinesMgrKlassProto.saveToJSON = function ()
	{
	    var i,cnt=this.GetLinesCount();
	    var save_lines = [], line, save_line;
	    for(i=0; i<cnt; i++)
	    {
	        line = this.lines[i];
	        save_line = (!line)? null : line.saveToJSON()
	        save_lines.push( save_line );
	    }

		return { "lines": save_lines,	
                      "dlh": this.defaultLineHeight,        
                      "dlhm": this.defaultLineHeightMode,
                      "tlh": this.totalLinesHeight,
		       };
	};
	
	LinesMgrKlassProto.afterLoad = function (o)
	{	    
	    this.lines.length = 0;
	    
	    var save_lines = o["lines"];
	    var i,cnt=save_lines.length;
	    var save_lines = [], save_line;
	    for(i=0; i<cnt; i++)
	    {
	        save_line = save_lines[i];
	        if (!save_line)
	            this.lines.push( null );
	        else
	        {
	            var new_line = this.GetNewLine();
	            new_line.afterLoad(save_line);
	            this.lines.push( new_line );
	        }
	    }
        
        this.defaultLineHeight = o["dlh"];
        this.defaultLineHeightMode = o["dlhm"];
        this.totalLinesHeight = o["tlh"];
	};	
	// LinesMgr

    // Line
    var LineKlass = function(plugin)
    {     
        this.pined_insts = {};      
        this.custom_data = {};
        
        this.Reset(plugin);
    };
    var LineKlassProto = LineKlass.prototype;  

	LineKlassProto.Reset = function(plugin)
	{	   
        this.plugin = plugin;         
        this.tlx = 0;
        this.tly = 0;
        this.offsety = 0; 
        this.deltaHeight = 0;  
	};	
    
	LineKlassProto.SetTLXY = function(tlx, tly)
	{	   
        this.tlx = tlx;
        this.tly = tly;  
	};	
		
	LineKlassProto.AddInst = function(inst)
	{	   
	    var uid = inst.uid;
	    if (!this.pined_insts.hasOwnProperty(uid))
	        this.pined_insts[uid] = {};
	    
	    var pin_info = this.pined_insts[uid];		       
	    pin_info["dx"] = inst.x - this.get_px();
	    pin_info["dy"] = inst.y - this.get_py();	    
	};
	LineKlassProto.RemoveInst = function(uid)
	{	   
	    if (uid != null)
	    {
	        if (!this.pined_insts.hasOwnProperty(uid))
	            return;	    
            delete this.pined_insts[uid];   
        }
        else
        {
            for(var uid in this.pined_insts)
                delete this.pined_insts[uid];
        }
	};
    
	LineKlassProto.HasInst = function(uid)
	{
	    return this.pined_insts.hasOwnProperty(uid);
	};	
	
	LineKlassProto.PinInsts = function()
	{
	    var uid, inst, pin_info, runtime = this.plugin.runtime;	   
	    for (uid in this.pined_insts)	   
	    {
	        inst = runtime.getObjectByUID(uid);
	        if (!inst)
	        {
	            delete this.pined_insts[uid]; 
	            continue;
	        }
	        pin_info = this.pined_insts[uid];	        
	        pin_inst(inst, pin_info, this.get_px(), this.get_py());
	    }	
	};	
	
	LineKlassProto.GetPinInstsUID = function()
	{
	    return this.pined_insts;
	};		
	
	
	LineKlassProto.get_px = function()
	{
	    return (this.plugin.is_vertical_scrolling)? this.tlx : this.tly;
	};
	
	LineKlassProto.get_py = function()
	{
	    return (this.plugin.is_vertical_scrolling)? this.tly : this.tlx;
	};		
	
	var pin_inst = function(inst, pin_info, ref_x, ref_y)
	{
        var new_x = ref_x + pin_info["dx"];
        var new_y = ref_y + pin_info["dy"];
        
        if ((new_x != inst.x) || (new_y != inst.y))
        {                
            inst.x = new_x;
            inst.y = new_y;
            inst.set_bbox_changed();			    
        }
	};		
	
	LineKlassProto.DestroyPinedInsts = function()
	{
	    var uid, inst, runtime = this.plugin.runtime;	   
	    for (uid in this.pined_insts)	   
	    {
	        inst = runtime.getObjectByUID(uid);
	        if (!inst)
	            continue;
	            
            Object.getPrototypeOf(inst.type.plugin).acts.Destroy.call(inst);
	        //runtime.DestroyInstance(inst);
	        
	        delete this.pined_insts[uid]; 
	    }	    	    
	};
	
	LineKlassProto.SetCustomData = function(k,v)
	{
	    if (typeof(k) != "object")    // single key
		{
		    if (v != null)
	            this.custom_data[k] = v;	    
		    else if (this.custom_data.hasOwnProperty(k))  // v == null: clean key
			    delete this.custom_data[k];
	    }
        else if (k === null)    // clean all
        {
            for (var n in this.custom_data)
                delete this.custom_data[n];
        }             
	    else                          // copy all
	    {
	        var d = k;
	        for (var k in d)
	            this.custom_data[k] = d[k];
	    }
	};
	
	LineKlassProto.GetCustomData = function(k)
	{
	    if (k != null)    // single key
	        return this.custom_data[k];
	    else             // copy all
	    {
	        var d = {};
	        for (k in this.custom_data)
	            d[k] = this.custom_data[k];
	            	    
	        return d;
	    }
	};	
	
	LineKlassProto.Clean = function()
	{
	    this.DestroyPinedInsts();
	    for(var k in this.custom_data)
	        delete this.custom_data[k];	              	        
	};	
	
	LineKlassProto.saveToJSON = function ()
	{
		return { "insts": this.pined_insts,
		         "data": this.custom_data,
		         "tlx": this.tlx,
		         "tly": this.tly,
		         "offsety": this.offsety,	
                 "dh": this.deltaHeight,                 
		       };
	};
	
	LineKlassProto.afterLoad = function (o)
	{
		this.pined_insts = o["insts"];
		this.custom_data = o["data"];
		this.tlx = o["tlx"];
		this.tly = o["tly"];	
		this.offsety = o["offsety"];
        this.deltaHeight = o["dh"]; 
	};	
	// Line
}());