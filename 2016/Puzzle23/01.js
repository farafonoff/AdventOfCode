//You achieved rank 83
//You achieved rank 32

const fs = require('fs');
const hashmap = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var decode = function(s) { let t = s.split(' '); return {op: t[0], args: t.slice(1)}; }


function solve(part) {
	var contents = fs.readFileSync('input', 'utf8').split("\n").map(s=>s.trim()).filter(s=>!!s).map(decode);
	var lines = contents;

	var cpu = {
	  nop: function() {this.counter+=1},
	  add: function(reg,v1) {this.regs[reg]+=this.v(v1);this.counter+=1},
	  sub: function(reg,v1) {this.regs[reg]+=this.v(v1);this.counter+=1},
	  mmul: function(reg,v1) {this.regs[reg]*=this.v(v1);this.counter+=1},
	  jio: function (reg, offs) { var offs = this.v(offs); if (this.regs[reg]==1) this.counter+=this.v(offs); else this.counter+=1; },
	  jie: function(reg, offs) { var offs = this.v(offs); if (this.regs[reg]%2==0) this.counter+=this.v(offs); else this.counter+=1; },
	  jmp: function(offs) { var offs = this.v(offs); this.counter+=this.v(offs); },
	  inc: function (reg) { this.regs[reg] +=1; this.counter+=1; },
	  dec: function (reg) { this.regs[reg] -=1; this.counter+=1; },
	  tpl: function(reg) { this.regs[reg] *=3; this.counter+=1; },
	  hlf: function(reg) { this.regs[reg] /=2; this.counter+=1; },
	  cpy: function(val, reg) { this.regs[reg] = this.v(val); this.counter+=1; },
	  jnz: function(cond,offs) { if (this.v(cond)!=0) this.counter+=this.v(offs); else this.counter+=1; },
	  tgl: function(val) {
			var trg = this.v(val);
			//console.log(val, trg);
			if (trg!=0) {
			  let trgop = lines[trg+this.counter];
			  if (trgop!=undefined) {
				  if (trgop.args.length==1) {
					  if (trgop.op=='inc') trgop.op='dec';
					  else trgop.op='inc';
				  }
				  if (trgop.args.length==2) {
					  if (trgop.op=='jnz') trgop.op='cpy';
					  else trgop.op='jnz';
				  }
			  }
				//console.log(trgop);			  
			}
			this.counter++;
	  },
	  v: function(v) {
		  if (isNaN(v)) return this.regs[v]; else return Number(v);
	  },
	  counter: 0,
	  regs: {a:part==1?7:12, b:0, c:0, d:0}
	}
	var ic = 0;

	while(lines[cpu.counter]) {
	  var op = lines[cpu.counter];
	  //console.log(cpu.counter, op, cpu.regs);
	  try {
		cpu[op.op].apply(cpu, op.args);
	  } catch (err) {
		//console.log(err,' at ', ic, cpu, op);
	  }
	  //console.log(ic,cpu.regs.a, cpu.regs.b, cpu.regs.c, cpu.regs.d)
		++ic;
	   //if (ic==50) break;
	}
	return cpu.regs;
}
console.log(solve(1));
console.log(solve(2));
