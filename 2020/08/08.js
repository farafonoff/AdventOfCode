const { exec } = require('child_process');
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(' ')).map(cl => [cl[0], Number(cl[1])]);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const ops = {
    jmp: (cpu, arg) => ({ ...cpu, pc: cpu.pc+arg }),
    nop: (cpu, arg) => ({ ...cpu, pc: cpu.pc+1 }),
    acc: (cpu, arg) => ({ acc: cpu.acc + arg, pc: cpu.pc+1 })
}

function cexec(cpu, code) {
    const op = code[cpu.pc]
    if (!op) {
        throw cpu
    }
    const ncpu = ops[op[0]](cpu, op[1])
    return ncpu;
}

function runcode(code) {
    let cpu = { acc: 0, pc: 0 }
    const loopd = {}
    for(let i=0;i<1000000000;++i) {
        if (loopd[cpu.pc]) {
            return cpu;
        }
        loopd[cpu.pc] = cpu;
        cpu = cexec(cpu, code);
    }
}

console.log(runcode(contents))


try {
  contents.forEach((op, idx) => {
    const patched = _.cloneDeep(contents);
    if (op[0] === "nop") {
      patched[idx][0] = "jmp";
    }
    if (op[0] === "jmp") {
      patched[idx][0] = "nop";
    }
    runcode(patched);
  });
} catch (endcpu) {
  console.log(endcpu);
}
