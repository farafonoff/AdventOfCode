//You got rank 131
//You got rank 106

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var input = "lpvhkcbi";

var md5s = new hashmap();

var ans1 = false;
var ans2 = false;

function chadd(m1,m2,x,y,p,pc,nc) {
	if (x>0&&y>0&&x<5&&y<5) {
		var pk = md5s.get(p)||md5(p);
		md5s.set(p,pk);
		var kc = pk.charAt(nc);
		if (kc>'a') {
			var np = p+pc;
			nk = [x,y,np];
			//console.log(nk, pk);
			if (m1.has(nk)||m2.has(nk)) {
				return;
			} else {
				if (x==4&&y==4) {
					if (!ans2||ans2.length<np.length) {
						ans2 = np.slice(input.length);
					}
					if (!ans1||ans1.length>np.length) { //part 1 here
						ans1 = np.slice(input.length);
						console.log(ans1, ans1.length);
					}
					m1.set(nk,np);
				} else {
					m2.set(nk,np);
				}
			}
		}
	}
}

var ope = new hashmap();
var clo = new hashmap();
var iter = 0;
var ans2 = 0;
ope.set([1,1, input], input);
function djk() {
  ++iter;
	ope.forEach((v,k)=>{
		ope.remove(k);
		clo.set(k,v);
		var x=k[0];
		var y=k[1];
		var l=v;
		chadd(clo, ope, x+1, y, l, "R",3);
		chadd(clo, ope, x, y+1, l, "D",1);
		chadd(clo, ope, x-1, y, l, "L",2);
		chadd(clo, ope, x, y-1, l, "U",0);
	});
}

while(ope.count()>0) djk();

console.log(ans2, ans2.length);