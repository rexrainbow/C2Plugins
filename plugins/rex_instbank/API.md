## API of InstBankKlass

* bank = cr.plugins_.Rex_InstanceBank.InstBankKlass(plugin)
  * get an instance bank
    * plugin.OnSaving(inst, ret_info) : handler of saving instance
    * plugin.OnLoading(inst, info) : handler of loading instance
	
* content = bank.ContentGet()
  * Get content of instance bank.
    * Content is a hash table with {saved_uid : save_obj}. 
	
* save_obj = bank.SaveInstance(inst)
  * Transfer an instance into a hash object.
    * save_obj is a hash table object stored in content.
    * inst is an C2 instance.   

* inst = bank.CreateInstance(save_obj)
  * Transfer a hash object to an instance.  
    * save_obj is a hash table object. 
    * inst is an C2 instance 
    
* bank.SaveInstance(objtype, pick_all)
  * Transfer instances of an object type into bank.      
     
* bank.LoadAllInstances()
  * Transfer all save_obj saved in bank to instances. 
     
* is_success = bank.SOLPickOne(objtype, inst)
  * Put the instance into SOL. 
    * is_success = true means putting instance into SOL successful.

* inst = bank.SavedUID2Inst(saved_uid)
  * Get the instance by saved UID.  
    * saved_uid is an UID of the saving instance

* is_success = bank.SOLPickBySavedUID(objtype, saved_uid)
  * Put the instance got by saved UID into SOL. 
    * saved_uid is an UID of the saving instance
   
* json = bank.ToString()
  * Get json string of bank.
  
* bank.JSON2Bank(json)
  * Restore bank from json string  