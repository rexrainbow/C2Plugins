/*
Project Name: JS Midi Parser
Version: 1.0
Author: colxi
Author URI: http://www.colxi.info/
Description: JSMIDIparser library reads .MID binary files, and outputs binary  
data as a readable JS object.

Usage: call JSMIDIParser.IO(fileInputElement,callbacFunction) function, setting the 
Input File HTML element that will handle the file.mid opening, and callback function
that will recieve the resulting Object.

Output Object Specs: 
	MIDIObject{
		formatType: 0|1|2,
		timeDivision: (int),
		tracks: (int),
		track: Array[
			[0]: Object{
				event: Array[
					[0] : Object{
						data: (string),
						deltaTime: (int),
						metaType: (int),
						type: (int),
					},
					[1] : Object{...}
					[2] : Object{...}
					...
				]
			},
			[1] : Object{...}
			[2] : Object{...}
			...
		]
	}

Data from Event 12 of Track 2 could be easilly readed with:
MIDIObject.track[2].event[12].data;

MIDI Binary Encoding Specifications in http://www.sonicspot.com/guide/midifiles.html
*/
/*
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/

JSMIDIParser = {
	// debug (bool), when enabled will log in console unimplemented events warnings and general and errors.
	debug: false,	
	
	// IO() should be called in order attach a listener to the INPUT HTML element
	// that will provide the binary data automating the conversion, and returning
	// the structured data to the provided callback function.
	IO: function(_fileElement, _callback){
		if (!window.File || !window.FileReader){							// check browser compatibillity
			if (this.debug) console.log('The File APIs are not fully supported in this browser.');
			return false;
		};
		document.getElementById(_fileElement).onchange = (function(_t){		// set the file open event handler
			return function(InputEvt){
				if (!InputEvt.target.files.length) return false;
				var reader = new FileReader();								// prepare the file Reader
				reader.readAsArrayBuffer(InputEvt.target.files[0]);			// read the binary data
				reader.onload = (function(_t) {								// when ready...
					return function(e){
						_callback( _t.parse(new Uint8Array(e.target.result))); // encode data with Uint8Array and call the parser
					}
				})(_t);								
			};
		})(this);
	},
	
	// parse() function reads the binary data, interpreting and spliting each chuck
	// and parsing it to a structured Object. When job is finised returns the object
	// or 'false' if any error was generated. 	
	parse: function(FileAsUint8Array){
		var file = {
			data: null,
			pointer: 0,
			movePointer: function(_bytes){								// move the pointer negative and positive direction
				this.pointer += _bytes;
				return this.pointer;
			},
			readInt: function(_bytes){ 									// get integer from next _bytes group (big-endian) 
				var value = 0;
				if(_bytes > 1){
					for(var i=1; i<= (_bytes-1); i++){
						value += parseInt(this.data[this.pointer]) * Math.pow(256, (_bytes - i));
						this.pointer++;
					};
				};
				value += parseInt(this.data[this.pointer]);
				this.pointer++; 
				return value;
			},
			readStr: function(_bytes){									// read as ASCII chars, the followoing _bytes
				var text = '';
				for(var char=1; char <= _bytes; char++) text +=  String.fromCharCode(this.readInt(1));
				return text;
			},
			readIntVLV: function(){										// read a variable length value
				var value = 0;
				if(parseInt(this.data[this.pointer]) < 128) { 			// ...value in a single byte
					value = this.readInt(1);
				}else{													// ...value in multiple bytes
					var FirstBytes = [];
					while(parseInt(this.data[this.pointer]) >= 128){
						FirstBytes.push(this.readInt(1) - 128);
					};
					var lastByte  = this.readInt(1);;
					for(var dt = 1; dt <= FirstBytes.length; dt++){
						value = FirstBytes[FirstBytes.length - dt] * Math.pow(128, dt);
					};
					value += lastByte;
				};
				return value;
			}
		};
		file.data = FileAsUint8Array;											// 8 bits bytes file data array
		//  ** read FILE HEADER 
		if(file.readInt(4) != 0x4D546864) return false; 						// Header validation failed (not MIDI standard or file corrupt.)
		var headerSize 			= file.readInt(4);								// header size (unused var), getted just for read pointer movement
		var MIDI 				= {};											// create new midi object
		MIDI.formatType   		= file.readInt(2);								// get MIDI Format Type
		MIDI.tracks 			= file.readInt(2);								// get ammount of track chunks
		MIDI.track				= [];											// create array key for track data storing
		var timeDivisionByte1   = file.readInt(1);								// get Time Division first byte
		var timeDivisionByte2   = file.readInt(1);								// get Time Division second byte
		if(timeDivisionByte1 >= 128){ 											// discover Time Division mode (fps or tpf)
			MIDI.timeDivision    = [];											
			MIDI.timeDivision[0] = timeDivisionByte1 - 128;						// frames per second MODE  (1st byte)
			MIDI.timeDivision[1] = timeDivisionByte2;							// ticks in each frame     (2nd byte)
		}else MIDI.timeDivision  = (timeDivisionByte1 * 256) + timeDivisionByte2;// else... ticks per beat MODE  (2 bytes value)
		//  ** read TRACK CHUNK  
		for(var t=1; t <= MIDI.tracks; t++){	
			MIDI.track[t-1] 	= {event: []};									// create new Track entry in Array 	
			if(file.readInt(4) != 0x4D54726B) return false;						// Track chunk header validation failed.
			var chunkLength	 	= file.readInt(4);								// var NOT USED, just for pointer move. get chunk size (bytes length)
			var e		  		= 0;											// init event counter
			var endOfTrack 		= false;										// FLAG for track reading secuence breaking
            
			// ** read EVENT CHUNK
			while(!endOfTrack){
				e++;															// increase by 1 event counter
				MIDI.track[t-1].event[e-1] = {};	 							// create new event object, in events array
				MIDI.track[t-1].event[e-1].deltaTime  = file.readIntVLV();		// get DELTA TIME OF MIDI event (Variable Length Value)
				var statusByte = file.readInt(1);								// read EVENT TYPE (STATUS BYTE)
				if(statusByte >= 128) laststatusByte = statusByte;				// NEW STATUS BYTE DETECTED
					else{														// 'RUNNING STATUS' situation detected
						statusByte = laststatusByte;							// apply last loop, Status Byte
						file.movePointer(-1); 									// move back the pointer (cause readed byte is not status byte) 
					};
				// ** Identify EVENT
				if(statusByte == 0xFF){ 										// Meta Event type
					MIDI.track[t-1].event[e-1].type = 0xFF;						// assign metaEvent code to array
					MIDI.track[t-1].event[e-1].metaType =  file.readInt(1);		// assign metaEvent subtype
					var metaEventLength = file.readIntVLV();					// get the metaEvent length
					switch(MIDI.track[t-1].event[e-1].metaType){
						case 0x2F:												// end of track, has no data byte
							endOfTrack = true;									// change FLAG to force track reading loop breaking
							break;	
						case 0x01: 												// Text Event
						case 0x02:  											// Copyright Notice
						case 0x03:  											// Sequence/Track Name (documentation: http://www.ta7.de/txt/musik/musi0006.htm)
						case 0x06:  											// Marker
							MIDI.track[t-1].event[e-1].data = file.readStr(metaEventLength);
							break;
						case 0x21: 												// MIDI PORT
						case 0x59: 												// Key Signature
						case 0x51:												// Set Tempo
							MIDI.track[t-1].event[e-1].data = file.readInt(metaEventLength);
							break;
						case 0x54: 												// SMPTE Offset
						case 0x58: 												// Time Signature
							MIDI.track[t-1].event[e-1].data	   = [];
							MIDI.track[t-1].event[e-1].data[0] = file.readInt(1);
							MIDI.track[t-1].event[e-1].data[1] = file.readInt(1);
							MIDI.track[t-1].event[e-1].data[2] = file.readInt(1);
							MIDI.track[t-1].event[e-1].data[3] = file.readInt(1);
							break;
                        case 0x7F:                                              // Sequencer Specific
                            MIDI.track[t-1].event[e-1].data	   = file.readStr(metaEventLength);
                            //log("Sequencer Specific:" + ", data=" + MIDI.track[t-1].event[e-1].data);
                            break;
						default :
							MIDI.track[t-1].event[e-1].data = file.readInt(metaEventLength);
                            //log("Event:" + MIDI.track[t-1].event[e-1].metaType.toString(16) + ", data=" + MIDI.track[t-1].event[e-1].data);
							if (this.debug) console.log("Unimplemented 0xFF event! data block readed as Integer");
					};
				}else{															// MIDI Control Events OR System Exclusive Events
					statusByte = statusByte.toString(16).split('');				// split the status byte HEX representation, to obtain 4 bits values
					if(!statusByte[1]) statusByte.unshift('0');					// force 2 digits
					MIDI.track[t-1].event[e-1].type = parseInt(statusByte[0], 16);// first byte is EVENT TYPE ID
					MIDI.track[t-1].event[e-1].channel = parseInt(statusByte[1], 16);// second byte is channel
					switch(MIDI.track[t-1].event[e-1].type){
						case 0xF:												// System Exclusive Events
							var event_length = file.readIntVLV();
							MIDI.track[t-1].event[e-1].data = file.readInt(event_length)
							if (this.debug) console.log("Unimplemented 0xF exclusive events! data block readed as Integer");
							break;
						case 0xA:												// Note Aftertouch
						case 0xB:												// Controller
						case 0xE:												// Pitch Bend Event
						case 0x8:												// Note off
						case 0x9:												// Note On
							MIDI.track[t-1].event[e-1].data = [];
							MIDI.track[t-1].event[e-1].data[0] = file.readInt(1)
							MIDI.track[t-1].event[e-1].data[1] = file.readInt(1)
							break;
						case 0xC:												// Program Change	
						case 0xD:												// Channel Aftertouch
							MIDI.track[t-1].event[e-1].data = file.readInt(1)
							break;
						default:
							if (this.debug) console.log("Unknown EVENT detected.... reading cancelled!");
							return false;
					};
				};
			};		
		}  // for each track
		return MIDI;
	}
};