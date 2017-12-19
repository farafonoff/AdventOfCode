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

function Q() {
    this.q = [];
    this.length = 0;
    this.dequeue = function() {
        let v = this.q[0];
        this.q.splice(0,1);
        --this.length;
        return v;
    }
    this.queue = function(v) {
        this.q.push(v);
        ++this.length;
    }
    this.peek = function(v) {
        return this.q[0];
    }
}

function Cpu(pid) {
    Object.assign(this, {
        regs: {
            p: pid
        },
        queue: new Q(),
        sound: 0,
        pc: 0,
        sends: 0,
        deadlock: false,
        val: function (v) {
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
        add: function (reg, val) {
            this.regs[reg] += this.val(val);
            ++this.pc;
        },
        mul: function (reg, val) {
            this.regs[reg] *= this.val(val);
            ++this.pc;
        },
        mod: function (reg, val) {
            this.regs[reg] = this.regs[reg] % this.val(val);
            ++this.pc;
        },
        rcv: function (val) {
            //console.log('rcv', this.regs['p'], this.queue.length)
            if (this.queue.length > 0) {
                this.regs[val] = this.queue.dequeue();
                ++this.pc;
            } else {
                this.deadlock = true;
            }
        },
        snd: function (val) {
            ++this.pc;
            let v = this.val(val);
            //console.log(this.regs['p'], v);
            this.sends++;
            return this.val(v);
        },
        jgz: function (cond, val) {
            if (this.val(cond) > 0) {
                this.pc += this.val(val);
            } else {
                this.pc += 1;
            }
        },
        q: function(val) {
            this.queue.queue(val);
            this.deadlock = false;
        }

    });
}

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/));

let cpus = [new Cpu(0), new Cpu(1)];
while(!(cpus[0].deadlock&&cpus[1].deadlock)) {
    let cpu = cpus[0];
    while(!cpu.deadlock) {
        let line = contents[cpu.pc];
        let instr = line[0];
        let res = cpu[instr].apply(cpu, line.slice(1))
        if (instr === 'snd') {
            cpus[1].q(res);
        }
    }
    //console.log(cpus);
    cpu = cpus[1];
    while(!cpu.deadlock) {
        let line = contents[cpu.pc];
        let instr = line[0];
        let res = cpu[instr].apply(cpu, line.slice(1))
        if (instr === 'snd') {
            cpus[0].q(res);
        }
    }
    //console.log(cpus);
}
console.log(cpus[1].sends);