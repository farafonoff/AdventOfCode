//You achieved rank 71

var PQ = require('js-priority-queue');
var HashMap = require('hashmap');

const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");


console.log("hello world")

//var floors = [['HM','LM'],['HG'], ['LG'],[]];
//var ic = 4;
//var istate = {s:floors,l:0,ef:0};
//var floors = [['EG','EM','DG','DM'],[], [],['HM','LM','HG','LG']];
//var ic = 8;
//var istate = {s:floors,l:11,ef:3};

//var floors = [['OG','OM'],['CG','UG','RG','PG'],['CM','UM','RM','PM'],[]];
//var ic = 10;
function solve(part) {
	if (part==0) {
		var floors = [['HM','LM'],['HG'], ['LG'],[]];
		var ic = 4;
	}
	if (part==1) {
		var floors = [['OG','OM'],['CG','UG','RG','PG'],['CM','UM','RM','PM'],[]];
		var ic = 10;
	}
	if (part==2) {
		var floors = [['OG','OM','EG','EM','DG','DM'],['CG','UG','RG','PG'],['CM','UM','RM','PM'],[]];
		var ic = 14;
	}
	var istate = {s:floors,l:0,ef:0};

	//var floors = [['EG','EM','DG','DM'],[],[],['CG','UG','RG','PG','OG','OM','CM','UM','RM','PM']];
	//var ic = 14;
	//var istate = {s:floors,l:33,ef:3};


	function hash(state) {
          var em = state.s.reduce((m, fl,fli)=>fl.reduce((m,it)=>{
            var c1 = it.charAt(0);
            var c2 = it.charAt(1);
            var v = m.get(c1)||[];
            if (c2=='M') {
              v[0] = fli;
            }
            if (c2=='G') {
              v[1] = fli;
            }
            m.set(c1, v);
            return m;
          }, m), new Map());
          var vals = [];
          em.forEach((v,k)=> {
            vals.push(v);
          });
          vals.sort((v1,v2)=>v1[0]==v2[0]?v1[1]-v2[1]:v1[0]-v2[0]);
          var hs = {p:vals, e: state.ef};
          //console.log(hs);
          return JSON.stringify(hs);
	}

	function heur(state) {
		var fl = state.s;
		var heur = fl
		.reduce(
			(s,flo,fli)=>s+flo.reduce(
				(sf,f)=>
					sf+(3-fli)
				,0) 
		,0);
		return state.l+heur-state.ef;
	}

	function dc(state) {
		return Object.assign({},state,{s:state.s.map(r=>r.slice(0))});
	}

	function hc(state1,state2) {
		return state1.h-state2.h;
	}

	var ope = new HashMap();
	var opeh = new PQ({comparator: hc});
	var clo = new HashMap();

	istate.h = heur(istate);
	ope.set(hash(istate),dc(istate));
	opeh.queue(istate);

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
			state.ef = nef;
			state.h = heur(state);		
			if (isFinal(state)) {
				if (ans==null||ans.l>state.l) {
					//console.log(state);
					ans = dc(state);
				}
			}		
			if (!check(fl[ef])) return false;
			ef = nef;		
			if (!check(fl[ef])) return false;
			return true;
		}
	}

	function djk() {
		var lv = opeh.dequeue();
		var v = lv;
		var s = v.s;
		var l = v.l;
		var ef = v.ef;
		var k = hash(v);
		s[ef].forEach((it,ii)=>{
			s[ef].forEach((it1,ii1)=>{
				if (ii==ii1) return;
				[1,-1].forEach(dir=>{
					var sn = dc(v);
					var ok = mv(sn,dir,ii,ii1);
					var hh = hash(sn);
					if (ok&&!ope.has(hh)&&!clo.has(hh)) {
						ope.set(hh,sn);
						opeh.queue(sn);
					}
				})				
			});
			[1,-1].forEach(dir=>{
				var sn = dc(v);
				var ok = mv(sn,dir,ii,null);
				var hh = hash(sn);
				if (ok&&!ope.has(hh)&&!clo.has(hh)) {
					ope.set(hh,sn);
					opeh.queue(sn);
				}
			})
		})
		clo.set(k,v);
		ope.remove(k);
	}
	while(opeh.length>0) {
		djk();
		//console.log(opeh.peek());
	}

	console.log("")
	console.log(ans);
        console.log(hash(ans));
}

solve(0)
solve(1)
solve(2)
