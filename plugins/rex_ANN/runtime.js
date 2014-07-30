// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ANN = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ANN.prototype;
		
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
        this.ann = new cr.plugins_.Rex_ANN.ANNKlass(0,0,0);
	    this.ann.SetRate(this.properties[0]);  
	    this.ann.SetMoment(this.properties[1]); 
	    
	    var in_vars = this.properties[2]; 
	    if (in_vars != "")
	    {
	        if (in_vars.charAt(0) != "[")
	            in_vars = "["+in_vars+"]";        
	        this.ann.DefineInput(JSON.parse(in_vars));         
	    }
	    
	    this.ann.DefineHiddenNode(this.properties[3]); 
	    
	    var out_vars = this.properties[4]; 
	    if (out_vars != "")
	    {
	        if (out_vars.charAt(0) != "[")
	            out_vars = "["+out_vars+"]";        
	        this.ann.DefineOutput(JSON.parse(out_vars));         
	    }	     
	};

	instanceProto.saveToJSON = function ()
	{
		return { "ann": this.ann.saveToJSON(),
		          };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.ann.loadFromJSON(o["ann"]);
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.SetRateMoment = function (r, m)
	{
	    this.ann.SetRate(r);  
	    this.ann.SetMoment(m);           
	};
	
	Acts.prototype.DefineInput = function (names_)
	{
	    this.ann.DefineInput(names_);           
	};
	
	Acts.prototype.DefineOutput = function (names_)
	{
	    this.ann.DefineOutput(names_);                                  
	};	
	
	Acts.prototype.DefineHiddenNode = function (n)
	{
	    this.ann.DefineHiddenNode(n);                        
	};
	
	Acts.prototype.SetInput = function (name_, value_)
	{
	    this.ann.SetInput(name_, value_);    
	};	
	
	Acts.prototype.SetTarget = function (name_, value_)
	{    
	    this.ann.SetTarget(name_, value_);    	                                 
	};	
	
	Acts.prototype.Train = function ()
	{
	    this.ann.Train(); 	               
	};	
	
	Acts.prototype.Recall = function ()
	{   
	    this.ann.Recall(); 	                                  
	};	
	
	Acts.prototype.ResetWeight = function ()
	{   
	    this.ann.ResetWeight(); 	                                  
	};	
	
	Acts.prototype.JSONLoad = function (json_)
	{
		var o;
		
		try {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
		
		this.loadFromJSON(o);
	};
	
	
	var _dict2names = function (dict_objs)
	{
	    assert2(cr.plugins_.Dictionary, "[rex_ANN] Error:No Dictionary object found.");
        var dict_obj = dict_objs.getFirstPicked();
        var is_dict_inst = (dict_obj instanceof cr.plugins_.Dictionary.prototype.Instance);
        assert2(is_dict_inst, "[rex_ANN] Error: Need an dictionary object.");
        
        var d = dict_obj.dictionary, k;
        var names = [];
        for (k in d)
            names.push(k);
            
        return names;
	};
	Acts.prototype.DefineInputByDict = function (dict_objs)
	{
	    this.ann.DefineInput(_dict2names(dict_objs));           
	};
	
	Acts.prototype.DefineOutputByDict = function (dict_objs)
	{
	    this.ann.DefineOutput(_dict2names(dict_objs));                                  
	};			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Output = function (ret, var_name)
	{
		ret.set_float(this.ann.GetOutput(var_name));
	}; 
	
	Exps.prototype.TrainErr = function (ret)
	{
		ret.set_float(this.ann.TrainErr);
	};
	
	Exps.prototype.Input = function (ret, var_name)
	{
		ret.set_float(this.ann.GetInput(var_name));
	};	

	Exps.prototype.AsJSON = function (ret)
	{
		ret.set_string(JSON.stringify( this.saveToJSON() ));
	};
		  	   
}());

