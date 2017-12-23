const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

let cpu = {
    regs: {a:1,b:0,c:0,d:0,e:0,f:0,g:0,h:0},
    sound: 0,
    pc: 0,
    halt: false,
    mulz: 0,
    val: function(v) {
        let num = Number(v);
        if (isNaN(num)) {
            return this.regs[v] || 0;
        } else {
            return num;
        }
    },
    set: function (reg, val) {
        this.regs[reg] = this.val(val);
        ++this.pc;
    },
    add: function(reg, val) {
        this.regs[reg] += this.val(val);
        ++this.pc;
    },
    sub: function(reg, val) {
        this.regs[reg] -= this.val(val);
        ++this.pc;
    },
    mul: function(reg, val) {
        this.regs[reg] *= this.val(val);
        ++this.mulz;
        ++this.pc;
    },
    mod: function(reg, val) {
        this.regs[reg] = this.regs[reg]%this.val(val);
        ++this.pc;
    },
    rcv: function(val) {
        if (this.val(val)>0) {
            console.log(this.sound);
            this.halt = true;
        }
        ++this.pc;
    },
    snd: function(val) {
        this.sound = this.val(val);
        ++this.pc;
    },
    jgz: function(cond, val) {
        if (this.val(cond)>0) {
            this.pc += this.val(val);
        } else {
            this.pc+=1;
        }
    },
    jnz: function(cond, val) {
        if (this.val(cond)!=0) {
            this.pc += this.val(val);
        } else {
            this.pc+=1;
        }
    },
    nop: function() {
        this.pc+=1;
    },
    jnza: function(cond, val) {
        if (this.val(cond)!=0) {
            this.pc = this.val(val);
        } else {
            this.pc+=1;
        }
    },
}

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/));
console.log(contents)
while(cpu.pc < contents.length) {
    let line = contents[cpu.pc];
    let db = 0;
    let instr;
    if (line[0] == '*') {
        db = 1;
        console.log(cpu);
    }
    if (line[0] == '-') {
        db = 1;
        instr = 'nop'
    } else {
        instr = line[db];
    }
    if (line[0] == 'b') {
        db = 1;
        break;
    }
    
    cpu[instr].apply(cpu, line.slice(db+1))
}
console.log(cpu)