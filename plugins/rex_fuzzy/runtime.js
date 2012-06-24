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
	};
   
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
    var _get_points = function (list_string)
    {
        if (list_string == null)
            return null;
        var points = JSON.parse("["+list_string+"]");
        if (points.length>3)
            points.length = 3;
        return points;
    };    
	acts.DefineMembership = function (var_name, nb, nm, ns, zo, ps, pm, pb)
	{     
		this.rule_bank.add_variable(var_name, _get_points(nb).reverse(), _get_points(nm), _get_points(ns), 
                                    _get_points(zo), _get_points(ps), _get_points(pm), _get_points(pb));
	};  
    
    var membership_map = ["nb", "nm", "ns", "zo", "ps", "pm", "pb"];
	acts.AddMembershipCond = function (cond_name, var_name, membership)
	{
		this.rule_bank.add_membership_cond(cond_name, var_name, membership_map[membership]);
	};  
    
	acts.AddInvertCond = function (cond_name, cond_from)
	{
		this.rule_bank.add_invert_cond(cond_name, cond_from);
	};        
    
    var logic_op_map = ["and", "or"];
	acts.AddCombinationCond = function (cond_name, cond_A, logic_op, cond_B)
	{
		this.rule_bank.add_combination_cond(cond_name, cond_A, logic_op_map[logic_op], cond_B);
	}; 
    
	acts.AddRule = function (cond_name, var_name)
	{
		this.rule_bank.add_rule(cond_name, var_name);
	};  
    
	acts.SetVarValue = function (var_name, value)
	{
		this.rule_bank.set_variable_value(var_name, value);
	};     
    
	acts.ExecuteRules = function ()
	{
		this.rule_bank.execute();
	};     
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.Grade = function (ret, var_name)
	{
        var grade_out = this.rule_bank.out_vars[var_name];
        if (grade_out == null)
            grade_out = 0;
		ret.set_float(grade_out);
	}; 
}());

(function ()
{
    cr.plugins_.Rex_Fuzzy.FRuleBank = function()
    {
        this.rules = [];
        this.conds = {};
        this.in_vars = {};
        this.out_vars = {};
    };
    var FRuleBankProto = cr.plugins_.Rex_Fuzzy.FRuleBank.prototype;
    
    FRuleBankProto.add_variable = function (var_name, nb, nm, ns, zo, ps, pm, pb)
    {
        this.in_vars[var_name] = new FMembership(nb, nm, ns, zo, ps, pm, pb);
    };
    
    FRuleBankProto.add_membership_cond = function (cond_name, var_name, membership)
    {
        if (this.conds[cond_name] != null)
            alert("Fuzzy: condition "+ cond_name + " had existed");
        var var_obj = this.in_vars[var_name];
        if (var_obj == null)
            alert("Fuzzy: can not find membership "+ var_name);
        this.conds[cond_name] = new FCond(membership, var_obj);
    };
    
    FRuleBankProto.add_invert_cond = function (cond_name, cond_from)
    {
        if (this.conds[cond_name] != null)
            alert("Fuzzy: condition "+ cond_name + " had existed");    
        var cond_obj = this.conds[cond_from];
        if (cond_obj == null)
            alert("Fuzzy: can not find condition "+ cond_from);
        this.conds[cond_name] = new FCond("not", cond_obj );
    }; 
    
    FRuleBankProto.add_combination_cond = function (cond_name, cond_A, logic_op, cond_B)
    {
        if (this.conds[cond_name] != null)
            alert("Fuzzy: condition "+ cond_name + " had existed");        
        var cond_A_obj = this.conds[cond_A], cond_B_obj = this.conds[cond_B];
        if (cond_A_obj == null)
            alert("Fuzzy: can not find condition "+ cond_A);    
        if (cond_B_obj == null)
            alert("Fuzzy: can not find condition "+ cond_B);              
        this.conds[cond_name] = new FCond(logic_op, cond_A_obj, cond_B_obj );
    }; 

	FRuleBankProto.add_rule = function (cond_name, var_name)
	{   
        var cond_obj = this.conds[cond_name];            
        if (cond_obj == null)
            alert("Fuzzy: can not find condition "+ cond_name); 
        if (this.out_vars[var_name] != null)
            alert("Fuzzy: Output "+ var_name + " had been defined");       
		this.rules.push( new FRule(cond_obj, var_name, this.out_vars) );
	}; 
    
    FRuleBankProto.set_variable_value = function (var_name, value)
    {    
        this.in_vars[var_name].value = value;
    };    
    
    FRuleBankProto.execute = function ()
    {
        var i, rule_cnt = this.rules.length;
        for (i=0; i<rule_cnt; i++)
            this.rules[i].execute();
    }; 
    
    var FRule = function(cond, out_var_name, out_vars)
    {
        this.cond = cond;
        this.out_var_name = out_var_name;
        this.out_vars = out_vars;        
    };
    var FRuleProto = FRule.prototype;
    
    FRuleProto.execute = function()
    {
        this.out_vars[this.out_var_name] = this.cond.get_grade();
    };
    
    var FCond = function(op, opA, opB)
    {
        this._get_grade = {"not":this.get_NOT_value,
                           "and":this.get_AND_value,
                           "or":this.get_OR_value}[op];
        if (this._get_grade == null)
            this._get_grade = this.get_membership_value;
        this.op = op;
        this.opA = opA;
        this.opB = opB;
    };
    var FCondProto = FCond.prototype;
    
    FCondProto.get_NOT_value = function()
    {
        return (1 - this.opA.get_grade());
    };
    
    FCondProto.get_AND_value = function()
    {
        return Math.min(this.opA.get_grade(), this.opB.get_grade());
    };  

    FCondProto.get_OR_value = function()
    {
        return Math.max(this.opA.get_grade(), this.opB.get_grade());
    }; 

    FCondProto.get_membership_value = function()
    {
        return this.opA.get_grade(this.op);
    }; 
    
    FCondProto.get_grade = function()
    {
        return this._get_grade();
    }; 

    var FMembership = function(nb, nm, ns, zo, ps, pm, pb)
    {
        this._membership_cb = {"nb":new FGrade(nb),
                               "nm":new FGrade(nm),
                               "ns":new FGrade(ns),
                               "zo":new FGrade(zo),
                               "ps":new FGrade(ps),
                               "pm":new FGrade(pm),
                               "pb":new FGrade(pb), };
        this.value = 0;        
    };
    var FMembershipProto = FMembership.prototype;    
    
    FMembershipProto.get_grade = function(membership)
    {
        return this._membership_cb[membership].get_grade(this.value);
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
        var grade = this._get_grade(x);
        return grade;
    }; 
    
}());   