(function ()
{
    // reference http://programmermagazine.github.io/201404/book/pmag.html#%E4%BA%BA%E5%B7%A5%E7%A5%9E%E7%B6%93%E7%B6%B2%E8%B7%AF-artificial-neural-network-%E4%BD%9C%E8%80%85bridan
    // author: 陳鍾誠
    // reference http://arctrix.com/nas/python/bpnn.py
    
    cr.plugins_.Rex_ANN.ANNKlass = function(ni, nh, no)
    {
        this.in_name2index = {};
        this.hidden_node_count = 0;
        this.out_name2index = {};
        this.reset_flg = true;
        
        // number of input, hidden, and output nodes
        this.ni = ni + 1; // +1 for bias node
        this.nh = nh;
        this.no = no;
        
        // activations for nodes
        this.ai = ArrayFill(null, 1, this.ni);
        this.ah = ArrayFill(null, 1, this.nh);
        this.ao = ArrayFill(null, 1, this.no); 
        
        // create weights
        this.wi = MatrixFill(null, 0, this.ni, this.nh);
        this.wo = MatrixFill(null, 0, this.nh, this.no);
        
        // last change in weights for momentum
        this.ci = MatrixFill(null, 0, this.ni, this.nh);
        this.co = MatrixFill(null, 0, this.nh, this.no);  
        
        // target
        this._at = ArrayFill(null, 1, this.no);   
        
        this.rate = 0;
        this.moment = 0;
        this.TrainErr = 0;                
    };
    var ANNKlassProto = cr.plugins_.Rex_ANN.ANNKlass.prototype;
    
	ANNKlassProto.SetRate = function (r)
	{
	    this.rate = r;
	};    
	
	ANNKlassProto.SetMoment = function (m)
	{
	    this.moment = m;
	};
	
	ANNKlassProto.DefineInput = function (names_)
	{
	    this.reset_flg = true;
	    var k;
	    for (k in this.in_name2index)
	        delete this.in_name2index[k];
	    
	    var i, cnt=names_.length;
	    for (i=0; i<cnt; i++)
            this.in_name2index[names_[i]] = i;
        
        this.ni = cnt + 1;
        this.nh = (2*cnt) + 1;
	};

	ANNKlassProto.DefineOutput = function (names_)
	{
	    this.reset_flg = true;
	    var k;
	    for (k in this.out_name2index)
	        delete this.out_name2index[k];
	    
	    var i, cnt=names_.length;
	    for (i=0; i<cnt; i++)
            this.out_name2index[names_[i]] = i;     
            
        this.no = cnt;                    
	};
	
	ANNKlassProto.DefineHiddenNode = function (n)
	{
	    this.nh = n;
	};	
	
	ANNKlassProto.SetInput = function (name_, value_)
	{
	    if (this.reset_flg)
	        this.reset_nn();
	        	    
	   if (!this.in_name2index.hasOwnProperty(name_))
	       return;
	   
	   this.ai[this.in_name2index[name_]] = value_;
	};	
	
	ANNKlassProto.SetTarget = function (name_, value_)
	{  
	    if (this.reset_flg)
	        this.reset_nn(); 
	        
	   if (!this.out_name2index.hasOwnProperty(name_))
	       return;
	   
	   this._at[this.out_name2index[name_]] = value_;	                                            
	};
	
	ANNKlassProto.GetOutput = function (name_)
	{  
	   if (!this.out_name2index.hasOwnProperty(name_))
	       return 0;
	   
	   return this.ao[this.out_name2index[name_]];	                                            
	};	
	
	ANNKlassProto.GetInput = function (name_)
	{  
	   if (!this.in_name2index.hasOwnProperty(name_))
	       return 0;
	   
	   return this.ai[this.in_name2index[name_]];	                                            
	};	
	
	ANNKlassProto.ResetWeight = function ()
	{   
	    if (!this.reset_flg)
	        return;
	        
	    this.reset_nn(); 
	    this.reset_flg = false;	                             
	};	
	
	ANNKlassProto.Train = function ()
	{
	    this.ResetWeight();
	        
	    this.update();	 
	    this.TrainErr = this.back_propagate(this._at, this.rate, this.moment);             
	};	
	
	ANNKlassProto.Recall = function ()
	{   
	    this.ResetWeight();
	        
	    this.update();                                  
	};
	
	ANNKlassProto.reset_nn = function ()
	{  
        // activations for nodes
        this.ai = ArrayFill(this.ai, 1, this.ni);
        this.ah = ArrayFill(this.ah, 1, this.nh);
        this.ao = ArrayFill(this.ao, 1, this.no); 
        
        // create weights
        this.wi = MatrixFill(this.wi, 0, this.ni, this.nh);
        this.wo = MatrixFill(this.wo, 0, this.nh, this.no);  
        
        // set them to random vaules
        for (var i=0; i<this.ni; i++)
        {
            for (var j=0; j<this.nh; j++)
            {
                this.wi[i][j] = rand(-0.2, 0.2);
            }
        }
        for (var j=0; j<this.nh; j++)
        {
            for (var k=0; k<this.no; k++)
            {
                this.wo[j][k] = rand(-2.0, 2.0);        
            }
        }
        
        // last change in weights for momentum
        this.ci = MatrixFill(this.ci, 0, this.ni, this.nh);
        this.co = MatrixFill(this.co, 0, this.nh, this.no);  
                
        this._at = ArrayFill(this._at, 1, this.no);                                  
	};
	
	ANNKlassProto.update = function ()
	{   
	    var i,j,k,sum;
	    
        // hidden activations
        for (j=0; j<this.nh; j++) 
        {
            sum = 0;
            for (i=0; i<this.ni; i++)
            {
                sum = sum + this.ai[i] * this.wi[i][j];
            }
            this.ah[j] = sigmoid(sum);
        }
        
        // output activations
        for (k=0; k<this.no; k++) 
        {
            sum = 0;
            for (var j=0; j<this.nh; j++)
            {
                sum = sum + this.ah[j] * this.wo[j][k];
            }
            this.ao[k] = sigmoid(sum);
        }                                
	};	

    var output_deltas = [];
    var hidden_deltas = [];
    ANNKlassProto.back_propagate = function(targets, rate, moment) 
    {
        var i,j,k,error;
        // calculate error terms for output
        output_deltas.length = this.no;
        for (k=0; k<this.no; k++) 
        {
            error = targets[k] - this.ao[k];
            output_deltas[k] = dsigmoid(this.ao[k]) * error;
        }
    
        // calculate error terms for hidden
        hidden_deltas.length = this.nh;
        for (var j=0; j<this.nh; j++) 
        {
            error = 0;
            for (k=0; k<this.no; k++) 
            {
                error = error + output_deltas[k]*this.wo[j][k]; 
            }
            hidden_deltas[j] = dsigmoid(this.ah[j]) * error;
        }
            
        // update output weights
        var change;
        for (j=0; j<this.nh; j++) 
        {
            for (k=0; k<this.no; k++) 
            {
                change = output_deltas[k]*this.ah[j];
                this.wo[j][k] = this.wo[j][k] + rate*change + moment*this.co[j][k];
                this.co[j][k] = change;
            }
        }
    
        // update input weights
        for (i=0; i<this.ni; i++) 
        {
            for (j=0; j<this.nh; j++) 
            {
                change = hidden_deltas[j]*this.ai[i];
                this.wi[i][j] = this.wi[i][j] + rate*change + moment*this.ci[i][j];
                this.ci[i][j] = change;
            }
        }
    
        // calculate error
        error = 0.0;
        for (k=0; k<targets.length; k++)
        {
            error = error + 0.5*Math.pow(targets[k]-this.ao[k],2);
        }
        return error;
    };

    
	ANNKlassProto.saveToJSON = function ()
	{
		return { "in_name2index": this.in_name2index,
		         "hidden_node_count": this.hidden_node_count,
		         "out_name2index": this.out_name2index,
		         "reset_flg": this.reset_flg,
		         "ni": this.ni,
		         "nh": this.nh,
		         "no": this.no,
		         "ai": this.ai,
		         "ah": this.ah,
		         "ao": this.ao,
		         "wi": this.wi,
		         "wo": this.wo,
		         "ci": this.ci,
		         "co": this.co,
		         "_at": this._at,
                 "rate": this.rate,
                 "moment": this.moment,
                 "TrainErr": this.TrainErr,  
		          };
	};
	
	ANNKlassProto.loadFromJSON = function (o)
	{
        this.in_name2index = o["in_name2index"];
        this.hidden_node_count = o["hidden_node_count"];
        this.out_name2index = o["out_name2index"];
        this.reset_flg = o["reset_flg"];
        
        // number of input, hidden, and output nodes
        this.ni = o["ni"]; // +1 for bias node
        this.nh = o["nh"];
        this.no = o["no"];
        
        // activations for nodes
        this.ai = o["ai"];
        this.ah = o["ah"];
        this.ao = o["ao"]; 
        
        // create weights
        this.wi = o["wi"];
        this.wo = o["wo"];
        
        // last change in weights for momentum
        this.ci = o["ci"];
        this.co = o["co"];  
        
        // target
        this._at = o["_at"];   
        
        this.rate = o["rate"];   
        this.moment = o["moment"]; 
        this.TrainErr = o["TrainErr"];    
	};   
    	
    // rand()
    var rand=function(a, b) 
    {
        return (b-a)*Math.random() + a;
    };
    // sigmoid(x)=tanh(x)
    function sigmoid(x) 
    {
        var tanh = (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        return tanh;
    }
    // dsigmoid(x)=1-x^2;
    function dsigmoid(x) 
    {
        return 1.0 - x*x;
    }    
	var ArrayFill = function (arr, fill, size)
	{
	    if (arr == null)
	        arr = [];
	    if (size == null)
	        size = arr.length;
	    else
	        arr.length = size;

	    var i;
	    for (i=0; i<size; i++)
	        arr[i] = fill;
	    
	    return arr;
	};
	
    var MatrixFill=function(mat, fill, I, J) 
    {
        if (mat == null)
            mat = [];
        if (I == null)
            I = mat.length;
        else
            mat.length = I;
        
        var i;
        for (i=0; i<I; i++)
        {
            mat[i] = ArrayFill(mat[i], fill, J);
        }
        return mat;
    };	
}());   