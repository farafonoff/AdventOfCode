//You got rank 256 on
//You got rank 220 on

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').trim();

var part = 2;

function dl(str) {
	var re = /\((\d+)x(\d+)\)/ig;
	var mo = re.exec(str);
	if (mo!=null) {
		var tl = str.slice(re.lastIndex);
		return mo.index+di(Number(mo[1]), Number(mo[2]), tl);
	} else return str.length;
}

function di(rl, rc, str) {
	var rp = str.slice(0,rl);
	var op = str.slice(rl);
	var rpl;
	if (part==2) {
		rpl = dl(rp);
	} else {
		rpl = rp.length;
	}
	var opl = dl(op);
	return rpl*rc+opl;
}

console.log(dl("(27x12)(20x12)(13x14)(7x10)(1x12)A"));
console.log(dl("(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN"));
part = 1;
console.log(dl(contents));
part = 2;
console.log(dl(contents));

//console.log(decompress("X(8x2)(3x3)ABCY"));
//console.log(decompress("(6x1)(1x3)A(6x1)(1x3)A"));
//console.log(decompress(contents));