//You got rank 247
//You got rank 171

md5 = require('js-md5');
HM = require('hashmap');

var input = 'jlmsuwbz';
var kf = 0;
var ss = new HM();
var num = 0;
var keys = [];
var part = 1;
function sh(s) {
	if (part==2) {
		for(var i=0;i<2017;++i) {
			s = md5(s);
		}
		return s;
	} else return md5(s);
}
console.log(sh('abc5'))
while (keys.length<70) {
	var msg = input+num;
	var hso = sh(msg);
	var hs = hso.split('');
	var triplet = null;
	var fiflet = null;	
	for(var i=2;i<hs.length;++i) {
		if (hs[i-2]==hs[i-1]&&hs[i]==hs[i-2]&&triplet==null) {
			triplet = hs[i];
		}
		if (i>4&&fiflet==null) {
			if (hs[i-2]==hs[i-1]&&hs[i]==hs[i-2]&&hs[i]==hs[i-3]&&hs[i]==hs[i-4])	{
				fiflet = hs[i];
			}
		}
	}
	if (fiflet!=null) {
		var ii = ss.get(fiflet)||[];
		console.log(num, hso);				
		ii=ii.filter(j=>j+1000>=num);
		if (ii.length>0) {
			++kf;
			var ij = ii.filter(j=>j<num);
			keys=keys.concat(ij);
			//console.log(ij);
		}
	}
	if (triplet!=null) {
		var ii = ss.get(triplet)||[];
		ii.push(num);
		ss.set(triplet,ii);
	}
	
	++num;
}
keys.sort((a,b)=>a-b);
var ans = [];
for(var i=0;i<keys.length-1;++i) {
	if (keys[i]!=keys[i+1]) {
		ans.push(keys[i]);
	}
}
console.log(ans[63]);
//console.log(md5('Message to hash1'));


