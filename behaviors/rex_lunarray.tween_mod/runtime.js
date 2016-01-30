// ECMAScript 5 strict mode
"use strict";
assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

function trim (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
/////////////////////////////////////
// Behavior class
cr.behaviors.rex_lunarray_Tween_mod = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_lunarray_Tween_mod.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.i = 0;		// progress
	};
	
	var behinstProto = behaviorProto.Instance.prototype;
	
	behinstProto.groupUpdateProgress = function(v)
	{
		if (v > 1) v = 1;
		if (cr.lunarray_tweenProgress[this.group] = -1) cr.lunarray_tweenProgress[this.group] = v;
		if (cr.lunarray_tweenProgress[this.group] >= v) cr.lunarray_tweenProgress[this.group] = v;
	}
	
	behinstProto.groupSync = function()
	{
		if (this.group != "") {
			if (typeof cr.lunarray_tweenGroup === "undefined") {
				//no group has existed yet, create it
				cr.lunarray_tweenGroup = {};
				cr.lunarray_tweenProgress = {};
			}
			if (typeof cr.lunarray_tweenGroup[this.group] === "undefined") {
				//group didn't exist yet, create it
				cr.lunarray_tweenGroup[this.group] = [];
				cr.lunarray_tweenProgress[this.group] = -1;
			} 
			if (cr.lunarray_tweenGroup[this.group].indexOf(this) == -1) {
				cr.lunarray_tweenGroup[this.group].push(this);
			}
		}
	}
	
	behinstProto.saveState = function()
	{
		this.tweenSaveWidth = this.inst.width;
		this.tweenSaveHeight = this.inst.height;
		this.tweenSaveAngle = this.inst.angle;
		this.tweenSaveOpacity = this.inst.opacity;
		this.tweenSaveX = this.inst.x;
		this.tweenSaveY = this.inst.y;
		this.tweenSaveValue = this.value;
	}
	
	behinstProto.onCreate = function()
	{
		// Load properties
		this.active = (this.properties[0] === 1);
		this.tweened = this.properties[1]; // 0=Position|1=Size|2=Width|3=Height|4=Angle|5=Opacity|6=Value only|7=Pixel Size
		this.easing = this.properties[2];
		this.initial = this.properties[3];
		this.target = this.properties[4];
		this.duration = this.properties[5];
		this.wait = this.properties[6];
		this.playmode = this.properties[7]; //0=Play Once|1=Repeat|2=Ping Pong|3=Play once and destroy|4=Loop|5=Ping Pong Stop|6=Play and stop
		this.value = this.properties[8];
		this.coord_mode = this.properties[9]; //0=Absolute|1=Relative
		this.forceInit = (this.properties[10] === 1);
		this.group = this.properties[11];
		
		// repeat count
		this.setRepeatCount(this.properties[12]);

		this.targetObject = null;
		this.pingpongCounter = 0;
		if (this.playmode == 5) this.pingpongCounter = 1;
		this.groupSync();
		
		this.isPaused = false;
		this.initialX = this.inst.x;
		this.initialY = this.inst.y;
		
		this.targetX = parseFloat(this.target.split(",")[0]);
		this.targetY = parseFloat(this.target.split(",")[1]);
		
		this.saveState();
		this.tweenInitialX = 0;
		this.tweenInitialY = 0;
		this.tweenTargetX = 0;
		this.tweenTargetY = 0;
		this.tweenTargetAngle = 0;
		this.ratio = this.inst.height / this.inst.width;

		this.reverse = false;
		this.rewindMode = false; 
		this.doTweenX = true;
		this.doTweenY = true;
		this.loop = false;
		this.initiating = 0;
		this.cooldown = 0;
		this.lastPlayMode = this.playmode;

		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;
		
		if (this.forceInit) this.init();

		if (this.initial == "") this.initial = "current";
		this.onStarted = false;
		this.onStartedDone = false;
		this.onWaitEnd = false;
		this.onWaitEndDone = false;
		this.onEnd = false;
		this.onEndDone = false;
		this.onCooldown = false;
		this.onCooldownDone = false;
		this.onCountEnd = false;
		
		if (this.active) {
			this.init();
		}
	};
	
	behinstProto.init = function ()
	{
		this.onStarted = false;
		if (this.initial === "") this.initial = "current";
		if (this.target === "") this.target = "current";

		var isCurrent = (this.initial === "current");
		var targetIsCurrent = (this.target === "current");
		var isTargettingObject = (this.target === "OBJ");

		if (this.target === "OBJ") {
			if (this.targetObject != null) {
				if (this.tweened == 0) {
					if (this.coord_mode == 1) //relative mode
						this.target = (this.targetObject.x-this.inst.x) + "," + (this.targetObject.y-this.inst.y);
					else //absolute mode
						this.target = (this.targetObject.x) + "," + (this.targetObject.y);
				} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3) || (this.tweened == 7)) {
					if (this.coord_mode == 1) { //relative mode 
						this.target = ((this.tweened==2)?1:(this.targetObject.width)) + "," + ((this.tweened==3)?1:(this.targetObject.height));
					} else {
						this.target = ((this.tweened==2)?1:(this.targetObject.width/this.tweenSaveWidth)) + "," + ((this.tweened==3)?1:(this.targetObject.height/this.tweenSaveHeight));
					}
				} else if (this.tweened == 4) {
					if (this.coord_mode == 1) //relative mode
						this.target = cr.to_degrees(this.targetObject.angle-this.inst.angle) + "";
					else //absolute mode
						this.target = cr.to_degrees(this.targetObject.angle) + "";
				} else if (this.tweened == 5) {
					if (this.coord_mode == 1) //relative mode
						this.target = ((this.targetObject.opacity-this.inst.opacity)*100) + "";
					else //absolute mode
						this.target = (this.targetObject.opacity*100) + "";
				}
			}
		}

		if (this.tweened == 0) {
			// position
			if (targetIsCurrent) this.target = this.inst.x + "," + this.inst.y;

			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) {
						this.inst.x = parseFloat(this.initial.split(",")[0]);
						this.inst.y = parseFloat(this.initial.split(",")[1]);
					}
				}
			} else {
				if (this.coord_mode == 1) {
					this.initial = this.inst.x + "," + this.inst.y;
				} else {
					this.initial = this.tweenSaveX + "," + this.tweenSaveY;
				}
			}
			
			if (this.coord_mode == 1) {
				//relative mode
				if (this.loop) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;
				}

				this.initialX = this.inst.x;
				this.initialY = this.inst.y;

				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]);
					this.targetY = -parseFloat(this.target.split(",")[1]);
				}
				
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;

				this.tweenTargetX = this.tweenInitialX + this.targetX;
				this.tweenTargetY = this.tweenInitialY + this.targetY;
			} else {
				//absolute mode
				if (!this.reverse) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;

					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.inst.x = parseFloat(this.target.split(",")[0]);
					this.inst.y = parseFloat(this.target.split(",")[1]);

					this.targetX = this.tweenSaveX;
					this.targetY = this.tweenSaveY;
				}
				this.initialX = this.inst.x;
				this.initialY = this.inst.y;

				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;

				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
				
				if (this.playmode == -6) {
					this.tweenTargetX = this.tweenSaveX;
					this.tweenTargetY = this.tweenSaveY;
				}
			}
		} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
			// size
			if (targetIsCurrent) this.target = "1,1";
			if (this.initial == "current") this.initial = "1,1";
			this.initial = "" + this.initial;
			this.target = "" + this.target;

			//check size property, is it a valid string? size actually accepts two parameter, duplicate it if it contains only one
			if (this.tweened == 2) {
				//width only tween
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + ",1";
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + ",1";
			} else if (this.tweened == 3) {
				//height only tween
				if (this.initial.indexOf(',') == -1) this.initial = "1," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = "1," + parseFloat(this.target);
			} else {
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + "," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + "," + parseFloat(this.target);
			}

			//insert ix and tx from the property
			var ix = parseFloat(this.initial.split(",")[0]);
			var iy = parseFloat(this.initial.split(",")[1]);

			//check if we need to tween x or y?
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx == 0) || (isNaN(tx)))	this.doTweenX = false;
			if (this.tweened == 3) this.doTweenX = false;
				
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty == 0) || (isNaN(ty)))	this.doTweenY = false;
			if (this.tweened == 2) this.doTweenY = false;
			
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}

				//relative mode, initialize size
				if (!isCurrent) {
					//in relative mode, don't use tween save width/height, use current width/height instead
					if (!this.reverse) {
						this.inst.width = this.inst.width * ix;
						this.inst.height = this.inst.height * iy;
					} else {
						this.inst.width = this.inst.width * tx;
						this.inst.height = this.inst.height * ty;
					}
				}

				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;

				//set target
				if (!this.reverse) {
					this.targetX = this.initialX * tx;
					this.targetY = this.initialY * ty;
				} else {
					this.targetX = this.initialX * ix/tx;
					this.targetY = this.initialY * iy/ty;
				}
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				//absolute mode

				if (!isCurrent) {
					//in absolute mode, use tween save width/height for initial size
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth * ix;
						this.inst.height = this.tweenSaveHeight * iy;
					} else {
						this.inst.width = this.tweenSaveWidth * tx;
						this.inst.height = this.tweenSaveHeight * ty;
					}
				} 
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;

				//set target
				if (!this.reverse) {
					this.targetX = this.tweenSaveWidth * tx;
					this.targetY = this.tweenSaveHeight * ty;
				} else {
					this.targetX = this.tweenSaveWidth * ix;
					this.targetY = this.tweenSaveHeight * iy;
				}

				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}

			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth * ix;
				this.tweenTargetY = this.tweenSaveHeight * iy;
			}
		} else if (this.tweened == 4) {
			// angle
			if (targetIsCurrent) this.target = cr.to_degrees(this.inst.angle);
			
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.angle = cr.to_radians(parseFloat(this.initial.split(",")[0]));
					}
				}
			} 
		
			if (this.coord_mode == 1) {
				//is relative
				if (this.loop) {
					this.inst.angle = this.tweenSaveAngle;
				}
				this.initialX = this.inst.angle;

				if (this.reverse) {
					this.targetX = this.inst.angle - cr.to_radians(parseFloat(this.target.split(",")[0]));
				} else {
					this.targetX = this.inst.angle + cr.to_radians(parseFloat(this.target.split(",")[0]));
				}

				this.tweenInitialX = this.initialX;
				this.tweenTargetX = cr.to_degrees(this.targetX);
			} else {
				if (this.reverse) {
					this.inst.angle = cr.to_radians(parseFloat(this.target.split(",")[0]));;
					this.initialX = this.inst.angle;
					this.targetX = this.tweenSaveAngle;
					
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				} else {
					this.inst.angle = this.tweenSaveAngle;
					this.initialX = this.inst.angle;
					this.targetX = cr.to_radians(parseFloat(this.target.split(",")[0]));
					
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				}
			}

			if (this.playmode == -6) {
				this.tweenTargetX = cr.to_degrees(this.tweenSaveAngle);
			}

			this.tweenTargetAngle = cr.to_radians(this.tweenTargetX);
		} else if (this.tweened == 5) {
			// opacity
			if (this.initial == "current") this.initial = this.inst.opacity;
			if (targetIsCurrent) this.target = ""+this.inst.opacity;

			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.opacity = parseFloat(this.initial.split(",")[0]) / 100;
					} 
				}
			}

			if (this.coord_mode == 1) {
				//relative mode
				if (this.loop) {
					this.inst.opacity = this.tweenSaveOpacity;
				}
				this.initialX = this.inst.opacity;
				this.tweenInitialX = this.initialX;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]) / 100;
				}

				this.tweenTargetX = this.tweenInitialX + this.targetX;
			} else {
				this.initialX = this.inst.opacity;
				if (!this.reverse) {
					this.tweenInitialX = this.initialX;
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.tweenInitialX = parseFloat(this.target.split(",")[0]) / 100;
					this.targetX = parseFloat(this.initial.split(",")[0]) / 100;
				}
				this.tweenTargetX = this.targetX;
			}

			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveOpacity;
			}
		} else if (this.tweened == 6) {
			// value
			if (isNaN(this.value)) this.value = 0;

			if (this.initial == "current") this.initial = ""+this.value;
			if (targetIsCurrent) this.target = ""+this.value;

			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.value = parseFloat(this.initial.split(",")[0]);
					} 
				}
			}
			
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.value = this.tweenSaveValue;
				}
				//relative mode, initialize value
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}

				this.initialX = this.value;

				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
				}

				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}

				this.initialX = this.value;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = parseFloat(this.initial.split(",")[0]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			}
			
			
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveValue;
			}
		} else if (this.tweened == 7) {
			// size pixel
			if (targetIsCurrent) this.target = this.inst.width + "," + this.inst.height;
			
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.width = parseFloat(this.initial.split(",")[0]);
						this.inst.height = parseFloat(this.initial.split(",")[1]);
					} 
				}
			}
			//if (this.initial == "current") this.initial = this.tweenSaveWidth + "," + this.tweenSaveHeight;

			//check if we need to tween x or y?
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx < 0) || (isNaN(tx)))	this.doTweenX = false;
				
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty < 0) || (isNaN(ty)))	this.doTweenY = false;

			if (this.coord_mode == 1) {
				//relative mode
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}

				this.initialX = this.inst.width;
				this.initialY = this.inst.height;

				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY + parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY - parseFloat(this.target.split(",")[1]);
				}

				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				//absolute mode
				if (!isCurrent) {
					//in absolute mode, use tween save width/height for initial size
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth;
						this.inst.height = this.tweenSaveHeight;
					} else {
						this.inst.width = parseFloat(this.target.split(",")[0]);
						this.inst.height = parseFloat(this.target.split(",")[1]);
					}
				} 

				this.initialX = this.inst.width;
				this.initialY = this.inst.height;

				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.tweenSaveWidth;
					this.targetY = this.tweenSaveHeight;
				}

				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;

				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}

			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth;
				this.tweenTargetY = this.tweenSaveHeight;
			}
		} else {
			assert2(false, "Invalid tweened property type");
		}

		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;

		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating)))	this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown)))	this.cooldown = 0;
		if (isCurrent) this.initial = "current";
		if (targetIsCurrent) this.target = "current";
		if (isTargettingObject) this.target = "OBJ";
	};
	
	function easeOutBounce(t,b,c,d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}		
	}

	behinstProto.easeFunc = function (t, b, c, d)
	{
		switch (this.easing) {
		case 0:		// linear
			return c*t/d + b;
		case 1:		// easeInQuad
			return c*(t/=d)*t + b;
		case 2:		// easeOutQuad
			return -c *(t/=d)*(t-2) + b;
		case 3:		// easeInOutQuad
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		case 4:		// easeInCubic
			return c*(t/=d)*t*t + b;
		case 5:		// easeOutCubic
			return c*((t=t/d-1)*t*t + 1) + b;
		case 6:		// easeInOutCubic
			if ((t/=d/2) < 1) 
				return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		case 7:		// easeInQuart
			return c*(t/=d)*t*t*t + b;
		case 8:		// easeOutQuart
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		case 9:		// easeInOutQuart
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		case 10:		// easeInQuint
			return c*(t/=d)*t*t*t*t + b;
		case 11:		// easeOutQuint
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		case 12:		// easeInOutQuint
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		case 13:		// easeInCircle
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		case 14:		// easeOutCircle
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		case 15:		// easeInOutCircle
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		case 16:		// easeInBack
			var s = 0;
			if (s==0) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		case 17:		// easeOutBack
			var s = 0;
			if (s==0) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		case 18:		// easeInOutBack
			var s = 0;
			if (s==0) s = 1.70158;
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		case 19:	//easeInElastic
			var a = 0;
			var p = 0;
			if (t==0) return b;  if ((t/=d)==1) return b+c; if (p==0) p=d*.3;
			if (a==0 || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		case 20:	//easeOutElastic
			var a = 0;
			var p = 0;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (p == 0) p=d*.3;
			if (a==0 || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
		case 21:	//easeInOutElastic
			var a = 0;
			var p = 0;
			if (t==0) return b; 
			if ((t/=d/2)==2) return b+c;  
			if (p==0) p=d*(.3*1.5);
			if (a==0 || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		case 22:	//easeInBounce
			return c - easeOutBounce(d-t, 0, c, d) + b;
		case 23:	//easeOutBounce
			return easeOutBounce(t,b,c,d);
		case 24:	//easeInOutBounce
			if (t < d/2) return (c - easeOutBounce(d-(t*2), 0, c, d) + b) * 0.5 +b;
			else return easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
		case 25:	//easeInSmoothstep
			var mt = (t/d) / 2;
			return (2*(mt * mt * (3 - 2*mt)));
		case 26:	//easeOutSmoothstep
			var mt = ((t/d) + 1) / 2;
			return ((2*(mt * mt * (3 - 2*mt))) - 1);
		case 27:	//easeInOutSmoothstep
			var mt = (t / d);
			return (mt * mt * (3 - 2*mt));
		};
		
		// should not reach here
		return 0;
	};

	behinstProto.saveToJSON = function ()
	{
		return {
		    "i": this.i,
			"active": this.active,
			"tweened": this.tweened,
			"easing": this.easing,
			"initial": this.initial,
			"target": this.target,
			"duration": this.duration,
			"wait": this.wait,
			"playmode": this.playmode,
			"value": this.value,
			"coord_mode": this.coord_mode,
			"forceInit": this.forceInit,
			"group": this.group,
			"repeatcount":this.repeatcount,

			"targetObject": this.targetObject,
			"pingpongCounter": this.pingpongCounter,
			
			"isPaused": this.isPaused,
			"initialX": this.initialX,
			"initialY": this.initialY,
			
			"targetX": this.targetX,
			"targetY": this.targetY,
			
			"tweenSaveWidth": this.tweenSaveWidth,
			"tweenSaveHeight": this.tweenSaveHeight,
			"tweenSaveAngle": this.tweenSaveAngle,
			"tweenSaveX": this.tweenSaveX,
			"tweenSaveY": this.tweenSaveY,
			"tweenSaveValue": this.tweenSaveValue,
			"tweenInitialX": this.tweenInitialX,
			"tweenInitialY": this.tweenInitialY,
			"tweenTargetX": this.tweenTargetX,
			"tweenTargetY": this.tweenTargetY,
			"tweenTargetAngle": this.tweenTargetAngle,
			"ratio": this.ratio,
			"reverse": this.reverse,
			"rewindMode": this.rewindMode,
			"doTweenX": this.doTweenX,
			"doTweenY": this.doTweenY,
			"loop": this.loop,
			"initiating": this.initiating,
			"cooldown": this.cooldown,
			"lastPlayMode": this.lastPlayMode,

			"lastKnownValue": this.lastKnownValue,
			"lastKnownX": this.lastKnownX,
			"lastKnownY": this.lastKnownY,
			
			"onStarted": this.onStarted,
			"onStartedDone": this.onStartedDone,
			"onWaitEnd": this.onWaitEnd,
			"onWaitEndDone": this.onWaitEndDone,
			"onEnd": this.onEnd,
			"onEndDone": this.onEndDone,
			"onCooldown": this.onCooldown,
			"onCooldownDone": this.onCooldownDone,
			"onCountEnd":this.onCountEnd,
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
			this.i = o["i"];
			this.active = o["active"];
			this.tweened = o["tweened"];
			this.easing = o["easing"];
			this.initial = o["initial"];
			this.target = o["target"];
			this.duration = o["duration"];
			this.wait = o["wait"];
			this.playmode = o["playmode"];
			this.value = o["value"];
			this.coord_mode = o["coord_mode"];
			this.forceInit = o["forceInit"];
			this.group = o["group"];
			this.repeatcount = o["repeatcount"];

			this.targetObject = o["targetObject"];
			this.pingpongCounter = o["pingpongCounter"];
			
			this.isPaused = o["isPaused"];
			this.initialX = o["initialX"];
			this.initialY = o["initialY"];
			
			this.targetX = o["targetX"];
			this.targetY = o["targetY"];
			
			this.tweenSaveWidth = o["tweenSaveWidth"];
			this.tweenSaveHeight = o["tweenSaveHeight"];
			this.tweenSaveAngle = o["tweenSaveAngle"];
			this.tweenSaveX = o["tweenSaveX"];
			this.tweenSaveY = o["tweenSaveY"];
			this.tweenSaveValue = o["tweenSaveValue"];
			this.tweenInitialX = o["tweenInitialX"];
			this.tweenInitialY = o["tweenInitialY"];
			this.tweenTargetX = o["tweenTargetX"];
			this.tweenTargetY = o["tweenTargetY"];
			this.tweenTargetAngle = o["tweenTargetAngle"];
			this.ratio = o["ratio"];
			this.reverse = o["reverse"];
			this.rewindMode = o["rewindMode"];
			this.doTweenX = o["doTweenX"];
			this.doTweenY = o["doTweenY"];
			this.loop = o["loop"];
			this.initiating = o["initiating"];
			this.cooldown = o["cooldown"];
			this.lastPlayMode = o["lastPlayMode"];

			this.lastKnownValue = o["lastKnownValue"];
			this.lastKnownX = o["lastKnownX"];
			this.lastKnownY = o["lastKnownY"];
			
			this.onStarted = o["onStarted"];
			this.onStartedDone = o["onStartedDone"];
			this.onWaitEnd = o["onWaitEnd"];
			this.onWaitEndDone = o["onWaitEndDone"]
			this.onEnd = o["onEnd"];
			this.onEndDone = o["onEndDone"];
			this.onCooldown = o["onCooldown"];
			this.onCooldownDone = o["onCooldownDone"];
			this.onCountEnd = o["onCountEnd"];
			
			this.groupSync();
	};
	
	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		var isForceStop = (this.i == -1);

		if (!this.active || dt === 0)
			return;
			
		if (this.i == 0) {
			if (!this.onStarted) {
				this.onStarted = true;
				this.onStartedDone = false;
				this.onWaitEnd = false;
				this.onWaitEndDone = false;
				this.onEnd = false;
				this.onEndDone = false;
				this.onCooldown = false;
				this.onCooldownDone = false;
				this.runtime.trigger(cr.behaviors.rex_lunarray_Tween_mod.prototype.cnds.OnStart, this.inst);
				this.onStartedDone = true;
			}
		}

		if (this.i == -1) {
			//force finish before re-tween
			this.i = this.initiating + this.duration + this.cooldown;
		} else {
			this.i += dt;
		}

		if (this.i <= this.initiating) {
			return;
		} else {
			if (this.onWaitEnd == false) {
				this.onWaitEnd = true;
				this.runtime.trigger(cr.behaviors.rex_lunarray_Tween_mod.prototype.cnds.OnWaitEnd, this.inst);
				this.onWaitEndDone = true;
			}
		}
		    
		if (this.i <= (this.duration + this.initiating)) {	
			var factor = this.easeFunc(this.i-this.initiating, 0, 1, this.duration);
			
			if (this.tweened == 0) {
				// position
				if (this.coord_mode == 1) {
					if (this.inst.x !== this.lastKnownX) {
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
						this.tweenTargetX += (this.inst.x - this.lastKnownX);
					}
					if (this.inst.y !== this.lastKnownY) {
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
						this.tweenTargetY += (this.inst.y - this.lastKnownY);
					}
				} else {
					if (this.inst.x !== this.lastKnownX)
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
					
					if (this.inst.y !== this.lastKnownY) 
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
				}
				this.inst.x = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				this.inst.y = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				
				this.lastKnownX = this.inst.x;
				this.lastKnownY = this.inst.y;
			} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
				// size
				if (this.inst.width !== this.lastKnownX)
					this.tweenInitialX = this.inst.width;

				if (this.inst.height !== this.lastKnownY)
					this.tweenInitialY = this.inst.height;
				
				if (this.doTweenX) {
					this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				} 
				
				if (this.doTweenY) {
					this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				} else {
					if (this.tweened == 1) {
						this.inst.height = this.inst.width * this.ratio;
					}
				}

				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			} else if (this.tweened == 4) {
				// angle
				//if (this.coord_mode == 1) {
					//if (this.inst.angle !== this.lastKnownValue)
						//this.tweenInitialX = cr.clamp_angle(this.tweenInitialX + (this.inst.angle - this.lastKnownValue));
				//}

				var tangle = this.tweenInitialX + (this.tweenTargetAngle - this.tweenInitialX) * factor;
				if (this.i >= (this.duration + this.initiating))
					tangle = this.tweenTargetAngle;
				
				this.inst.angle = cr.clamp_angle(tangle);
				//this.lastKnownValue = this.inst.angle;
			} else if (this.tweened == 5) {
				// opacity
				if (this.coord_mode == 1) {
					if (this.inst.opacity !== this.lastKnownX)
						this.tweenInitialX = this.inst.opacity;
				}

				this.inst.opacity = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				
				this.lastKnownX = this.inst.opacity;
			} else if (this.tweened == 6) {
				// value
				this.value = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;	
			} else if (this.tweened == 7) {
				// size pixel
				if (this.coord_mode == 1) {
					if (this.inst.width !== this.lastKnownX)
						this.tweenInitialX = this.inst.width;
					if (this.inst.height !== this.lastKnownY)
						this.tweenInitialY = this.inst.height;
				}

				if (this.doTweenX) this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				if (this.doTweenY) this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				
				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			}
			this.inst.set_bbox_changed();
		} 

		if (this.i >= this.duration + this.initiating) {
			this.doEndFrame(isForceStop);
			this.inst.set_bbox_changed();
			if (this.onEnd == false) {
				this.onEnd = true;
				this.runtime.trigger(cr.behaviors.rex_lunarray_Tween_mod.prototype.cnds.OnEnd, this.inst);
				this.onEndDone = true;
			}
		}
	};

	behinstProto.doEndFrame = function (isForceStop)
	{
		switch (this.tweened) {
		case 0:		// position
			this.inst.x = this.tweenTargetX;
			this.inst.y = this.tweenTargetY;
			break;
		case 1:		// size
			if (this.doTweenX) this.inst.width = this.tweenTargetX;
			if (this.doTweenY) {
				this.inst.height = this.tweenTargetY;
			} else {
				this.inst.height = this.inst.width * this.ratio;
			}
			break;
		case 2:		// width
			this.inst.width = this.tweenTargetX;
			break;
		case 3:		// height
			this.inst.height = this.tweenTargetY;
			break;
		case 4:		// angle
			var tangle = this.tweenTargetAngle;
			this.inst.angle = cr.clamp_angle(tangle);
			this.lastKnownValue = this.inst.angle;
			break;
		case 5:		// opacity
			this.inst.opacity = this.tweenTargetX;
			break;
		case 6:		// value
			this.value = this.tweenTargetX;
			break;
		case 7:		// size
			if (this.doTweenX) this.inst.width = this.tweenTargetX;
			if (this.doTweenY) this.inst.height = this.tweenTargetY;
			break;
		}
		
		
		if (this.repeatcount > 0)
		    this.repeatcount -= 1;
		    		
		if (this.i >= this.duration + this.initiating + this.cooldown) {
			if (this.playmode == 0) {
				//play once
				this.active = false;
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
                this.onCountEnd = true;
				//this.saveState();
			} else if (this.playmode == 1) {
				//repeat
				//this.reverse = false;
				this.i = 0;
				//this.saveState();
				this.init();
				this.onCountEnd = (this.repeatcount == 0);
				this.active = (!this.onCountEnd);
			} else if (this.playmode == 2) {
				//ping pong
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					this.reverse = !this.reverse;
					this.i = 0;
					this.init();
					this.onCountEnd = (this.repeatcount == 0);
				    this.active = (!this.onCountEnd);
				}
			} else if (this.playmode == 3) {
				//play once and destroy
				this.runtime.DestroyInstance(this.inst);
			} else if (this.playmode == 4) {
				//Loop
				this.loop = true;
				this.i = 0;
				this.init();
				this.onCountEnd = (this.repeatcount == 0);
				this.active = (!this.onCountEnd);
			} else if (this.playmode == 5) {
				//ping pong stop
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					if (this.pingpongCounter <= 0) {
						this.i = this.duration + this.initiating + this.cooldown;
						this.onCountEnd = (this.repeatcount == 0);
				        this.active = (!this.onCountEnd);
					} else {
						if (!this.reverse) {
							this.pingpongCounter -= 1;
							this.reverse = true;
							this.i = 0;
							this.init();
							this.active = true;
						} else {
							this.pingpongCounter -= 1;
							this.reverse = false;
							this.i = 0;
							this.init();
							this.active = true;
						}
					}
				}
			} else if (this.playmode == -6) {
				//reverse
				this.playmode = this.lastPlayMode;
				this.reverse = false;
				this.i = 0;
				this.active = false;
			} else if (this.playmode == 6) {
				//play and stop
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
				this.active = false;
                this.onCountEnd = true;
			}
			//end of playmode if
		}
		if (this.onCooldown == false) {
			this.onCooldown = true;
			this.runtime.trigger(cr.behaviors.rex_lunarray_Tween_mod.prototype.cnds.OnCooldownEnd, this.inst);
			this.onCooldownDone = true;
		}
		
		if (this.onCountEnd)
		{
		    this.runtime.trigger(cr.behaviors.rex_lunarray_Tween_mod.prototype.cnds.OnCountEnd, this.inst);
		    this.onCountEnd = false;
		}
		//this.groupUpdateProgress((this.i / (this.duration + this.initiating + this.cooldown)));
	};
	
	behinstProto.setRepeatCount = function (cnt)
    {	
	    this.repeatcount_save = cnt;
		if (this.repeatcount_save <= 0)
		    this.repeatcount_save = -1;
		this.repeatcount = this.repeatcount_save;
    };

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Initial", "value": this.initial},
				{"name": "Target", "value": this.target},   
				{"name": "Progress", "value": this.i / (this.duration + this.initiating + this.cooldown)},                  
			]
		});
	};
	/**END-PREVIEWONLY**/	    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
	
	cnds.IsActive = function ()
	{
		return this.active;
	};

	cnds.CompareGroupProgress = function (cmp, v)
	{
		//group slowest member progress has at least reach v
		var x = [];
		cr.lunarray_tweenGroup[this.group].forEach(function (value) { 
			x.push((value.i / (value.duration + value.initiating + value.cooldown)));
		} );
		return cr.do_cmp(	Math.min.apply(null, x), cmp, v );
	}

	cnds.CompareProgress = function (cmp, v)
	{
		return cr.do_cmp((this.i / (this.duration + this.initiating + this.cooldown)), cmp, v);
	};

	cnds.OnStart = function ()
	{
		if (this.onStartedDone === false) {
			return this.onStarted;
		}
	};

    cnds.OnWaitEnd = function ()
	{
		if (this.onWaitEndDone === false) {
			return this.onWaitEnd;
		}
	};

    cnds.OnEnd = function (a, b, c)
	{
		if (this.onEndDone === false) {
			return this.onEnd;
		}
	};

    cnds.OnCooldownEnd = function ()
	{
		if (this.onCooldownDone === false) {
			return this.onCooldown;
		}
	};

    cnds.OnCountEnd = function ()
	{
		return this.onCountEnd;
	};	
	

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
	
	acts.SetActive = function (a)
	{
		this.active = (a === 1);
	};

	acts.StartGroup = function (force, sgroup)
	{
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function(value2) { return !value2.active; } );
		if ( groupReady ) {
			cr.lunarray_tweenGroup[sgroup].forEach( 
				function(value) { 
					if (force === 1) {
						acts.Force.apply(value); 
					} else {
						acts.Start.apply(value); 	
					}
				}
			);
		}
	}

	acts.StopGroup = function (stopmode, sgroup)
	{
		if (sgroup === "") sgroup = this.group;
		cr.lunarray_tweenGroup[sgroup].forEach( function(value) { 
			acts.Stop.apply(value, [stopmode]); 
		} );
	}

	acts.ReverseGroup = function (force, rewindMode, sgroup)
	{
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function(value2) { return !value2.active; } );
		if ( groupReady ) {
			cr.lunarray_tweenGroup[sgroup].forEach( 
				function(value) { 
					if (force === 1) {
						acts.ForceReverse.apply(value, [rewindMode]);
					} else {
						acts.Reverse.apply(value, [rewindMode]); 	
					}
				}
			);
		}
	}

	acts.Force = function ()
	{
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;

		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = false;
				this.init();
				this.active = true;
			}
		} else {
			//this.saveState();
			this.reverse = false;
			this.i = 0;
			this.init();
			this.active = true;
		}
	};

	acts.ForceReverse = function (rewindMode)
	{
		this.rewindMode = (rewindMode == 1);
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;

		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = true;
				this.init();
				this.active = true;
			}
		} else {
			if (rewindMode) {
				if (this.pingpongCounter == 1) {
					if (this.i >= this.duration + this.cooldown + this.initiating) {
						this.reverse = true;
						this.i = 0;
						this.pingpongCounter = 2;
						this.init();
						this.active = true;
					}
				}
			} else {
				this.reverse = true;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};

	acts.Start = function ()
	{
		if (!this.active) {		
		    this.repeatcount = this.repeatcount_save;		    
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;

			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = false;
					this.init();
					this.active = true;
				}
			} else {
				this.pingpongCounter = 1;
				//this.saveState();
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};

	acts.Stop = function (stopmode)
	{
		if (this.active) {
			if ((this.playmode == 2) || (this.playmode == 4)) {
				//if ping pong or loop mode, don't stop at the end, go to beginning instead
				if (this.reverse) {
					this.i = 0;
				} else {
					this.i = -1;
				}
			} else {
				if (stopmode == 1) {
					this.saveState();
				} else if (stopmode == 0) {
					//go to end frame
					this.i = this.initiating + this.cooldown + this.duration;
				} else {
					this.i = 0;
				}
			}
			this.tick();
			this.active = false;
		}
	};

	acts.Pause = function () {
		if (this.active) {
			this.isPaused = true;
			this.active = false;
		}
	}

	acts.Resume = function () {
		if (this.isPaused) {
			this.active = true;
			this.isPaused = false;
		} else {
			//call play instead if it's not paused
			if (!this.active) {
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	}

	acts.Reverse = function (rewindMode)
	{
		this.rewindMode = (rewindMode == 1);
		if (!this.active) {
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;

			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = true;
					this.init();
					this.active = true;
				}
			} else {
				if (rewindMode) {
					if (this.pingpongCounter == 1) {
						if (this.i >= this.duration + this.cooldown + this.initiating) {
							this.reverse = true;
							this.i = 0;
							this.pingpongCounter = 2;
							this.init();
							this.active = true;
						}
					}
				} else {
					this.reverse = true;
					this.i = 0;
					this.init();
					this.active = true;
				}
			}
		}
	};
	
	acts.SetDuration = function (x)
	{
		this.duration = x;
	};

	acts.SetWait = function (x)
	{
		this.wait = x;
		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating)))	this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown)))	this.cooldown = 0;
	};

	acts.SetTarget = function (x)
	{
		if (typeof(x) == "string") {
			this.target = x;
			this.targetX = parseFloat(x.split(",")[0]);
			this.targetY = parseFloat(x.split(",")[1]);
		} else {
			this.target = x;
			this.targetX = x;
		}
		if (!this.active) {
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetTargetObject = function (obj)
	{
		if (!obj)
			return;
			
		var otherinst = obj.getFirstPicked();
		
		if (!otherinst)
			return;
			
		this.targetObject = otherinst;
		this.target = "OBJ";
	};
	
	acts.SetRepeatCount = function (cnt)
	{
	    this.setRepeatCount(cnt);
	};

	acts.SetTargetX = function (x)
	{
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x.split(",")[0]);
			} else {
				this.target = ""+x+","+this.targetY;
			}
			this.targetX = this.target;
		} else {
			var currY = this.target.split(",")[1];
			this.target = String(x) + "," + currY;
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetTargetY = function (x)
	{
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x)+"";
			} else {
				this.target = this.targetX+","+x;
			}
			this.targetX = this.target;
		} else {
			var currX = this.target.split(",")[0];
			this.target = currX + "," + String(x);
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetInitial = function (x)
	{
		if (typeof(x) == "string") {
			this.initial = x;
			this.initialX = parseFloat(x.split(",")[0]);
			this.initialY = parseFloat(x.split(",")[1]);
		} else {
			this.initial = ""+x;
			this.initialX = x;
		}
		if (this.tweened == 6) {
			this.value = this.initialX;
		}

		if (!this.active) {
			this.saveState();
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetInitialX = function (x)
	{
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = ""+x+","+this.initialY;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currY = this.tweenSaveY;
			} else {
				var currY = this.initial.split(",")[1];
			}
			this.initial = String(x) + "," + currY;
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}

		if (this.tweened == 6) {
			this.value = this.initialX;
		}
		
		if (!this.active) {
			//this.init();
			this.saveState();
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetInitialY = function (x)
	{
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = ""+this.initialX+","+x;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currX = this.tweenSaveX;
			} else {
				var currX = this.initial.split(",")[0];
			}
			this.initial = currX + "," + String(x);
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}
		
		if (!this.active) {
			//this.init();
			this.saveState();
			this.init();
		} else {
			//this.i = 0;
			//this.init();
		}
	};

	acts.SetValue = function (x)
	{
		this.value = x;
	};
	
	acts.SetTweenedProperty = function (m)
	{
		this.tweened = m;
		//this.init();
	};
	
	acts.SetEasing = function (w)
	{
		this.easing = w;
	};

	acts.SetPlayback = function (x)
	{
		this.playmode = x;
	};

	acts.SetParameter = function (tweened, playmode, easefunction, initial, target, duration, wait, cmode)
	{
        if (typeof(easefunction) == "string")
        {
            easefunction = alias_map[easefunction];
            if (easefunction == null)
                easefunction = 0;
        }
    
		this.tweened = tweened;
		this.playmode = playmode;
		this.easing = easefunction;
		acts.SetInitial.apply(this, [initial]);
		acts.SetTarget.apply(this, [target]);
		acts.SetDuration.apply(this, [duration]);
		acts.SetWait.apply(this, [wait]);
		this.coord_mode = cmode;
		this.saveState();
		//this.init();
	};

    var alias_map = {};
	acts.SetEasingAlias = function (alias, easefunction)
	{
		alias_map[alias] = easefunction;
	};
    

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.Progress = function (ret)
	{
		ret.set_float(this.i / (this.duration + this.initiating + this.cooldown));
	};

	exps.ProgressTime = function (ret)
	{
		ret.set_float(this.i);
	};

	exps.Duration = function (ret)
	{
		ret.set_float(this.duration);
	};

	exps.Initiating = function (ret)
	{
		ret.set_float(this.initiating);
	};

	exps.Cooldown = function (ret)
	{
		ret.set_float(this.cooldown);
	};
	
	exps.Target = function (ret)
	{
		ret.set_string(this.target);
	};

	exps.Value = function (ret)
	{
		ret.set_float(this.value);
	};

	exps.isPaused = function (ret)
	{
		ret.set_int(this.isPaused ? 1: 0);
	};
}());
