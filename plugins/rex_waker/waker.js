"use strict";

var timer_id = -1;
var timer_running = false;
var timer_period = 16;

function startTimer()
{
	if (timer_running)
		return;
	
	timer_running = true;
	timer_id = setInterval(tick, timer_period);
};

function stopTimer()
{
	if (!timer_running)
		return;
	
	timer_running = false;
	clearInterval(timer_id);
	timer_id = -1;
};

function setTimerPeriod(t)
{
	timer_period = t;
};

var cmdMap = {
    "startTimer": startTimer,
    "stopTimer": stopTimer,
    "setTimerPeriod": setTimerPeriod, 
}

function tick()
{
	if (!timer_running)
		return;
	
	self.postMessage("tick");
};

var runCommand = function (e)
{
    var cmd = e.data;
	var cmdFunction = cmdMap[cmd[0]];
	if (cmdFunction == null)
	    return;
	
	cmd.shift();
	cmdFunction.apply(null, cmd);	
};

self.addEventListener("message", runCommand, false);