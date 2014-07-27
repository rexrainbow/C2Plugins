// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_bFuzzy = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_bFuzzy.prototype;
		
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
	    this.rule_bank = new cr.behaviors.Rex_bFuzzy.FRuleBank();
        this.exp_tool = new cr.behaviors.Rex_bFuzzy.FExp();
        this.err = null;
        this.raw_exp_save = [];  
        this.raw_memship_save = [];	    
	};
	
    var has_string = function(main, sub)
    {
        return (main.indexOf(sub) != (-1));
    };    
    var _name_grade_ret = {name:"",grade:""};
    var name_grade_split = function (expression)
    {
        // is a grade expression
        var name, grade;
        if (has_string(expression, "+++") ||
            has_string(expression, "---"))
        {
            name = expression.substring(3);
            grade = expression.substring(0,3);   
        }
        else if (has_string(expression, "++") ||
            has_string(expression, "--"))
        {
            name = expression.substring(2);
            grade = expression.substring(0,2);   
        }   
        else if (has_string(expression, "+") ||
            has_string(expression, "-"))
        {
            name = expression.substring(1);
            grade = expression.substring(0,1);   
        }           
        else
        {
            name = expression;
            grade = "";
        }   
        _name_grade_ret.name = name;
        _name_grade_ret.grade = grade;
        return _name_grade_ret;
    };
	var exp_grade_gen = function (expression)
	{              
        if (has_string(expression, "AND") ||
            has_string(expression, "OR")  ||
            has_string(expression, "NOT") )
            return expression;
            
        // is a grade expression
        var name_grade = name_grade_split(expression);    
        expression = 'exp["grade"]("'+name_grade.name+'", "'+name_grade.grade+'")';
        return expression;
	};     
	behtypeProto.rule_handler_gen = function (expression)
	{    
        expression = exp_grade_gen(expression);    
        var handler;
        var code_string = "function(exp){\n return "+expression +";\n}";
        try
        {
            handler = eval("("+code_string+")");
        }
        catch(err)
        {
            handler = null;
            this.err = err;
        }
        return handler;
	}; 
	
	behtypeProto.saveToJSON = function ()
	{
		return { "rb": this.rule_bank.saveToJSON(),
		         "re": this.raw_exp_save,
		         "rm": this.raw_memship_save,
		          };
	};	
	

	behtypeProto.loadFromJSON = function (o)
	{
	    // restore membership
	    this.raw_memship_save = o["rm"];
	    var i, cnt=this.raw_memship_save.length, raw_item;

		var _cb = {"7": cr.behaviors.Rex_bFuzzy.prototype.acts.DefineMembership_7levles,
	               "5": cr.behaviors.Rex_bFuzzy.prototype.acts.DefineMembership_5levles,
	               "3": cr.behaviors.Rex_bFuzzy.prototype.acts.DefineMembership_3levles};
	    for (i=0; i<cnt; i++)
	    {
	        raw_item = this.raw_memship_save[i];
	        _cb[raw_item[0]].apply(this, raw_item[1]);
	    }
	    
	    // restore expression
	    this.raw_exp_save=o["re"];
	    var i, cnt=this.raw_exp_save.length;
	    var add_rule = cr.behaviors.Rex_bFuzzy.prototype.acts.AddRule;
	    for (i=0; i<cnt; i++)
	        add_rule.call(this, this.raw_exp_save[i][0], this.raw_exp_save[i][1]);
	    	    
	    // restore output values in rule bank
        this.rule_bank.loadFromJSON(o["rb"]);
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
	    this.in_vars = {};
	    this.out_vars = {};	    
	};

	behinstProto.tick = function ()
	{
	};
		
    var _save_flag = null;
	behinstProto.saveToJSON = function ()
	{
	    var type_save = null;
	    if (_save_flag != this.runtime.tickcount)
	    {
	        type_save = this.type.saveToJSON();
	        _save_flag = this.runtime.tickcount;
	    }
	           	    
		return { "t" : type_save,
		         "iv": this.in_vars,
		         "ov": this.out_vars };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    if (o["t"] != null)
	        this.type.loadFromJSON(o["t"]);
	        
	    this.in_vars = o["iv"];
	    this.out_vars = o["ov"];
	};

	/**BEGIN-PREVIEWONLY**/
	var _p = [];
	behinstProto.getDebuggerValues = function (propsections)
	{
	    _p.length = 0;
	    var n;
	    for (n in this.in_vars)
	    {
	        _p.push({"name": "I-"+n, "value": this.in_vars[n]});
	    }
	    var ri, rules_order=this.type.rules_order, rcnt=rules_order.length;
	    for (ri=0; ri<rcnt; ri++)
	    {
	        _p.push({"name": "O-"+rules_order[ri], "value": this.out_vars[rules_order[ri]]});
	    }	    
	          
		propsections.push({
			"title": this.type.name,
			"properties": _p
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		if (name.substring(0,2) == "I-") // set input variable
		{	 
		    var n = name.substring(2);  
		    this.type.rule_bank.set_variable_value(n, value);
		    this.type.rule_bank.execute();
	    }
	};
	/**END-PREVIEWONLY**/
		
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
    var _get_points = function (list_string)
    {
        if (list_string == null)
            return null;
        var points = JSON.parse("["+list_string+"]");
        if (points.length>3)
            points.length = 3;
        return points;
    };    
	Acts.prototype.DefineMembership_7levles = function (var_name, nb, nm, ns, zo, ps, pm, pb)
	{
		this.type.rule_bank.add_variable(var_name, 
                                         _get_points(nb).reverse(), 
                                         _get_points(nm), 
                                         _get_points(ns), 
                                         _get_points(zo), 
                                         _get_points(ps), 
                                         _get_points(pm), 
                                         _get_points(pb));
	    this.type.raw_memship_save.push(["7", [var_name, nb, nm, ns, zo, ps, pm, pb]]);                                    
	};
	Acts.prototype.DefineMembership_5levles = function (var_name, nb, ns, zo, ps, pb)
	{     
		this.type.rule_bank.add_variable(var_name, 
                                         null,
                                         _get_points(nb).reverse(),                                    
                                         _get_points(ns), 
                                         _get_points(zo), 
                                         _get_points(ps), 
                                         _get_points(pb),
                                         null);
	    this.type.raw_memship_save.push(["5", [var_name, nb, ns, zo, ps, pb]]);                                    
	};      
	Acts.prototype.DefineMembership_3levles = function (var_name, nb, zo, pb)
	{     
		this.type.rule_bank.add_variable(var_name, 
                                         null,
                                         null,
                                         _get_points(nb).reverse(),
                                         _get_points(zo), 
                                         _get_points(pb),
                                         null,
                                         null );
	    this.type.raw_memship_save.push(["3", [var_name, nb, zo, pb]]);                                    
	}; 
	Acts.prototype.AddRule = function (rule, expression)
	{	    
        var handler = this.type.rule_handler_gen(expression);
        assert2(handler, "Fuzzy: can not parse exp " + expression + "  Error= " + this.type.err);
		this.type.rule_bank.add_rule(rule, handler);
        this.type.raw_exp_save.push([rule, expression]);		
	};  
    
	Acts.prototype.SetVarValue = function (var_name, value)
	{
	    this.in_vars[var_name] = value;
		//this.rule_bank.set_variable_value(var_name, value);
	};     
    
	Acts.prototype.ExecuteRules = function ()
	{
	    var rule_bank = this.type.rule_bank;
	    var n;
	    
	    // push in_vars
	    for (n in this.in_vars)
	    {
	        rule_bank.set_variable_value(n, this.in_vars[n]);
	    }
	        	    
	    // execute rules
		rule_bank.execute();
		
		// get out_vars
		var rules = rule_bank.rules;
		for (n in rules)
		{
		    this.out_vars[n] = rule_bank.output_get(n);
		}
	};    
	
 	Acts.prototype.CleanAllRules = function ()
	{	    
		this.type.rule_bank.clean_rule();
		this.type.raw_exp_save.length = 0;   		   	
	};
    
    var tmp_raw_exp_save = [];
 	Acts.prototype.CleanRule = function (r)
	{	    
		this.type.rule_bank.clean_rule(r);
			    
		cr.shallowAssignArray(tmp_raw_exp_save, this.type.raw_exp_save);
	    this.type.raw_exp_save.length = 0;
	    var i,cnt=tmp_raw_exp_save.length;
	    for(i=0; i<cnt; i++)
	    {
	        if (tmp_raw_exp_save[i][0] != r)
	            this.type.raw_exp_save.push(tmp_raw_exp_save[i]);
	    }
	    tmp_raw_exp_save.length = 0;   	
		   	
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.OutputGrade = function (ret, var_name)
	{
	    var out_value = this.out_vars[var_name];
	    if (out_value == null)
	        out_value = 0;
		ret.set_float(out_value);
	}; 
	
	Exps.prototype.InputGrade = function (ret, var_name)
	{
	    var rule_bank = this.rule_bank;
	    
	    // overwrite in_vars
        rule_bank.set_variable_value(var_name, this.in_vars[var_name]);	 
           
        var name_grade = name_grade_split(var_name);
		ret.set_float(rule_bank.input_grade_get(name_grade.name, name_grade.grade));
	};     
	
	Exps.prototype.NOT = function (ret, expA)
	{
        // number
        if (typeof(expA) == "number")
        {
            ret.set_float(this.exp_tool["NOT"](expA));
            return;
        }
        
        // string: expression
        expA = exp_grade_gen(expA);
        var code_string = 'exp["NOT"]('+expA+')';
		ret.set_string(code_string);        
	}; 
    
    var pre_filt = [];
	Exps.prototype.OR = function (ret, expA, expB)
	{    
        // number
        if (typeof(expA) == "number")
        {
            var args = Array.prototype.slice.call(arguments,1);
            ret.set_float(this.exp_tool["OR"].apply(this.exp_tool, args));
            return;
        }
        
        // string: expression        
        var i, exp, cnt = arguments.length;
        pre_filt.length = 0;
        for (i=1; i<cnt; i++)
        {
            exp = arguments[i];
            if (exp == "")    // ignored ""
                continue;
            exp = exp_grade_gen(exp);
            pre_filt.push(exp);
        }
        if ( pre_filt.length == 0) // no valid item, ignore this expresion
        {
            ret.set_string("");
            return;
        }
        
        var code_string = 'exp["OR"]('+ pre_filt.join(",")+')';
        pre_filt.length = 0;
		ret.set_string(code_string);
	};   
	
	Exps.prototype.AND = function (ret, expA, expB)
	{
        // number
        if (typeof(expA) == "number")
        {
            var args = Array.prototype.slice.call(arguments,1);
            ret.set_float(this.exp_tool["AND"].apply(this.exp_tool, args));
            return;
        }
        
        // string: expression        
        var i, exp, cnt = arguments.length;
        pre_filt.length = 0;
        for (i=1; i<cnt; i++)
        {
            exp = arguments[i];
            if (exp == "")    // ignored ""
                continue;
            exp = exp_grade_gen(exp);
            pre_filt.push(exp);
        }
        if ( pre_filt.length == 0) // no valid item, ignore this expresion
        {
            ret.set_string("");
            return;
        }
        
        var code_string = 'exp["AND"]('+ pre_filt.join(",")+')';
        pre_filt.length = 0;
		ret.set_string(code_string);
	};  
	
	Exps.prototype.MaxOutput = function (ret)
	{
	    var name;
	    var max_grade = -1, max_name = "", grade;
	    for (name in this.out_vars)
	    {
            grade = this.out_vars[name];
	        if (max_grade < grade)
            {
	            max_name = name;
                max_grade = grade;
            }
	    }
		ret.set_string(max_name);
	}; 
	
	Exps.prototype.MaxInputMembership = function (ret, var_name)
	{
	    var rule_bank = this.rule_bank;
	    
	    // overwrite in_vars
        rule_bank.set_variable_value(var_name, this.in_vars[var_name]);	 
        	    
        var max_membership = rule_bank.in_vars[var_name].get_max_membership();
		ret.set_string(max_membership);
	}; 	   
}());

(function ()
{
    cr.behaviors.Rex_bFuzzy.FRuleBank = function()
    {
        this.rules = {};
        this.in_vars = {};
        this.rules_order = [];
        this.exps = new cr.behaviors.Rex_bFuzzy.FExp(this.in_vars);       
    };
    var FRuleBankProto = cr.behaviors.Rex_bFuzzy.FRuleBank.prototype;
    
    FRuleBankProto.add_variable = function (var_name, nb, nm, ns, zo, ps, pm, pb)
    {
        this.in_vars[var_name] = new FMembership(nb, nm, ns, zo, ps, pm, pb);
    };
    FRuleBankProto.input_grade_get = function (name, grade)
    {
        return this.exps["grade"](name, grade);
    };    
	FRuleBankProto.output_get = function (name)
	{
        var rule = this.rules[name];
        if (rule == null)
            return 0;

		return rule[0];
	};     
    
	FRuleBankProto.add_rule = function (rule_name, handler)
	{    
        var rule = this.rules[rule_name];
        if (rule == null)
        {
            rule = [0];
            this.rules[rule_name] = rule;
        }
        rule.push(handler);
        
        if (this.rules_order[ this.rules_order.length-1 ] != rule_name)
        {
            cr.arrayFindRemove(this.rules_order, rule_name);
            this.rules_order.push(rule_name);
        }
        
	}; 
	FRuleBankProto.clean_rule = function (r)
	{    
	    if (r == null)
        {            
            // clean all
            var k;
            for (k in this.rules)
                delete this.rules[k];
            this.rules_order.length = 0;
        }
        else
        {
            if (this.rules.hasOwnProperty(r))
                delete this.rules[r];     
            cr.arrayFindRemove(this.rules_order, r);
        }
	};     
    
    FRuleBankProto.set_variable_value = function (var_name, value)
    {   
        if (!this.in_vars.hasOwnProperty(var_name))
            return;

        this.in_vars[var_name].value = value;
    };    
    
    FRuleBankProto.execute = function ()
    {
        var ri, rcnt=this.rules_order.length;
        var name, item, value, i, icnt;
        for (ri=0; ri<rcnt; ri++)
        {
            name = this.rules_order[ri];
            item = this.rules[name];
            value = -1;
            icnt = item.length;
            for (i=1; i<icnt; i++)
                value = Math.max(value, item[i](this.exps));
            item[0] = value;
            this.set_variable_value(name, value);
        }
    }; 
	
	FRuleBankProto.saveToJSON = function ()
	{
        var name, cur_outputs = {};
        for (name in this.rules)
            cur_outputs[name] = this.rules[name][0];
		return {"o":cur_outputs
		       };
	};
	
	FRuleBankProto.loadFromJSON = function (o)
	{
        var name, cur_outputs=o["o"];
        for (name in this.rules)
            this.rules[name][0] = cur_outputs[name];
	}; 
	
	FRuleBankProto.getDebuggerValues = function (propsections)
	{
	    var n;
	    for (n in this.in_vars)
	    {
	        propsections.push({"name": "I-"+n, "value": this.in_vars[n].value});
	    }
	    var ri, rcnt=this.rules_order.length;
	    for (ri=0; ri<rcnt; ri++)
	    {
	        propsections.push({"name": "O-"+this.rules_order[ri], "value": this.rules[this.rules_order[ri]][0]});
	    }
	}; 	
    
        
    cr.behaviors.Rex_bFuzzy.FExp = function(in_vars)
    {
        this["i"] = in_vars;
    };
    var FExpProto = cr.behaviors.Rex_bFuzzy.FExp.prototype;
    
    FExpProto["NOT"] = function(a)
    {
        return (1 - a);
    };
    
    FExpProto["AND"] = function()
    {
        return Math.min.apply( Math, arguments);
    };  

    FExpProto["OR"] = function()
    {
        return Math.max.apply( Math, arguments);
    }; 
    
    FExpProto["grade"] = function(name, grade)
    {
        var m = this["i"][name];
        assert2(m, "Fuzzy: can not get grade of " + name);        
        return m.get_grade(grade);
    }; 
    

    var FMembership = function(nb, nm, ns, zo, ps, pm, pb)
    {
        this._membership_cb = {"---":new FGrade(nb),
                               "--": new FGrade(nm),
                               "-":  new FGrade(ns),
                               "":   new FGrade(zo),
                               "+":  new FGrade(ps),
                               "++": new FGrade(pm),
                               "+++":new FGrade(pb), };
        this.value = 0;        
    };
    var FMembershipProto = FMembership.prototype;    
    
    FMembershipProto.get_grade = function(membership)
    {
        return this._membership_cb[membership].get_grade(this.value);
    }; 
    
    FMembershipProto.get_max_membership = function()
    {
        var max_grade = -1;
        var grade, membership, max_membership;
        for (membership in this._membership_cb)
        {
            grade = this._membership_cb[membership].get_grade(this.value);
            if (grade == null)
                continue;
            else if (grade > max_grade)
            {             
                max_grade = grade;
                max_membership = membership;
            }
        }
        return max_membership;
    };      
    
    var FGrade = function(points)
    {
        if (points == null)
        {
            this._get_grade = null;
            this.points = null;
            return;
        }
        this._get_grade = {2:this.get_2p_grade,
                           3:this.get_3p_grade,
                           4:this.get_4p_grade}[points.length];
        this.points = points;
        this.grade = 0;
    };
    var FGradeProto = FGrade.prototype;    
    
    FGradeProto.get_4p_grade = function(x)
    {
        var p0=this.points[0],  p1=this.points[1], p2=this.points[2], p3=this.points[3];
        
        if ((x>=p1) && (x<=p2))
            return 1;
        else if ((x<=p0) || (x>=p3))
            return 0;
        else if (x<p1)
            return (x-p0)/(p1-p0);
        else // if (x>p2)
            return (p3-x)/(p3-p2);
    }; 
    
    FGradeProto.get_3p_grade = function(x)
    {
        var p0=this.points[0], p1=this.points[1], p2=this.points[2];
        
        if (x==p1)
            return 1;
        else if ((x<p0) || (x>p2))
            return 0;
        else if (x<p1)
            return (x-p0)/(p1-p0);
        else // if (x>p1)
            return (p2-x)/(p2-p1);    
    }; 
    
    FGradeProto.get_2p_grade = function(x)
    {
        var p0=this.points[0], p1=this.points[1];
        
        if (p0 < p1)
        {
            if (x<=p0)
                return 0;
            else if (x>=p1)
                return 1;
            else
                return (x-p0)/(p1-p0);
               
        }
        else
        {
            if (x<=p1)
                return 1;
            else if (x>=p0)
                return 0;   
            else
                return (x-p0)/(p1-p0);        
        }
    }; 
    
    FGradeProto.get_grade = function(x)
    {
        if (x== null)
            return this.grade;
            
        if (this._get_grade == null)
            this.grade = null;
        else
            this.grade = this._get_grade(x);
        return this.grade;
    }; 
}());   