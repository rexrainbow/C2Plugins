// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Fuzzy = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Fuzzy.prototype;
		
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
	    this.rule_bank = new cr.plugins_.Rex_Fuzzy.FRuleBank();
        this.exp_tool = new cr.plugins_.Rex_Fuzzy.FExp();
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
	instanceProto.rule_handler_gen = function (expression)
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
	
	instanceProto.saveToJSON = function ()
	{
		return { "rb": this.rule_bank.saveToJSON(),
		         "re": this.raw_exp_save,
		         "rm": this.raw_memship_save,
		          };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    // restore membership
	    this.raw_memship_save = o["rm"];
	    var i, cnt=this.raw_memship_save.length, raw_item;
	    var _cb = {"7": cr.plugins_.Rex_Fuzzy.prototype.acts.DefineMembership_7levles,
	               "5": cr.plugins_.Rex_Fuzzy.prototype.acts.DefineMembership_5levles,
	               "3": cr.plugins_.Rex_Fuzzy.prototype.acts.DefineMembership_3levles};	
	    for (i=0; i<cnt; i++)
	    {
	        raw_item = this.raw_memship_save[i];
	        _cb[raw_item[0]].apply(this, raw_item[1]);
	    }
	    
	    // restore expression
	    this.raw_exp_save=o["re"];
	    var i, cnt=this.raw_exp_save.length;
	    var add_rule = cr.plugins_.Rex_Fuzzy.prototype.acts.AddRule;
	    for (i=0; i<cnt; i++)
	        add_rule.call(this, this.raw_exp_save[i][0], this.raw_exp_save[i][1]);
	    	    
	    // restore output values in rule bank
        this.rule_bank.loadFromJSON(o["rb"]);
	};    

	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
	    this.rule_bank.getDebuggerValues(tprop);        
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		if (name.substring(0,2) == "I-") // set input variable
		{	 
		    var n = name.substring(2);  
		    this.rule_bank.set_variable_value(n, value);
		    this.rule_bank.execute();
	    }
	};
	/**END-PREVIEWONLY**/
		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
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
		this.rule_bank.add_variable(var_name, 
                                    _get_points(nb).reverse(), 
                                    _get_points(nm), 
                                    _get_points(ns), 
                                    _get_points(zo), 
                                    _get_points(ps), 
                                    _get_points(pm), 
                                    _get_points(pb));
	    this.raw_memship_save.push(["7", [var_name, nb, nm, ns, zo, ps, pm, pb]]);                                    
	};  
	Acts.prototype.DefineMembership_5levles = function (var_name, nb, ns, zo, ps, pb)
	{     
		this.rule_bank.add_variable(var_name, 
                                    null,
                                    _get_points(nb).reverse(),                                    
                                    _get_points(ns), 
                                    _get_points(zo), 
                                    _get_points(ps), 
                                    _get_points(pb),
                                    null);
	    this.raw_memship_save.push(["5", [var_name, nb, ns, zo, ps, pb]]);                                    
	};      
	Acts.prototype.DefineMembership_3levles = function (var_name, nb, zo, pb)
	{     
		this.rule_bank.add_variable(var_name, 
                                    null,
                                    null,
                                    _get_points(nb).reverse(),
                                    _get_points(zo), 
                                    _get_points(pb),
                                    null,
                                    null );
	    this.raw_memship_save.push(["3", [var_name, nb, zo, pb]]);                                    
	}; 
	Acts.prototype.AddRule = function (rule, expression)
	{	    
        var handler = this.rule_handler_gen(expression);
        assert2(handler, "Fuzzy: can not parse exp " + expression + "  Error= " + this.err);
		this.rule_bank.add_rule(rule, handler);
        this.raw_exp_save.push([rule, expression]);		
	};  
    
	Acts.prototype.SetVarValue = function (var_name, value)
	{
		this.rule_bank.set_variable_value(var_name, value);
	};     
    
	Acts.prototype.ExecuteRules = function ()
	{
		this.rule_bank.execute();
	};    
	
 	Acts.prototype.CleanAllRules = function ()
	{	    
		this.rule_bank.clean_rule();
		this.raw_exp_save.length = 0;   		   	
	};   	 
    
    var tmp_raw_exp_save = [];
 	Acts.prototype.CleanRule = function (r)
	{	    
		this.rule_bank.clean_rule(r);
			    
		cr.shallowAssignArray(tmp_raw_exp_save, this.raw_exp_save);
	    this.raw_exp_save.length = 0;
	    var i,cnt=tmp_raw_exp_save.length;
	    for(i=0; i<cnt; i++)
	    {
	        if (tmp_raw_exp_save[i][0] != r)
	            this.raw_exp_save.push(tmp_raw_exp_save[i]);
	    }
	    tmp_raw_exp_save.length = 0;   	
		   	
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.OutputGrade = function (ret, var_name)
	{
		ret.set_float(this.rule_bank.output_get(var_name));
	}; 
	
	Exps.prototype.InputGrade = function (ret, var_name)
	{
        var name_grade = name_grade_split(var_name);
		ret.set_float(this.rule_bank.input_grade_get(name_grade.name, name_grade.grade));
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
	    var name, rules = this.rule_bank.rules;
	    var max_grade = -1, max_name = "", grade;
	    for (name in rules)
	    {
            grade = rules[name][0];
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
        var max_membership = this.rule_bank.in_vars[var_name].get_max_membership();
		ret.set_string(max_membership);
	}; 	   
}());

(function ()
{
    cr.plugins_.Rex_Fuzzy.FRuleBank = function()
    {
        this.rules = {};
        this.in_vars = {};
        this.rules_order = [];
        this.exps = new cr.plugins_.Rex_Fuzzy.FExp(this.in_vars);       
    };
    var FRuleBankProto = cr.plugins_.Rex_Fuzzy.FRuleBank.prototype;
    
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
    
        
    cr.plugins_.Rex_Fuzzy.FExp = function(in_vars)
    {
        this["i"] = in_vars;
    };
    var FExpProto = cr.plugins_.Rex_Fuzzy.FExp.prototype;
    
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