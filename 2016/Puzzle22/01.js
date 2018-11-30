//You got rank 129
//You achieved rank 43
const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");


///dev/grid/node-x0-y0     93T   68T    25T   73%
var re = /\/dev\/grid\/node-x(\d+)-y(\d+)\s+(\d+)T\s+(\d+)T\s+(\d+)T\s+(\d+)%/i

var data = contents.map(s=>re.exec(s)).filter(m=>!!m).map(m=>({x:Number(m[1]), y:Number(m[2]), u:Number(m[4]), a: Number(m[5])}))
var gx = data.reduce((m,n)=>n.x>m?n.x:m, 0);
var gy = data.reduce((m,n)=>n.y>m?n.y:m, 0);
console.log(gx,gy);

var matrix = []

var ans = 0;
//console.log(data);
var nf;
data.forEach(na=>{
	matrix[na.y] = matrix[na.y]||[]
	matrix[na.y][na.x] = na.u==0?'_':(na.u>100?'#':'.')
	if (matrix[na.y][na.x]=='_') {
		nf = Object.assign({},na);
	}
	data.forEach(nb=>{
		if (na.u>0&&na!=nb&&na.u<=nb.a) {
			++ans;
		}
		
	})
})

matrix[0][gx] = 'G';

console.log(ans);
console.log(gx*gy);
var steps = 0;
while(nf.y>=0&&nf.x<gx-1) {
	if (nf.y==0) {
		nf.x++;
		matrix[nf.y][nf.x]='_';
	} else 
	if (matrix[nf.y-1][nf.x]=='.')
	{
		nf.y-=1;
		matrix[nf.y][nf.x]='_';
	} else
	if (matrix[nf.y-1][nf.x]=='#')
	{
		nf.x-=1;
		matrix[nf.y][nf.x]='_';
	}
	steps++;
}
console.log(steps,nf);
matrix.forEach(mx=>console.log(mx.join('')));

console.log(steps+gx+(gx-1)*4);