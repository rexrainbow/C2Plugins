// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_canvas_chart_radar = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_canvas_chart_radar.prototype;
		
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
	    this.options = { // scaleOverlay
		                 "scaleOverlay": (this.properties[0] === 1),
		                 // scaleOverride
						 "scaleOverride": (this.properties[1] === 1),
						 "scaleSteps": (this.properties[1] === 1)? this.properties[2]:null,
						 "scaleStepWidth": (this.properties[1] === 1)? this.properties[3]:null,
						 "scaleStartValue": (this.properties[1] === 1)? this.properties[4]:null,	
                         // scale line
		                 "scaleShowLine": (this.properties[5] === 1),
		                 "scaleLineColor": this.properties[6],
		                 "scaleLineWidth": this.properties[7],
						 // scale labels
		                 "scaleShowLabels": (this.properties[8] === 1),
						 "scaleLabel" : this.properties[9],
						 "scaleFontFamily" : this.properties[10],
						 "scaleFontSize" : this.properties[11],
						 "scaleFontStyle" : get_font_style(this.properties[12]),
						 "scaleFontColor" : this.properties[13],
						 "scaleShowLabelBackdrop" : (this.properties[14] === 1),
						 // scale backdrop
						 "scaleBackdropColor": this.properties[15],
						 "scaleBackdropPaddingX" : this.properties[16],
						 "scaleBackdropPaddingY" : this.properties[17],
						 // angle line
						 "angleShowLineOut" : (this.properties[18] === 1),
						 "angleLineColor" : this.properties[19],
						 "angleLineWidth" : this.properties[20],
						 // point label
						 "pointLabelFontFamily" : this.properties[21],
						 "pointLabelFontSize" : this.properties[22],
						 "pointLabelFontStyle" : get_font_style(this.properties[23]),
						 "pointLabelFontColor" : this.properties[24],
						 // point dot
						 "pointDot" : (this.properties[25] === 1),
						 "pointDotRadius" : this.properties[26],
						 "pointDotStrokeWidth" : this.properties[27],
						 // dataset
						 "datasetStroke" : (this.properties[28] === 1),
						 "datasetStrokeWidth" : this.properties[29],
						 "datasetFill" : (this.properties[30] === 1),						 						
		                 "animation" : false
		};

	    this.labels = [];
	    this.datasets = [];
	    this.datasets_color = [];
	    this.data = {};
	};  
	
	var get_font_style = function(style)
	{
	    return (style == 0)? "normal":
		       (style == 1)? "bold":
			                 "bolder";
	}
	
	behinstProto.tick = function ()
	{
	};
	behinstProto.get_data = function (label_name, dataset_name)
	{
	    if (!this.data.hasOwnProperty(label_name))
	        return 0;
	    var col = this.data[label_name];
	    if (!col.hasOwnProperty(dataset_name))
	        return 0; 
	    return col[dataset_name];
	};
	behinstProto.plot = function(data)
	{
	    if (this.inst.extra.chartjs == null)
		    this.inst.extra.chartjs = new window["Chart"](this.inst.ctx);
	    this.inst.extra.chartjs["Radar"](data, this.options);
	    this.inst.runtime.redraw = true;  
	    this.inst.update_tex = true;  	        
	};  	

	var hashtable_clean = function(o)
	{
	    var k;
		for (k in o)
		    delete o[k];
	}
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
//	Cnds.prototype.OnFinished = function ()
//	{        
//		return this.is_my_call;
//	};
//	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	var datasets = [];
	Acts.prototype.PlotChart = function()
	{
	    datasets.length = 0;
	    var i, cnti=this.datasets.length;
	    var j, cntj=this.labels.length;
	    var dataset_name;
	    for (i=0; i<cnti; i++)
	    {
	        dataset_name = this.datasets[i]; 
	        var data = [];
	        for (j=0; j<cntj; j++)
	            data.push(this.get_data(this.labels[j], this.datasets[i]));
	            
	        datasets.push({"fillColor": this.datasets_color[i][0],
	                       "strokeColor" : this.datasets_color[i][1],
        			       "pointColor" : this.datasets_color[i][2],
        			       "pointStrokeColor" : this.datasets_color[i][3],
	                       "data" : data
	                       });
	    }
        var data = {
        	"labels" : this.labels,
        	"datasets" : datasets
        }
	    this.plot(data);
	}; 
	Acts.prototype.Addlabel = function(label_name)
	{   
	    this.labels.push(label_name);
	}; 	
	Acts.prototype.AddDataSetCfg = function(dataset_name, fill_color, stroke_color, point_color, point_stroke_color)
	{
	    this.datasets.push(dataset_name);	    
	    this.datasets_color.push([fill_color, stroke_color, point_color, point_stroke_color]);
	}; 	
	Acts.prototype.SetData = function(label_name, dataset_name, value)
	{
	    if (!this.data.hasOwnProperty(label_name))
	        this.data[label_name] = {};
	    var col = this.data[label_name];
	    if (!col.hasOwnProperty(dataset_name))
	        col[dataset_name] = {};	    
	    col[dataset_name] = value;
	};
	Acts.prototype.CleanLabels = function()
	{
	    this.labels.length = 0;
	    this.datasets.length = 0;
		this.datasets_color.length = 0;		
		hashtable_clean(this.data);
	}; 
	Acts.prototype.CleanDatasets = function()
	{
	    this.datasets.length = 0;
		this.datasets_color.length = 0;
		hashtable_clean(this.data);
	}; 	
	Acts.prototype.CleanData = function()
	{
		hashtable_clean(this.data);
	}; 		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.StartAngle = function (ret, label_name, dataset_name)
	{       
	    ret.set_float(this.get_data(label_name, dataset_name));
	};
	
}());