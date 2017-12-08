const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/)/*.map(Number)*/);

let cpu = {
    regs: {},
    r: function(reg) {
        return this.regs[reg] || 0;
    },
    max: function() {
        let vals = [];
        Object.keys(this.regs).forEach(key => {
            vals.push(this.regs[key]);
        })
        return Math.max.apply(Math, vals);
    },
    inc: function(reg, val) {
        this.regs[reg] = this.r(reg) + val;
    },
    dec: function(reg, val) {
        this.regs[reg] = this.r(reg) - val;
    },
    '==': function(reg, val) {
        return this.r(reg) === val;
    },
    '>': function (reg, val) {
        return this.r(reg) > val;
    },
    '<': function (reg, val) {
        return this.r(reg) < val;
    },
    '>=': function (reg, val) {
        return this.r(reg) >= val;
    },
    '<=': function (reg, val) {
        return this.r(reg) <= val;
    },
    '!=': function (reg, val) {
        return this.r(reg) != val;
    },
    compute: function(line) {
        let r1 = line[0];
        let op = line[1];
        let val = Number(line[2]);
        let r2 = line[4];
        let cmp = line[5];
        let cval = Number(line[6]);
        if (this[cmp].call(this, r2, cval)) {
            this[op].call(this, r1, val);
        }
    }
};

let allvals = [];
contents.forEach(line => {
    cpu.compute(line);
    allvals.push(cpu.max());
})
console.log(`Part 1 : ${cpu.max()}`);
console.log(`Part 2 : ${Math.max.apply(Math, allvals)}`);