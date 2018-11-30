//You got rank 169

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var n = 3017957;
//var n = 5;
var s = 1;
var j = 2;
var ans = 0;
var m = 2;
var ans = 1;
while(j<=n) {
	ans = 1+(ans+1)%j;
	//console.log(j,ans);	
	++j;
}

console.log(ans);