//You got rank 154 on 1
//You got rank 140 on 2
const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var rRECT = /rect ([0-9]+)x([0-9]+)/i;
var rRX = /^rotate column x=([0-9]+) by ([0-9]+)/i;
var rRY = /^rotate row y=([0-9]+) by ([0-9]+)/i;

function createArray(length) {
    var a = new Array(Number(length) || 0).fill(0);

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < length; i++) {
            a[i] = createArray.apply(this, args);
        }
    }

    return a;
}

function rect(arr, y,x) {
	for(let i=0;i<x;++i) {
		for(let j=0;j<y;++j) {
			arr[i][j] = 1;
		}
	}
	return arr;
}

function rar(ar, d) {
	d = d%ar.length;
	return ar.slice(-d).concat(ar.slice(0,-d));
}

function rx(arr, col, d) {
	var cl = arr.map(ro=>ro[col]);
	cl = rar(cl, d);
	arr.forEach((ro,idx)=>ro[col]=cl[idx]);
	return arr;
}

function ry(arr, row, d) {
	arr[row] = rar(arr[row], d);
	return arr;
}

var arr = createArray(6,50);
contents.forEach(line=>{
	var mat;
	if ((mat=line.match(rRECT))!=null) {
		arr = rect(arr, Number(mat[1]), Number(mat[2]));
	} else 
	if ((mat=line.match(rRX))!=null) {
		arr = rx(arr, Number(mat[1]), Number(mat[2]));
	} else
	if ((mat=line.match(rRY))!=null) {
		arr = ry(arr, Number(mat[1]), Number(mat[2]));
	} else console.log(line);
/*	console.log(line);
	console.log(mat);
	console.log(arr.map(r=>r.map(ri=>ri==1?'#':'.').join('')).join('\n'));	*/
	console.log(arr.map(r=>r.map(ri=>ri==1?'#':'.').join('')).join('\n'));
	console.log();
});
var out = arr.reduce((s,ar)=>s+ar.reduce((s,el)=>s+el,0),0);
console.log(out);
//console.log(arr.map(r=>r.map(ri=>ri==1?'#':'.').join('')).join('\n'));