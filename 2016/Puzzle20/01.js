//You got rank 179
//You achieved rank 83

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var ips = []

contents.forEach(c=>{
	var ps = c.split('-');
	if (ps.length==2) {
		ips.push([Number(ps[0]),'s']);		
		ips.push([Number(ps[1]),'e']);
	}
});

ips.sort((ip1,ip2)=>ip1[0]-ip2[0]);

var j = 0;
var b = 0;
var te = 4294967295;

var allowed = 0;

console.log(ips[0]);
console.log(ips[ips.length-1]);

for(var j=0;j<ips.length;++j) {
	b += (ips[j][1]=='s'?1:-1);
	if(b==0) {
		let end = (j<ips.length-1)?ips[j+1][0]:te;
		var diff = end-ips[j][0]-1;
		if (diff>0) {
			console.log(ips[j][0]+1,diff,ips[j],ips[j+1]);
			allowed+=diff;
		}
	}
}

console.log(allowed);

