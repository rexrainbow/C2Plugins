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
	};
    var has_string = function(main, sub)
    {
        return (main.indexOf(sub) != (-1));
    };
	var exp_grade_gen = function (expression)
	{              
        if (has_string(expression, "AND") ||
            has_string(expression, "OR")  ||
            has_string(expression, "NOT") )
            return expression;
            
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
        expression = 'exp["grade"]("'+name+'", "'+grade+'")';
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
	}; 
	Acts.prototype.AddRule = function (rule, expression)
	{
        var handler = this.rule_handler_gen(expression);
        assert2(handler, "Fuzzy: can not parse exp " + expression + "  Error= " + this.err);
		this.rule_bank.add_rule(rule, handler);
	};  
    
	Acts.prototype.SetVarValue = function (var_name, value)
	{
		this.rule_bank.set_variable_value(var_name, value);
	};     
    
	Acts.prototype.ExecuteRules = function ()
	{
		this.rule_bank.execute();
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.OutputGrade = function (ret, var_name)
	{
        var grade_out, rule = this.rule_bank.rules[var_name];
        if (rule == null)
            grade_out = 0;
        else
            grade_out = rule[0];
		ret.set_float(grade_out);
	}; 
	
	Exps.prototype.InputGrade = function (ret, var_name)
	{
        var max_membership = this.rule_bank.in_vars[var_name].get_max_membership();
		ret.set_string(max_membership);
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
    
	Exps.prototype.OR = function (ret, expA, expB)
	{    
        // number
        if (typeof(expA) == "number")
        {
            var args = Array.prototype.slice.call(arguments,1);
            ret.set_float(this.exp_tool["OR"].apply(args));
            return;
        }
        
        // string: expression        
        var i, exp, cnt = arguments.length;
        var code_string = 'exp["OR"](';
        for (i=1; i<cnt; i++)
        {
            exp = arguments[i];
            exp = exp_grade_gen(exp);
            code_string += exp;
             if (i != (cnt-1))
                code_string += ",";
        }
        code_string += ')';
		ret.set_string(code_string);
	};   
	
	Exps.prototype.AND = function (ret, expA, expB)
	{
        // number
        if (typeof(expA) == "number")
        {
            var args = Array.prototype.slice.call(arguments,1);
            ret.set_float(this.exp_tool["AND"].apply(this.exp_tool["AND"], args));
            return;
        }
        
        // string: expression            
        var i, exp, cnt = arguments.length;
        var code_string = 'exp["AND"](';
        for (i=1; i<cnt; i++)
        {
            exp = arguments[i];
            exp = exp_grade_gen(exp);
            code_string += exp;
            if (i != (cnt-1))
                code_string += ",";
        }
        code_string += ')';
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
	   
}());

(function ()
{
    cr.plugins_.Rex_Fuzzy.FRuleBank = function()
    {
        this.rules = {};
        this.in_vars = {};
        this.exps = new cr.plugins_.Rex_Fuzzy.FExp(this.in_vars);
    };
    var FRuleBankProto = cr.plugins_.Rex_Fuzzy.FRuleBank.prototype;
    
    FRuleBankProto.add_variable = function (var_name, nb, nm, ns, zo, ps, pm, pb)
    {
        this.in_vars[var_name] = new FMembership(nb, nm, ns, zo, ps, pm, pb);
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
	}; 
    
    FRuleBankProto.set_variable_value = function (var_name, value)
    {    
        this.in_vars[var_name].value = value;
    };    
    
    FRuleBankProto.execute = function ()
    {
        var name, item, i, cnt, value;
        for (name in this.rules)
        {
            item = this.rules[name];
            value = -1;
            cnt = item.length;
            for (i=1; i<cnt; i++)
                value = Math.max(value, item[i](this.exps));
            item[0] = value;
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