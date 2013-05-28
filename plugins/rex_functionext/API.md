## Sample code  
* Put these code into "action:*Inject JS function objects*"

        function(fn)
        {
            var my_jsfn = function(fn, params)
            {
                var i,cnt=params[0],sum=0;
                for(i=0;i<cnt;i++)
                    sum += fn.CallFn('test', 'In js function\n');
                    // it will call on function "test" in event sheet
                    // and get return value back
                return sum;
            };
            fn.InjectJS('my_jsfn', my_jsfn);
        }  
        
## Interface of injecting
* function(fn){...}
  * fn is function extension object. 
  * Using fn.InjectJS(name, js_function) to inject js_function

## Interface of injected js function
 * function(fn, params) {...}
   * fn is function extension object.
   * params is a list passed from event sheet, the item could be number or string.
   * return value could be got by *expression:ReturnValue*
    
## API of function extension object
* val = fn.CallFn(name, param0, param1, ...)
  * fn is function extension object. 
  * param could be a number, or a string
  * val is the return value
  
* fn.InjectJS(name, js_function)  
  * fn is function extension object.   
  * Injecting a js_function by name.
  