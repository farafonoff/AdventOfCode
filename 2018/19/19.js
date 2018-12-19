//  19   00:22:38   323      0   01:31:21   318      0
// part2 solved by careful debugging
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var checkRange = () => {}
let opcodes = [
    {
        m: 'addr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] + rs[args[2]]
            return result;
        }
    },
    {
        m: 'addi', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] + args[2]
            return result;
        }
    },
    {
        m: 'mulr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] * rs[args[2]]
            return result;
        }
    },
    {
        m: 'muli', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] * args[2]
            return result;
        }
    },
    {
        m: 'banr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] & rs[args[2]]
            return result;
        }
    },
    {
        m: 'bani', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] & args[2]
            return result;
        }
    },
    {
        m: 'borr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] | rs[args[2]]
            return result;
        }
    },
    {
        m: 'bori', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]] | args[2]
            return result;
        }
    },
    {
        m: 'setr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = rs[args[1]]
            return result;
        }
    },
    {
        m: 'seti', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[3], 0, 3)
            result[args[3]] = args[1]
            return result;
        }
    },
    {
        m: 'gtir', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (args[1]>rs[args[2]])?1:0;
            return result;
        }
    },
    {
        m: 'gtri', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (rs[args[1]]>args[2])?1:0;
            return result;
        }
    },
    {
        m: 'gtrr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (rs[args[1]]>rs[args[2]])?1:0;
            return result;
        }
    },
    {
        m: 'eqir', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (args[1]===rs[args[2]])?1:0;
            return result;
        }
    },
    {
        m: 'eqri', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (rs[args[1]]===args[2])?1:0;
            return result;
        }
    },
    {
        m: 'eqrr', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (rs[args[1]]===rs[args[2]])?1:0;
            return result;
        }
    },
]
let debugg = []
function exec(ip, program, init, limit) {
    let regs = new Array(6).fill(0);
    regs[0] = init;
    let iter = 0;
    while(regs[ip]<program.length&&regs[ip]>=0) {
        let ipn = regs[ip];
        let cmd = program[regs[ip]];
        //console.log(regs, cmd);
        //debugg[ipn] = [regs]
        regs = opcodes[cmd[0]].a(cmd[1], regs);
        /*debugg[ipn].push(cmd)
        debugg[ipn].push(regs)
        debugg[ipn].push(ipn)*/
        ++regs[ip];
        //debugg[ipn].push(regs[ip])        
        ++iter;
        if (iter > limit) {
            return Math.max.apply(null,regs);
        }
        /*if (iter%1==0) {
            debugg.forEach((d, di) => {
                console.log(di, d);
            })
            debugg = []
        }*/
        /*if (regs[ip]===program.length-1) {
            console.log(regs)
        }
        if (regs[ip]===10) {
            console.log(regs);
        }*/
        /*if (cmd[2]==='seti'&&cmd[1][3]===ipa) {
            console.log(regs);
        }*/
    }
    return regs;
}

let ipre = /#ip (\d)/
let ipa = 0;
let program = []


contents.forEach(line => {
    //console.log(line);
    if (ipre.exec(line)) {
        ipa = Number(ipre.exec(line)[1]);
    } else {
        let cmd = line.split(' ');
        let opcode = _.findIndex(opcodes, { m: cmd[0] });
        let args = [opcode, ...cmd.slice(1).map(Number)]
        program.push([opcode, args, cmd[0]])
    }
})
function calcSumDivisors(num) {
    let ans = 0;
    for(let i=1;i*i<=num;++i) {
        if (num % i===0) {
            ans+=i;
            ans+=num/i;
        }
    }
    return ans;
}
//console.log(exec(ipa, program, 0, Infinity));
console.log(calcSumDivisors(exec(ipa, program, 0, 40)));
console.log(calcSumDivisors(exec(ipa, program, 1, 40)));


