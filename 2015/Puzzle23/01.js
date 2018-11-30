const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var lines = contents;

var cpu = {
  jio: function (reg, offs) { var offs = Number(offs); if (this.regs[reg]==1) this.counter+=Number(offs); else this.counter+=1; },
  jie: function(reg, offs) { var offs = Number(offs); if (this.regs[reg]%2==0) this.counter+=Number(offs); else this.counter+=1; },
  jmp: function(offs) { var offs = Number(offs); this.counter+=Number(offs); },
  inc: function (reg) { this.regs[reg] +=1; this.counter+=1; },
  tpl: function(reg) { this.regs[reg] *=3; this.counter+=1; },
  hlf: function(reg) { this.regs[reg] /=2; this.counter+=1; },
  counter: 0,
  regs: {a:1, b:0}
}
var decode = function(s) { return {op: s.substring(0,3), args: s.substring(4).split(', ')}; }

var ic = 0;

while(lines[cpu.counter]!='') {
  var op = decode(lines[cpu.counter]);
  console.log(cpu.counter, lines[cpu.counter]);
  try {
    cpu[op.op].apply(cpu, op.args);
  } catch (err) {
    console.log(err,' at ', ic, cpu, op);
  }
  console.log(ic,cpu.regs.a, cpu.regs.b)
    ++ic;
}
