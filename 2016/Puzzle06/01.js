/*
You got rank 238 on
You got rank 267 on
*/

const fs = require('fs');

var contents = fs.readFileSync('input1.txt', 'utf8').split("\n");
var len = contents[0].trim().length

var charz = new Array(10);
var ac = "a".charCodeAt(0);
contents.forEach(function(st) {
	for(var i=0;i<st.length;++i) {
		if (charz[i]==undefined) {
			charz[i] = new Array(100).fill(0)
			
		}
		var stc = st.charCodeAt(i);
		charz[i][stc-ac]+=1;
	}
})

var out1 = []
var out2 = []

for(var i=0;i<len;++i) {
	var mc = 0;
	var mc1 = 0;
	if (charz[i]==undefined||charz[i].length==0) break;
	for(var j=1;j<charz[i].length;++j) {
		if (charz[i][j]>charz[i][mc]) {
			mc = j;
		}
		if (charz[i][j]<charz[i][mc1]&&charz[i][j]>0) {
			mc1 = j;
		}
	}
	out1.push(String.fromCharCode(mc+ac))
	out2.push(String.fromCharCode(mc1+ac))
}

console.log(out1.join(''))
console.log(out2.join(''))
