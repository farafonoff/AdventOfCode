//You got rank 113
//You got rank 121

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var inp = "^^.^..^.....^..^..^^...^^.^....^^^.^.^^....^.^^^...^^^^.^^^^.^..^^^^.^^.^.^.^.^.^^...^^..^^^..^.^^^^"

//var traps = ["^^.", ".^^", "^..", "..^"];

function solve(inp, rows, log) {
	function next(inp) {
		var arr = inp;
		var narr = arr.map(
	(ch,idx)=>{
		var trr = idx>0&&arr[idx-1]=='^';
		var trl = idx<arr.length-1&&arr[idx+1]=='^';
		return trr^trl?'^':'.';
		//var si = ([idx>0?arr[idx-1]:'.', arr[idx], idx<arr.length-1?arr[idx+1]:'.'].join(''));
		//return traps.indexOf(si)==-1?'.':'^';
	});
		return narr;
	}

	var s = inp.split('');
	var an = 0;
	var rw = rows;
	for(var i=0;i<rw;++i) {
		an+=s.reduce((s,c)=>c=='.'?s+1:s,0);
		if (i==rw-1||log) {
			console.log(s.join(''),i,an);
		}
		s = next(s);
	}
}

solve('.^^.^.^^^^', 10, true);
solve(inp, 40, true);
solve(inp, 400000, false);
