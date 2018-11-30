//You achieved rank 100 *
//You achieved rank 87 **

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");


/*value 5 goes to bot 2
bot 2 gives low to bot 1 and high to bot 0
value 3 goes to bot 1
bot 1 gives low to output 1 and high to bot 0
bot 0 gives low to output 2 and high to output 0
value 2 goes to bot 2*/

var outputs = [];
var bots = [];

var rGOES = /(value) (\d+) goes to bot (\d+)/i
var rGIVES = /(bot) (\d+) gives low to (output|bot) (\d+) and high to (output|bot) (\d+)/

var parsed = contents.map(str=>{
	var mg1 = str.match(rGOES);
	if (mg1!=null)
		return mg1;
	else {
		let mg2 = str.match(rGIVES);
		if (mg2!=null) return mg2;
		else console.log(str);
	}
}).filter(v=>!!v);

var cmp = (v1,v2)=>v1-v2;

function giveval(bot, val) {
			bots[bot] = bots[bot]||[];
			bots[bot].push(val);
			
}

function outval(out, val) {
	outputs[out] = val;
}

function give(oc,ov,val) {
	var idx = Number(ov);
	var val = Number(val);
	if (oc=='bot') {
		giveval(idx, val);
	} else if (oc=='output') {
		outval(ov, val);
	} else {
		console.log(oc,ov,val);
	}
}

var executed = new Array(parsed.length).fill(false);

parsed.forEach((s1,idx)=>{
	parsed.forEach((match,idx)=>{
		if (executed[idx]) return;
		if (match[1]=='value') {
			var val = Number(match[2]);
			var bot = Number(match[3]);
			giveval(bot, val);
			executed[idx] = true;
			//console.log(contents[idx])
		} else {
			var bot = Number(match[2]);
			bots[bot] = bots[bot]||[];
			if (bots[bot].length==2) {
				bots[bot] = bots[bot].sort(cmp);
				if (bots[bot][0]==17&&bots[bot][1]==61) {
					console.log(bot);
				}
				give(match[3], match[4], bots[bot][0]);
				give(match[5], match[6], bots[bot][1]);
				//bots[bot] = [];
				executed[idx] = true;
				//console.log(contents[idx])
			}
		}
	});
});


console.log(outputs[0]*outputs[1]*outputs[2]);

//console.log(outputs);
//console.log(bots);