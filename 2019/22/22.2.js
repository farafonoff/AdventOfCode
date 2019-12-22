const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const bi = require('big-integer')
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

let seqa = [

]

let mi2 = (x, m) => expmod(x, m-2, m);

contents.forEach(line => {
    let words = line.split(' ');
    if (words[0] === 'cut') {
        seq = [0, Number(words[1])];
    } else
    if (words[2] === 'increment') {
        seq = [1, Number(words[3])];
    } else
    if (words[2] === 'new') {
        seq = [2];
    }
    seqa.push(seq);
})
let DECKLEN = bi(119315717514047);
let NTIMES = bi(101741582076661);
let itpos = 2020;
let tpos = bi(itpos);
seqa = seqa.reverse();
let vals = [tpos];
for(let iter = 0;iter<4;++iter) {
    seqa.forEach((op, idx) => {
        switch (op[0]) {
            case 0: {
                tpos = tpos.add(DECKLEN).add(bi(op[1])).mod(DECKLEN);
                break;
            }
            case 1: {
                /*let bpos = tpos;
                for (let it = 0; it < op[1]; ++it) {
                    if (bpos % op[1] === 0) {
                        break;
                    }
                    bpos += DECKLEN;
                }
                let ntpos = bpos / op[1];*/
                let ntpos = bi(op[1]).modInv(DECKLEN).times(tpos).mod(DECKLEN);
                //console.log(tpos, ntpos, ntpos * op[1] % DECKLEN)
                tpos = ntpos;
                break;
            }
            case 2: {
                //console.log(tpos, DECKLEN)
                tpos = tpos.negate().subtract(1).add(DECKLEN);
                //console.log(tpos)
                break;
            }
        }
        //console.log(idx, op, tpos)
    })
    vals.push(tpos)
    //console.log(iter, tpos)
}
let X = vals[0]
let Y = vals[1];
let Z = vals[2];
let A = Y.subtract(Z).multiply(X.subtract(Y).modInv(DECKLEN)).mod(DECKLEN).add(DECKLEN).mod(DECKLEN)
//A = A.mod(DECKLEN);
let B = Y.subtract(A.multiply(X)).mod(DECKLEN).add(DECKLEN).mod(DECKLEN);
let AF = A.modPow(NTIMES, DECKLEN);
BF = B.multiply(
    AF.subtract(1)
    .multiply(A.subtract(1).modInv(DECKLEN))
).mod(DECKLEN);
//console.log(A, B, AF, BF);
console.log(AF.multiply(X).add(BF).mod(DECKLEN).toString());
//let B1 = Z.subtract(A.multiply(Y)).mod(DECKLEN);
//console.log(A, B, B1)
//console.log(vals[1], A.multiply(vals[0]).add(B).mod(DECKLEN))
//console.log(vals)
//console.log(vals[2] - vals[1])
