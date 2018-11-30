//You got rank 145

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");


var rSWP = /swap position (\d+) with position (\d+)/
var rSWL = /swap letter ([a-z]) with letter ([a-z])/
var rRRR = /rotate right (\d+) step/
var rRRL = /rotate left (\d+) step/
var rRBX = /rotate based on position of letter ([a-z])/
var rRXY = /reverse positions (\d+) through (\d+)/
var rMXY = /move position (\d+) to position (\d+)/

var is = "abcdefgh".split('')
var debug = [];

function rr(s,n) {
	n = n%s.length;
	let tail = is.slice(n);
	let head = is.slice(0,n);
	return tail.concat(head);
}

contents.forEach(s=>{
	var m;
	//console.log(s);
	if (m=rSWP.exec(s)) {
		let n1 = Number(m[1]);
		let n2 = Number(m[2]);
		let t = is[n1];
		is[n1] = is[n2];
		is[n2] = t;
	} else 
	if (m=rSWL.exec(s)) {
		let n1 = is.indexOf(m[1]);
		let n2 = is.indexOf(m[2]);
		let t = is[n1];
		is[n1] = is[n2];
		is[n2] = t;
	} else
	if (m=rRRR.exec(s)) {
		let st = Number(m[1]);
		is = rr(is, -st);
	} else
	if (m=rRRL.exec(s)) {
		let st = Number(m[1]);
		is = rr(is, st);
	} else
	if (m=rRBX.exec(s)) {
		let lt = m[1];
		let idx = is.indexOf(lt);
		if (idx>=4) ++idx;
		is = rr(is, -(idx+1));
	} else
	if (m=rRXY.exec(s)) {
		let n1 = Number(m[1]);
		let n2 = Number(m[2]);
		let head = is.slice(0,n1);
		let mid = is.slice(n1,n2+1).reverse();
		let tail = is.slice(n2+1);
		is = head.concat(mid).concat(tail);
	} else
	if (m=rMXY.exec(s)) {
		let n1 = Number(m[1]);
		let n2 = Number(m[2]);
		let ch = is[n1];
		is.splice(n1,1);
		is.splice(n2,0,ch);
	} else console.log("!!!!", s);
	//console.log(is);
	debug.push([is.join('')]);
})
debug.reverse().forEach(a=>console.log(a));
//console.log(is.join(''));