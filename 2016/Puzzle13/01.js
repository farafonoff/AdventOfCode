//You achieved rank 66
//You achieved rank 48
const fs = require('fs');
const hashmap = require('hashmap');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var in1 = 1352;

function nb(i)
{
     // Java: use >>> instead of >>
     // C or C++: use uint32_t
     i = i - ((i >>> 1) & 0x55555555);
     i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
     return (((i + (i >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}
function vp(x,y) {
	var eq = x*x + 3*x + 2*x*y + y + y*y;
	eq+=in1;
	return eq;
}

function chadd(m1,map, x,y, l) {
	if (x>=0&&y>=0) {
		if (map.has([x,y])||m1.has([x,y])) return false;
		if (nb(vp(x,y))%2==0) {
			map.set([x,y],l);
		}
	}
}

var ope = new hashmap();
var clo = new hashmap();
var iter = 0;
var ans2 = 0;
ope.set([1,1], 0);
function djk() {
  ++iter;
	ope.forEach((v,k)=>{
		ope.remove(k);
		clo.set(k,v);
		var x=k[0];
		var y=k[1];
		var l=v;
		chadd(clo, ope, x+1, y, l+1);
		chadd(clo, ope, x, y+1, l+1);
		chadd(clo, ope, x-1, y, l+1);
		chadd(clo, ope, x, y-1, l+1);
	});
    if (iter==51) {
      ans2 = clo.count();
    }
}


while(!clo.has([31,39])||iter<52) {
	djk();
}

console.log(clo.get([31,39]));

/*var ans = 0;
ope.forEach((v,k)=>{
	if (v<=50) ++ans;
})
clo.forEach((v,k)=>{
	if (v<=50) ++ans;
})i
console.log(ans);*/
console.log(ans2);

