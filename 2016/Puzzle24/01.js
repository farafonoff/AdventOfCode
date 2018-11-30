//You achieved rank 55
//You achieved rank 51

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

var map = [];
var numbers = [];
var distances = [];
contents.forEach((cl,idx)=>{
	let cls = cl.split('');
	map[idx]=cls;
	cls.forEach((ch,idx1)=>{
		if (ch>='0'&&ch<='9') {
			numbers[Number(ch)]=[idx,idx1];
		}
	})
})

console.log(numbers);

function chadd(m1,m2,x,y,l,sn) {
	if (map[x][y]!='#') {
		let nk = [x,y];
		if (!m1.has(nk)&&!m2.has(nk)) {
			m2.set(nk,l);
			if(!isNaN(map[x][y])) {
				distances[sn][Number(map[x][y])] = l;
			}			
		}
	}
}
function djk(ope,clo,sn) {
	ope.forEach((v,k)=>{
		ope.remove(k);
		clo.set(k,v);
		var x=k[0];
		var y=k[1];
		var l=v+1;
		chadd(clo, ope, x+1, y, l, sn);
		chadd(clo, ope, x, y+1, l, sn);
		chadd(clo, ope, x-1, y, l, sn);
		chadd(clo, ope, x, y-1, l, sn);
	});
}

numbers.forEach((sp,idx)=>{
	let ope = new hashmap();
	let clo = new hashmap();
	ope.set(sp,0);
	distances[idx] = [];
	while(ope.count()>0) {
		djk(ope,clo,idx);
	}
	//console.log(clo);
})

console.log(distances);
function bf(perm,p,pv,part) {
	if (perm.length==0)
		return p+(part==2?distances[0][pv]:0);
	var ans = Infinity;
	perm.forEach(v=>{
		let pt = p+distances[pv][v];
		let av = bf(perm.filter(n=>n!=v),pt,v,part);
		ans = Math.min(ans,av);
	})
	return ans;
}
function solve(part) {
	var perm = numbers.map((v,idx)=>idx).filter(v=>v>0);
	return bf(perm,0,0,part);
}

console.log(solve(1));
console.log(solve(2));
