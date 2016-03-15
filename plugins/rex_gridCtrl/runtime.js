// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_GridCtrl = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_GridCtrl.prototype;
		
	pluginProto.onCreate = function ()
	{
		pluginProto.acts.Destroy = function ()
		{
			this.runtime.DestroyInstance(this);
            this.set_cells_count(0);
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
	    this.is_vertical_scrolling = (this.properties[6] === 1); 	    
	    this.is_clamp_OXY = (this.properties[5] === 1);
	    this.default_cellHeight = this.properties[1];
	    this.default_cellWidth = this.properties[2];
	    
	    this.update_flag = true;
	    this.OY = 0;
	    this.OX = 0;
	    
	    this.lines_mgr = new cr.plugins_.Rex_GridCtrl.LinesMgrKlass(this);
	    this.lines_mgr.SetLinesCount(this.properties[3]);
	    this.col_num = this.properties[4];	    
        this.visibleLineIndexes = {};
        this.pre_visibleLineIndexes = {};
        
        this.visibleX_start = 0;     
        this.visibleX_end = 0;         
        this.visibleY_start = 0;     
        this.visibleY_end = 0;
       
        // monitor ListCtrl changing
        this.pre_instX = this.x;
        this.pre_instY = this.y;
        this.pre_instHeight = this.get_inst_height();
        this.pre_instWidth = this.get_inst_width();        
        this.is_out_top_bound = false;
        this.is_out_bottom_bound = false;
        this.is_out_left_bound = false;
        this.is_out_right_bound = false;        
        this.bound_type = null;
        
        this.exp_CellIndex = 0;
        this.exp_CellTLX = 0;
        this.exp_CellTLY = 0;
        this.exp_LastRemovedLines = "";        
        this.exp_LastBoundOY = 0;
        this.exp_LastBoundOX = 0;        
        
        this.runtime.tick2Me(this);
        
        this.lines_mgr_save = null;  // save / load
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
        var cur_instWidth = this.get_inst_width();
        var is_heightChanged = (this.pre_instHeight !== cur_instHeight);
        var is_widthChanged = (this.pre_instWidth !== cur_instWidth);
        var is_XChanged = (this.pre_instX !== this.x);
        var is_YChanged = (this.pre_instY !== this.y);
        var is_areaChange = is_heightChanged || is_widthChanged || is_XChanged || is_YChanged;
        
        this.update_flag = this.update_flag || is_areaChange;
        
        if (!this.update_flag)
            return;
                
        this.update();
        this.update_flag = false;        
        
        this.pre_instX = this.x;
        this.pre_instY = this.y;        
        this.pre_instHeight = cur_instHeight;
        this.pre_instWidth = cur_instWidth;
    };
    
	instanceProto.onDestroy = function ()
	{		
        //this.set_cells_count(0);
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
        
        this.exp_CellIndex = -1;        
    };  
    
    instanceProto.prepare = function()
    {            
        var tmp = this.pre_visibleLineIndexes;
        this.pre_visibleLineIndexes = this.visibleLineIndexes;        
        this.visibleLineIndexes = tmp;
        
        clean_table(this.visibleLineIndexes);
        
    };    
    
    
    instanceProto.get_lineIndex = function (x, y)
    {
        return (y * this.col_num ) + x;
    };
    instanceProto.show_lines = function()
    {            
        // index                
        var line_Yindex = Math.floor( -this.OY / this.default_cellHeight );        
        if (line_Yindex < 0)
            line_Yindex = 0;
            
        var line_Xindex = Math.floor( -this.OX / this.default_cellWidth );            
        if (line_Xindex < 0)
            line_Xindex = 0;
            
        var line_index = this.get_lineIndex(line_Xindex, line_Yindex);
        
        // end condition
        var bottom_bound = this.get_bottom_bound(); 
        var right_bound = this.get_right_bound();    
        var last_index = this.lines_mgr.GetLinesCount() -1;
        var last_Xindex = this.col_num -1;
        
        var line;
        this.visibleY_start = null;
        this.visibleY_end = null;
        this.visibleX_start = null;
        this.visibleX_end = null;
                
        // visible lines
        var line_tlx0 = this.get_tlX(line_Xindex), line_tlx=line_tlx0;       
        var line_tly = this.get_tlY(line_Yindex);
        while ((line_tly < bottom_bound) && (line_index <= last_index))
        {
            if (this.lines_mgr.IsInRange(line_index))
            {
                if (this.visibleY_start === null)            
                {
                    this.visibleY_start = line_Yindex; 
                    this.visibleY_end = line_Yindex;
                }  
                if (this.visibleX_start === null)            
                {
                    this.visibleX_start = line_Xindex; 
                    this.visibleX_end = line_Xindex;
                }  
                
                if (this.visibleY_end < line_Yindex)
                    this.visibleY_end = line_Yindex;
                
                if (this.visibleX_end < line_Xindex)
                    this.visibleX_end = line_Xindex;
                                  
                this.visibleLineIndexes[line_index] = true; 
                
                line = this.lines_mgr.GetLine(line_index);
                //line_tly += line.offsety;
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
            
            line_tlx += this.default_cellWidth;
            if ((line_tlx < right_bound) && ( line_Xindex < last_Xindex))
            {
                line_Xindex += 1;  
            }
            else
            {
                line_Xindex = this.visibleX_start;
                line_Yindex += 1;
                                
                line_tlx=line_tlx0;
                line_tly += this.default_cellHeight;
            }
            
            line_index = this.get_lineIndex(line_Xindex, line_Yindex);
        }
    }; 
    
    instanceProto.show_line = function(line_index, tlx, tly)
    {
        this.exp_CellIndex = line_index;
        
        if (this.is_vertical_scrolling)
        {
            this.exp_CellTLX = tlx;
            this.exp_CellTLY = tly;
        }
        else
        {
            this.exp_CellTLX = tly;
            this.exp_CellTLY = tlx;            
        }
        
        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnCellVisible, this);     
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
        this.exp_CellIndex = parseInt(line_index);
        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnCellInvisible, this);
            
        // destroy instances in the line  
        this.lines_mgr.DestroyPinedInsts(line_index);     
    };

    instanceProto.get_tlX = function(line_index)
    {                
        this.update_bbox(); 
        var pox = (this.is_vertical_scrolling)? this.bquad.tlx : this.bquad.tly;   
        var px = ( this.OX + (line_index * this.default_cellWidth) ) + pox;        
        return px;
    };
        
    instanceProto.get_tlY = function(line_index)
    {            
        this.update_bbox(); 
        var poy = (this.is_vertical_scrolling)? this.bquad.tly : this.bquad.tlx;       
        var py = ( this.OY + (line_index * this.default_cellHeight) ) + poy;        
        return py;
    };
        
    instanceProto.get_bottom_bound = function()
    {            
        this.update_bbox(); 
        return (this.is_vertical_scrolling)? this.bquad.bly : this.bquad.trx;
    };  
        
    instanceProto.get_right_bound = function()
    {            
        this.update_bbox(); 
        return (this.is_vertical_scrolling)? this.bquad.trx : this.bquad.bly;
    };           
	instanceProto.set_OY = function(oy)
	{  
	    // check out-of-bound
	    var is_out_top_bound = this.is_OY_out_bound(oy, 0);
	    var is_out_bottom_bound = this.is_OY_out_bound(oy, 1);
	    	    	      	                	    
	    if (this.is_clamp_OXY)
	    {
	        var total_Ylines =this.get_Ylines();
	        var visible_lines=this.get_page2YLineCnt();
	        
	        if (total_Ylines < visible_lines)
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
	    
	    this.update_flag = this.update_flag || (this.OY !== oy );
	    this.OY = oy;	    
	    
	    	   
        // trigger out-of-bound	    	    
	    if (is_out_top_bound && (!this.is_out_top_bound))
	    {
	        this.bound_type = 0;
	        this.exp_LastBoundOY = 0;
	        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnOYOutOfBound, this);  
	        this.bound_type = null;
	    }
	    if (is_out_bottom_bound && !this.is_out_bottom_bound)
	    {
	        this.bound_type = 1;
	        this.exp_LastBoundOY = -this.get_list_height();
	        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnOYOutOfBound, this);
	        this.bound_type = null;
	    }
	          
        this.is_out_top_bound = is_out_top_bound;	
        this.is_out_bottom_bound = is_out_bottom_bound;		    
	};
    
	instanceProto.set_OX = function(ox)
	{  
	    // check out-of-bound
	    var is_out_left_bound = this.is_OX_out_bound(ox, 0);
	    var is_out_right_bound = this.is_OX_out_bound(ox, 1);
	    	    	      	                	    
	    if (this.is_clamp_OXY)
	    {
	        var total_Xlines= this.col_num;
	        var visible_lines=this.get_page2XLineCnt();
	        
	        if (total_Xlines < visible_lines)
	            ox = 0;
	            
	        else if (ox > 0)
	            ox = 0;
	            
	        else 
	        {
	            var list_width = this.get_list_width();
	            if (ox < -list_width)
	                ox = -list_width;
	        }
	    }
	    
	    this.update_flag = this.update_flag || (this.OX !== ox );
	    this.OX = ox;	    
	    
	    	   
        // trigger out-of-bound	    	    
	    if (is_out_left_bound && (!this.is_out_left_bound))
	    {
	        this.bound_type = 0;
	        this.exp_LastBoundOX = 0;
	        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnOXOutOfBound, this);  
	        this.bound_type = null;
	    }
	    if (is_out_right_bound && !this.is_out_right_bound)
	    {
	        this.bound_type = 1;
	        this.exp_LastBoundOX = -this.get_list_width();
	        this.runtime.trigger(cr.plugins_.Rex_GridCtrl.prototype.cnds.OnOXOutOfBound, this);
	        this.bound_type = null;
	    }
	          
        this.is_out_left_bound = is_out_left_bound;	
        this.is_out_right_bound = is_out_right_bound;		    
	};
    
	instanceProto.is_visible = function(line_index)
	{
	    if (this.visibleY_start == null)
	        return false;
	   
	    var line_Yindex = Math.floor(line_index / this.col_num);
	    var line_Xindex = line_index % this.col_num;	    
	    return (line_Yindex >= this.visibleY_start) && (line_Yindex <= this.visibleY_end) &&
	           (line_Xindex >= this.visibleX_start) && (line_Xindex <= this.visibleX_end);
	};
    
    instanceProto.get_page2YLineCnt = function(ignore_round)
    {
	    var page2lines = this.get_inst_height()/this.default_cellHeight;
		if (!ignore_round)
		    page2lines = Math.ceil(page2lines);
        return page2lines;          
    };  

    instanceProto.get_page2XLineCnt = function(ignore_round)
    {	
	    var page2lines = this.get_inst_width()/this.default_cellWidth;
		if (!ignore_round)
		    page2lines = Math.ceil(page2lines);		
        return page2lines;          
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

    instanceProto.set_cells_count = function (cnt, ignore_update)
	{
	    if (cnt < 0)
	        cnt = 0;

	    this.lines_mgr.SetLinesCount(cnt);
	    
	    if (!ignore_update)
            this.update();
	};	
    instanceProto.set_col_num = function (col, ignore_update)
	{
	    this.col_num = col;	    
	    
	    if (!ignore_update)
            this.update();
	};   	
	
    instanceProto.insert_cells = function (line_index, content, ignore_update)
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
	            this.visibleLineIndexes[this.visibleY_end+1 + i] = true; 
	        }	        
        }	    
	    this.lines_mgr.InsertLines(line_index, content);	    

	    if (!ignore_update)
            this.update();
	};	
	
    instanceProto.remove_cells = function (line_index, cnt, ignore_update)
	{   
	    var total_lines = this.lines_mgr.GetLinesCount();
	    if ( (line_index + cnt) > total_lines)
	        cnt = total_lines - line_index;
	        
        if (this.is_visible(line_index))
        {
            var i;
            for(i=0; i<cnt; i++)
            {
                delete this.visibleLineIndexes[this.visibleY_end-i];
            }                        
        }	    
	    var removed_lines = this.lines_mgr.RemoveLines(line_index, cnt);
	    this.exp_LastRemovedLines = JSON.stringify( removed_lines );

	    if (!ignore_update)
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
            

                this.exp_CellIndex = i;
                current_event.retrigger();

            
		        if (solModifierAfterCnds)
		        {
		            this.runtime.popSol(current_event.solModifiers);
		        }  

            }         
		}
    		
		return false;	        
	    
	};	 

    instanceProto.get_page2Index = function (page)
	{
        var Yindex;
	    var page2YLines = this.get_page2YLineCnt();  
        if (page == -1) // last full page      
            Yindex = this.get_Ylines() - page2YLines;        
        else        
            Yindex = page2YLines * page;
            
        if (Yindex < 0)
            Yindex = 0;            
        return (Yindex * this.col_num);
	};
    
    instanceProto.get_list_height = function ()
	{
	    var h;
        var total_Ylines =this.get_Ylines();
	    var visible_lines=this.get_page2YLineCnt(true);
	    
	    if (total_Ylines > visible_lines)
	        h = (total_Ylines - visible_lines) * this.default_cellHeight;
	    else
	        h = total_Ylines * this.default_cellHeight;
	        
        return h;
	};    
    instanceProto.get_list_width = function ()
	{
	    var w;
        var total_Xlines = this.col_num;
	    var visible_lines=this.get_page2XLineCnt();
	    
	    if (total_Xlines > visible_lines)
	        w = (total_Xlines - visible_lines) * this.default_cellWidth;
	    else
	        w = total_Xlines * this.default_cellWidth;
	        
        return w;
	};
    instanceProto.get_Ylines = function ()
	{
        return Math.ceil(this.lines_mgr.GetLinesCount()/this.col_num);
	};	
    instanceProto.is_OY_out_bound = function (oy, bound_type)
	{
	    var is_out_bound;
	    // top
	    if (bound_type === 0)
	        is_out_bound = (oy > 0);
	        
	    // bottom	    
	    else   
	        is_out_bound = (oy < -this.get_list_height()); 
            
	    return is_out_bound;
	};
    
    instanceProto.is_OX_out_bound = function (ox, bound_type)
	{
	    var is_out_bound;
	    // left
	    if (bound_type === 0)
	        is_out_bound = (ox > 0);
	        
	    // right	    
	    else   
	        is_out_bound = (ox < -this.get_list_width()); 
            
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
	
    instanceProto.pick_insts_on_cell = function (line_index, objtype)
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
	instanceProto.pick_all_insts_on_cell = function (line_index)
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
        this.pre_instWidth  = this.width;
               
        
		return { "cell_height": this.default_cellHeight,
		         "cell_width": this.default_cellWidth,
		         "update_flag": this.update_flag,
		         "OY": this.OY,
		         "OX": this.OX,
		         "lines_mgr": this.lines_mgr.saveToJSON(),
		         "visible_lines": this.visibleLineIndexes,
		         "pre_visible_lines": this.pre_visibleLineIndexes,
		         "visibleY_start": this.visibleY_start,
		         "visibleY_end": this.visibleY_end,
		         "visibleX_start": this.visibleX_start,
		         "visibleX_end": this.visibleX_end,		
		                  
		         "pre_instX": this.pre_instX,
		         "pre_instY": this.pre_instY,
		         "pre_instHeight": this.pre_instHeight,    
		         "pre_instWidth": this.pre_instWidth,    
		         "topb": this.is_out_top_bound,
		         "bottomb": this.is_out_bottom_bound,
		         "leftb": this.is_out_left_bound,
		         "rightb": this.is_out_right_bound	         
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.default_cellHeight = o["cell_height"];
	    this.default_cellWidth = o["cell_width"];	    	    
	    this.update_flag = o["update_flag"];	   
	    this.OY = o["OY"];	    
	    this.OX = o["OX"];
	    this.lines_mgr_save = o["lines_mgr"]; 
	    this.visibleLineIndexes = o["visible_lines"];
	    this.pre_visibleLineIndexes = o["pre_visible_lines"];
	    this.visibleY_start = o["visibleY_start"];
	    this.visibleY_end = o["visibleY_end"];
	    this.visibleX_start = o["visibleX_start"];
	    this.visibleX_end = o["visibleX_end"];	
	        
	    this.pre_instX = o["pre_instX"];
	    this.pre_instY = o["pre_instY"];
	    this.pre_instHeight = o["pre_instHeight"];
	    this.pre_instWidth = o["pre_instWidth"];	    	    
        this.is_out_top_bound = o["topb"];	
        this.is_out_bottom_bound = o["bottomb"];	 
        this.is_out_left_bound = o["leftb"];	
        this.is_out_right_bound = o["rightb"];	         	    
	};		  

	instanceProto.afterLoad = function ()
	{
	    this.lines_mgr.afterLoad( this.lines_mgr_save ); 	    
	    this.lines_mgr_save = null;
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{	  
	    var line_index = [];
	    for (var k in this.visibleLineIndexes)
	        line_index.push(parseInt(k));
	        
	    line_index.sort();
	    
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Offset Y", "value": this.OY},	
			               {"name": "Visible line indexes", "value": JSON.stringify(line_index)},		               			               
			               ]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnCellVisible = function ()
	{
		return true;
	}; 

	Cnds.prototype.OnCellInvisible = function ()
	{
		return true;
	};

	Cnds.prototype.ForEachCell = function (start, end)
	{
		return this.for_each_line(start, end);
	};	

	Cnds.prototype.ForEachVisibleCell = function ()
	{
	    if (this.visibleY_start == null)
	        return false;
	        
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		         
	    var y, x, idx;
	    for(y=this.visibleY_start; y<=this.visibleY_end; y++)
	    {
			for (x=this.visibleX_start; x<=this.visibleX_end; x++)
	        {			
                if (solModifierAfterCnds)
                {
                    this.runtime.pushCopySol(current_event.solModifiers);
                }
				
				idx = (y*this.col_num) + x;			
                this.exp_CellIndex = idx;	
				current_event.retrigger();

		        if (solModifierAfterCnds)
		        {
		            this.runtime.popSol(current_event.solModifiers);
		        }  
	        }
        }
    		
		return false;	  
	};	

	Cnds.prototype.ForEachMatchedCell = function (k_, cmp, v_)
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

	Cnds.prototype.IsOXOutOfBound = function (bound_type)
	{
	    if ((bound_type === 0) || (bound_type === 1))
	        return this.is_OX_out_bound(this.OX, bound_type);
	    else
		    return this.is_OX_out_bound(this.OX, 0) || this.is_OY_out_bound(this.OX, 1);
	}; 
	
	Cnds.prototype.OnOXOutOfBound = function (bound_type)
	{
	    if ((bound_type === 0) || (bound_type === 1))
	        return (this.bound_type === bound_type);
	    else
	        return true;
	}; 
    
	Cnds.prototype.PickInstsOnCell = function (line_index, objtype)
	{
	    if (!objtype)
	        return false;	    
		return this.pick_insts_on_cell(line_index, objtype);
	}; 	  

	Cnds.prototype.PickAllInstsOnCell = function (line_index)
	{
	    return this.pick_all_insts_on_cell(line_index);
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetOY = function (oy)
	{
	    this.set_OY(oy);
	};	
    Acts.prototype.SetOX = function (ox)
	{
	    this.set_OX(ox);
	};
    Acts.prototype.SetOXY = function (ox, oy)
	{
	    this.set_OX(ox);
	    this.set_OY(oy);        
	};    
    Acts.prototype.AddOY = function (dy)
	{
	    this.set_OY(this.OY + dy);
	};	
    Acts.prototype.AddOX = function (dx)
	{
	    this.set_OX(this.OX + dx);
	};	
    Acts.prototype.AddOXY = function (dx, dy)
	{
	    this.set_OX(this.OX + dx);
	    this.set_OY(this.OY + dy);        
	};		
    
    Acts.prototype.PinInstToCell = function (objs)
	{
        if ((!objs) || (this.exp_CellIndex == -1))
            return;
        
		var insts = objs.getCurrentSol().getObjects();
		var i, cnt=insts.length;
        for (i=0; i<cnt; i++)  
        {      
	        this.lines_mgr.AddInstToLine(this.exp_CellIndex, insts[i]);
	    }        
	};
    Acts.prototype.UnPinInst = function (objs)
	{
        if (!objs)
            return;
            
	    if (this.visibleY_start !== null)
	    {
		    var insts = objs.getCurrentSol().getObjects();
	        var i, j, cnt=insts.length, uid;
			for (i=0; i<cnt; i++)  
			{
			    uid = insts[i].uid;
	            for(j=this.visibleY_start; j<=this.visibleY_end; j++)
	                this.lines_mgr.RemoveInstFromLine(j, uid)
		    }
	    }  
	};    
    
    Acts.prototype.SetCellsCount = function (cnt)
	{
	    this.set_cells_count(cnt);
	};
    
    Acts.prototype.SetColumnNumber = function (col)
	{
	    this.set_col_num(col);
	};   
    
    Acts.prototype.SetGridSize = function (col, row)
	{
	    this.set_col_num(col, true);
	    this.set_cells_count(col*row);
	};  
		 
    Acts.prototype.SetOXYToCellIndex = function (cell_index)
	{
        var line_Yindex = Math.floor(cell_index/this.col_num);
        var line_Xindex = cell_index%this.col_num;
        
	    this.set_OX( -line_Xindex * this.default_cellWidth );        
	    this.set_OY( -line_Yindex * this.default_cellHeight );
	};	
    
    Acts.prototype.SetOXYByPercentage = function (percentage)
	{
		var last_line_index = this.get_page2Index(-1);
        var p1 = (last_line_index * this.default_cellHeight)*percentage;
        this.set_OY( -p1 );
	};			
    Acts.prototype.SetValue = function (cell_index, key_, value_)
	{
	    this.lines_mgr.SetCustomData(cell_index, key_, value_);
	};	
    Acts.prototype.CleanKeyInAllCell = function (key_)
	{
	    this.lines_mgr.SetCustomData(null, key_, null);
	};		
    Acts.prototype.InsertNewCells = function (cell_index, cnt)
	{
	    this.insert_cells(cell_index, cnt);
	};
	
    Acts.prototype.RemoveCells = function (cell_index, cnt)
	{
	    this.remove_cells(cell_index, cnt);
	};	
	
    Acts.prototype.InsertCells = function (cell_index, content)
	{
	    this.insert_cells(cell_index, content);
	};

    Acts.prototype.PushNewCells = function (where, cnt)
	{
	    var cell_index = (where==1)? 0: this.lines_mgr.GetLinesCount();
	    this.insert_cells(cell_index, cnt);
	};	
	
    Acts.prototype.PushCells = function (where, content)
	{
	    var cell_index = (where==1)? 0: this.lines_mgr.GetLinesCount();
	    this.insert_cells(cell_index, content);
	};	
	
    Acts.prototype.SetCellHeight = function (height)
	{
	    if (height <= 0)
		    return;
        var is_changed = (this.default_cellHeight != height);        
	    this.default_cellHeight = height;        
        this.update_flag = this.update_flag || is_changed;
	};	
    Acts.prototype.SetCellWidth = function (width)
	{
	    if (width <= 0)
		    return;
        var is_changed = (this.default_cellWidth != width);        
	    this.default_cellWidth = width;        
        this.update_flag = this.update_flag || is_changed;
	};		
    Acts.prototype.SetCellOffsetY = function (cell_index, offsety)
	{
        var line = this.lines_mgr.GetLine(cell_index);
        if (!line)
            return;
        var is_changed = (line.offsety != offsety);        
	    line.offsety = offsety;        
        this.update_flag = this.update_flag || is_changed;
	};	
	
    Acts.prototype.RefreshVisibleCells = function ()
	{
        this.update(true);
	};	
	
	Acts.prototype.PickInstsOnCell = function (cell_index, objtype)
	{
	    if (!objtype)
	        return;
		this.pick_insts_on_cell(cell_index, objtype);
	};

	Acts.prototype.PickAllInstsOnCell = function (cell_index)
	{
	    return this.pick_all_insts_on_cell(cell_index);
	};	 			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
    Exps.prototype.CellIndex = function (ret)
	{
		ret.set_int(this.exp_CellIndex);
	};	
    Exps.prototype.CellXIndex = function (ret)
	{
		ret.set_int(this.exp_CellIndex % this.col_num);
	};	
	
    Exps.prototype.CellYIndex = function (ret)
	{
		ret.set_int( Math.floor(this.exp_CellIndex / this.col_num) );
	};	    
	
    Exps.prototype.CellTLX = function (ret)
	{
		ret.set_float(this.exp_CellTLX);
	};	
    Exps.prototype.CellTLY = function (ret)
	{
		ret.set_float(this.exp_CellTLY);
	};
	
    Exps.prototype.UID2CellIndex = function (ret, uid)
	{   
	    var cell_index;
	    if (this.visibleY_start !== null)
	    {
	        var y, x, idx,find=false;
	        for(y=this.visibleY_start; y<=this.visibleY_end; y++)
	        {
			    for (x=this.visibleX_start; x<=this.visibleX_end; x++)
				{
				    idx = (y*this.col_num) + x;
				    find = this.lines_mgr.LineHasInst(idx, uid);
	                if (find)
	                {
  	                    cell_index = idx;
	                    break;
	                }
		        }
				
				if (find)
				    break;
	        }
	    }
	    if (cell_index == null)
	        cell_index = -1;
	        
		ret.set_int(cell_index);
	};			
	
    Exps.prototype.CellIndex2CellTLY = function (ret, cell_index)
	{ 
	    var line_YIndex = Math.floor(cell_index / this.col_num);
		ret.set_float(this.get_tlY(line_YIndex));
	};	
	
    Exps.prototype.CellIndex2CellTLX = function (ret, cell_index)
	{ 
	    var line_XIndex = Math.floor(cell_index % this.col_num);
		ret.set_float(this.get_tlX(line_XIndex));
	};		
	
    Exps.prototype.TotalCellsCount = function (ret)
	{ 
		ret.set_int(this.lines_mgr.GetLinesCount());
	};	
	
    Exps.prototype.DefaultCellHeight = function (ret)
	{ 
		ret.set_float(this.default_cellHeight);
	};			
	
    Exps.prototype.DefaultCellWidth = function (ret)
	{ 
		ret.set_float(this.default_cellWidth);
	};			
	
    Exps.prototype.TotalColumnsCount = function (ret)
	{ 
		ret.set_int(this.col_num);
	};		
	
    Exps.prototype.At = function (ret, index_, key_, default_value)
	{
	    var v = this.lines_mgr.GetCustomData(index_, key_);   
        if (v == null)       
            v = default_value || 0;        
            
		ret.set_any(v);
	};
	
    Exps.prototype.LastRemovedCells = function (ret)
	{
		ret.set_string(this.exp_LastRemovedLines);
	};	
	
    Exps.prototype.CustomDataInCells = function (ret, cell_index, cnt)
	{	    
	    var dataInLines = this.lines_mgr.GetCustomDataInLines(cell_index, cnt);
		ret.set_string(JSON.stringify( dataInLines ));
	};	
	
    Exps.prototype.OY = function (ret)
	{ 
		ret.set_float(this.OY);
	};	
		
    Exps.prototype.BottomOY = function (ret)
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
	
    Exps.prototype.OX = function (ret)
	{ 
		ret.set_float(this.OX);
	};	
    Exps.prototype.LeftOX = function (ret)
	{ 
		ret.set_float(0);
	};    
	
    Exps.prototype.RightOX = function (ret)
	{ 
		ret.set_float(-this.get_list_width());
	};     
    	
    Exps.prototype.CurCellIndex = function (ret)
	{
		ret.set_int(this.exp_CellIndex);
	};	
    Exps.prototype.CurCellXIndex = function (ret)
	{
		ret.set_int(this.exp_CellIndex % this.col_num);
	};	
	
    Exps.prototype.CurCellYIndex = function (ret)
	{
		ret.set_int( Math.floor(this.exp_CellIndex / this.col_num) );
	};	   

    Exps.prototype.TLVisibleCellXIndex = function (ret)
	{
        var x;
        if (this.is_vertical_scrolling)
            x = this.visibleX_start;
        else
            x = this.visibleY_start;
        
		ret.set_int(x || 0);
	};    

    Exps.prototype.TLVisibleCellYIndex = function (ret)
	{
        var y;
        if (this.is_vertical_scrolling)
            y = this.visibleY_start;
        else
            y = this.visibleX_start;
        
		ret.set_int(y || 0);
	};     

    Exps.prototype.BRVisibleCellXIndex = function (ret)
	{
        var x;
        if (this.is_vertical_scrolling)
            x = this.visibleX_end;
        else
            x = this.visibleY_end;
        
		ret.set_int(x || 0);
	};    

    Exps.prototype.BRVisibleCellYIndex = function (ret)
	{
        var y;
        if (this.is_vertical_scrolling)
            y = this.visibleY_end;
        else
            y = this.visibleX_end;
        
		ret.set_int(y || 0);
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
    cr.plugins_.Rex_GridCtrl.LinesMgrKlass = function(plugin)
    {
        this.plugin = plugin; 
        this.lines = [];      
    };
    var LinesMgrKlassProto = cr.plugins_.Rex_GridCtrl.LinesMgrKlass.prototype;  

	LinesMgrKlassProto.SetLinesCount = function(cnt)
	{
        if (this.lines.length > cnt)
        {
            var i,end=this.lines.length, line;
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
        else if (this.lines.length < cnt)
        {
            var i,start=this.lines.length;
            this.lines.length = cnt
            for(i=start; i<cnt; i++)
            {
                this.lines[i] = null;
            }
        }
	};
    
    LinesMgrKlassProto.GetLinesCount = function()
    {
        return this.lines.length;
    };

    LinesMgrKlassProto.IsInRange = function(line_index)
    {        
        return ((line_index >= 0) && (line_index < this.lines.length));
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
        if ((line_index >= this.lines.length) || (line_index < 0))
            return;
            
        if ((this.lines[line_index] == null) && (!dont_create_line_inst))
        {
            // TODO: allocate a line
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
		    var i, cnt= this.lines.length, line;
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
	    else if (line_index > this.lines.length)
	        line_index = this.lines.length;
	        	    
	    this.lines.length += cnt;
	    var start = this.lines.length - 1;
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
	    var end = this.lines.length -1;
	    for (i=start; i<=end; i++)
	    {
	        this.lines[i-cnt] = this.lines[i];
	    }
	    this.lines.length -= cnt;
	    
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
			
	LinesMgrKlassProto.saveToJSON = function ()
	{
	    var i,cnt=this.lines.length;
	    var save_lines = [], line, save_line;
	    for(i=0; i<cnt; i++)
	    {
	        line = this.lines[i];
	        save_line = (!line)? null : line.saveToJSON()
	        save_lines.push( save_line );
	    }
	    
		return { "lines": save_lines,		         
		       };
	};
	
	LinesMgrKlassProto.afterLoad = function (o)
	{	       
	    this.lines.length = 0;
	    
	    var save_lines = o["lines"], save_line;
	    var i,cnt=save_lines.length;
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
	};	
	// LinesMgr

    // Line
    var LineKlass = function(plugin)
    {     
        this.plugin = plugin; 
        this.pined_insts = {};      
        this.custom_data = {};
        
        this.tlx = 0;
        this.tly = 0;
        this.offsety = 0;           
    };
    var LineKlassProto = LineKlass.prototype;  

	LineKlassProto.Reset = function(plugin)
	{	   
        this.plugin = plugin;         
        this.tlx = 0;
        this.tly = 0;
        this.offsety = 0; 
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
		       };
	};
	
	LineKlassProto.afterLoad = function (o)
	{
		this.pined_insts = o["insts"];
		this.custom_data = o["data"];
		this.tlx = o["tlx"];
		this.tly = o["tly"];	
		this.offsety = o["offsety"];
	};	
	// Line
}());