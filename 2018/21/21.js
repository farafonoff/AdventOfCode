// 21   00:32:13   169      0   04:42:08   792      0
// optimized input via divi
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
    {
        m: 'divi', a: (args, rs) => {
            let result = [...rs];
            checkRange(args[1], 0, 3)
            checkRange(args[2], 0, 3)
            checkRange(args[3], 0, 3)
            result[args[3]] = (Math.floor(rs[args[1]]/args[2]));
            return result;
        }
    },
]
let debugg = []
let hm = new HM();
let pout = 0;
let out = 0;
function exec(ip, program, iregs, limit) {
    let regs = iregs;
    let iter = 0;
    while (regs[ip] < program.length && regs[ip] >= 0) {
        let ipn = regs[ip];
        let cmd = program[regs[ip]];
        if (cmd[0]>=0) {
            //console.log(regs, cmd);
            //debugg[ipn] = [regs]
            if (cmd[1][0]===15) { //eqrr
                //console.log(cmd, regs)
                pout = out;
                out = regs[cmd[1][1]];
                if (pout === 0) {
                    console.log('Part1: ', out)
                }
                if (!hm.has(out)) {
                    hm.set(out, pout);
                } else {
                    console.log('loop', pout, out, hm.get(out));
                    console.log('Part2: ', pout);
                    break;
                }
                //console.log('################')
            }
            regs = opcodes[cmd[0]].a(cmd[1], regs);
            //console.log(opcodes[cmd[0]].m, cmd[1], regs);
            /*debugg[ipn].push(cmd)
            debugg[ipn].push(regs)
            debugg[ipn].push(ipn)*/
        }
        ++regs[ip];
        //debugg[ipn].push(regs[ip])        
        ++iter;
        if (iter > limit) {
            return regs;
        }
        /*if (iter%100==0) {
            debugg.forEach((d, di) => {
                console.log(di, d);
            })
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

//console.log(exec(ipa, program, 0, Infinity));
//console.log(program)
exec(ipa, program, [ 0, 0, 0, 0, 0, 0 ], Infinity);


    
