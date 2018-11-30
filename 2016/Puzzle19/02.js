//You got rank 530

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var n = 3017957;
//var n = 10;
var s = 1;
var j = 2;
var ans = 1;
var m=2;
while(j<=n) {
	m=Math.floor(j/2)+1;
	
	ans+=s;
	
	if (ans>=m) {
		ans=ans+1;
	}
	
	ans=1+(ans-1)%j;

	//console.log(j,m,ans);
	++j;
}

console.log(ans);