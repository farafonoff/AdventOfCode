//You achieved rank 71
const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");


console.log("hello world")

//var floors = [['HM','LM'],['HG'], ['LG'],[]];
//var ic = 4;
var floors = [['OG','OM','EG','EM','DG','DM'],['CG','UG','RG','PG'],['CM','UM','RM','PM'],[]];
var ic = 14;

function hash(state) {
	return state.s.map((f,idx)=>{
		return idx+f.sort().join('_');
	}).join('__')+"___"+state.ef;
}

function dc(state) {
	return Object.assign({},state,{s:state.s.map(r=>r.slice(0))});
}

var ope = new Map();
var clo = new Map();

var istate = {s:floors,l:0,ef:0};
ope.set(hash(istate),dc(istate));
function check(fl) {
	if (fl.length<2) return true;
	//console.log(fl);
	var em = new Map();
	var ng = 0;
	for(var i = 0;i<fl.length;i++) {
		var it = fl[i];
		var c1 = it.charAt(0);
		var c2 = it.charAt(1);
		if (c2=='M') {
			em.set(c1,(em.get(c1)||0)+1);
		}
		if (c2=='G') {
			em.set(c1,(em.get(c1)||0)-1);
			ng+=1;
		}
	}
	if (ng==0) {
		return true;
	}
	var result = true;
	//console.log(em);
	em.forEach((v,k)=>{
		if (v>0) result = false;
	})
	return result;
}

function isFinal(state) {
	return state.s[3].length==ic;
}

var ans = null;

function mv(state, dir, ii, ii1) {
	var ef = state.ef;
	var fl = state.s;
	var nef = ef+dir;
	if (nef>=0&&nef<fl.length) {
		var item = fl[ef][ii];
		fl[nef].push(item);
		if (ii1!==null) {
			item = fl[ef][ii1];
			fl[nef].push(item);
			fl[ef].splice(Math.max(ii,ii1),1);
			fl[ef].splice(Math.min(ii,ii1),1);
		} else {
			fl[ef].splice(ii,1);
		}
		state.l+=1;
		if (ans==null&&isFinal(state)) {
			console.log(state);
			ans = dc(state);
		}		
		if (!check(fl[ef])) return false;
		ef = nef;		
		if (!check(fl[ef])) return false;
		state.ef = ef;		
		return true;
	}
}

function djk() {
	ope.forEach((v,k)=>{
		//console.log(v);
		var s = v.s;
		var l = v.l;
		var ef = v.ef;
		s[ef].forEach((it,ii)=>{
			[1,-1].forEach(dir=>{
				var sn = dc(v);
				var ok = mv(sn,dir,ii,null);
				var hh = hash(sn);
				if (ok&&!ope.has(hh)&&!clo.has(hh)) {
					ope.set(hh,sn);
				}
			})
			s[ef].forEach((it1,ii1)=>{
				if (ii==ii1) return;
				[1,-1].forEach(dir=>{
					var sn = dc(v);
					var ok = mv(sn,dir,ii,ii1);
					var hh = hash(sn);
					if (ok&&!ope.has(hh)&&!clo.has(hh)) {
						ope.set(hh,sn);
					}
				})				
			})
		})
		clo.set(k,v);
		ope.delete(k);
	})
}
while(ope.size>0&&ans===null) {
	djk();
}

console.log("")
console.log(ans);