//16   00:35:00   296      0   00:47:28   178      0
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

var contents = fs.readFileSync('input1', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
checkRange = (v,a,b) => {if (v<a||v>b) throw 'Argument out of range';}
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

opcodes.forEach((o,i) => {
    o.i = i;
});

let candidates = []
opcodes.forEach((opcode,idx) => {
    candidates[idx] = opcodes.map((opcode) => opcode.i);
})

var rb=/Before: (\[.*\])/
var ra=/After:  (\[.*\])/

let r1 = 0;
contents.forEach((line,idx) => {
    if (line.startsWith('Before')) {
        let before = JSON.parse(rb.exec(line)[1]);
        let after = JSON.parse(ra.exec(contents[idx+2])[1]);
        let cmd = contents[idx+1].split(' ').map(Number)
        //console.log(cmd, before, after);
        let matches = [];
        opcodes.forEach(opcode => {
            try {
                let result = opcode.a(cmd, before);
                if (_.isEqual(result, after)) {
                    matches.push(opcode)
                }
            }
            catch (ex) {

            }
        })
        let mapp = candidates[cmd[0]];
        candidates[cmd[0]] = mapp.filter(mp => {
            let found = _.find(matches, {i: mp});
            return !!found;
        })
        //console.log(matches.map(opcode => opcode.m).join(', '))
        if (matches.length>=3) r1 += 1;
    }
})

console.log(r1);
for(let i=0;i<opcodes.length;++i) {
    for(let j=0;j<opcodes.length;++j) {
        if (candidates[j].length === 1) {
            candidates.forEach((mp, idx) => {
                if (idx!=j) {
                    candidates[idx] = mp.filter(v=>v!=candidates[j][0])
                }
            })
        }
    }
}
candidates = candidates.map(v => v[0])
console.log(candidates)
contents = fs.readFileSync('input2', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let regs = [0,0,0,0]
contents.forEach(cmd => {
    regs = opcodes[candidates[cmd[0]]].a(cmd, regs);
})
console.log(regs[0])
