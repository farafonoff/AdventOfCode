//You got rank 128
//You got rank 115

const fs = require('fs');

var decode = function(s) { let t = s.split(' '); return {op: t[0], args: t.slice(1)}; }


function solve(part) {
	var contents = fs.readFileSync('input', 'utf8').split("\n").map(s=>s.trim()).filter(s=>!!s).map(decode);
	var lines = contents;

	var cpu = {
	  jio: function (reg, offs) { var offs = Number(offs); if (this.regs[reg]==1) this.counter+=Number(offs); else this.counter+=1; },
	  jie: function(reg, offs) { var offs = Number(offs); if (this.regs[reg]%2==0) this.counter+=Number(offs); else this.counter+=1; },
	  jmp: function(offs) { var offs = Number(offs); this.counter+=Number(offs); },
	  inc: function (reg) { this.regs[reg] +=1; this.counter+=1; },
	  dec: function (reg) { this.regs[reg] -=1; this.counter+=1; },
	  tpl: function(reg) { this.regs[reg] *=3; this.counter+=1; },
	  hlf: function(reg) { this.regs[reg] /=2; this.counter+=1; },
	  cpy: function(val, reg) { this.regs[reg] = this.v(val); this.counter+=1; },
	  jnz: function(cond,offs) { if (this.v(cond)!=0) this.counter+=Number(offs); else this.counter+=1; },
	  v: function(v) {
		  if (isNaN(v)) return this.regs[v]; else return Number(v);
	  },
	  counter: 0,
	  regs: {a:0, b:0, c:part==2?1:0, d:0}
	}
	var ic = 0;

	while(lines[cpu.counter]) {
	  var op = lines[cpu.counter];
	  //console.log(cpu.counter, op);
	  try {
		cpu[op.op].apply(cpu, op.args);
	  } catch (err) {
		//console.log(err,' at ', ic, cpu, op);
	  }
	  //console.log(ic,cpu.regs.a, cpu.regs.b, cpu.regs.c, cpu.regs.d)
		++ic;
	   //if (ic==50) break;
	}
	return cpu;
}
console.log(solve(1));
console.log(solve(2));
