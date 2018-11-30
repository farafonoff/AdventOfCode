//You got rank 256 on

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').trim();


function decompress(str) {
	var regex = /\((\d+)x(\d+)\)/g
	var mat;
	var out = "";
	var sp = 0;
	var esp = 0;
	while ((mat=regex.exec(str))!=null) {
		var cn=Number(mat[1]);
		var rp=Number(mat[2]);
		console.log(mat);
		var rpp = str.slice(regex.lastIndex, cn+regex.lastIndex);
		out+=str.slice(sp,mat.index);
		out+=rpp.repeat(rp);
		sp = regex.lastIndex;
		regex.lastIndex+=cn;
		esp = regex.lastIndex;
		sp = esp;
		//console.log(out);
	}
	out+=str.slice(esp);
	return out;
}

console.log(decompress("A(2x2)BCD(2x2)EFG"));
console.log(decompress("X(8x2)(3x3)ABCY"));
console.log(decompress("(6x1)(1x3)A(6x1)(1x3)A"));
console.log(decompress(contents).length);