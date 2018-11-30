//You achieved rank 73
//You achieved rank 60
const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

function expand(sar) {
	var rar = sar.map(e=>e=='1'?'0':'1').reverse();
	return sar.concat(['0']).concat(rar);
}

function cs(sar) {
	var res = [];
	for(var i=0;i<sar.length;i+=2) {
		if (sar[i]==sar[i+1]) {
			res.push('1')
		} else res.push('0');
	}
	return res;
}

console.log(expand('111100001010'.split('')).join(''))

function solve(s,l) {
	var s = s.split('')
	while (s.length<l) {
		s = expand(s);
	}

	s = s.slice(0,l);

	while (s.length%2==0) {
		s = cs(s);
	}

	return s.join('');
}

console.log(solve('00101000101111010', 272));
console.log(solve('00101000101111010', 35651584));
