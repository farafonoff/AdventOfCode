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

let seqa = [

]

contents.forEach(line => {
    let words = line.split(' ');
    //console.log(words)
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
//console.log(seqa)
let DECKLEN = 10007;
let deck = []
for(let i=0;i<DECKLEN;++i) deck.push(i);
seqa.forEach((op, idx) => {
    switch(op[0]) {
        case 0: {
            if (op[1]<0) {
                op[1] = DECKLEN + op[1];
            }
            //console.log(op[1])
            deck = [...deck.slice(op[1]), ...deck.slice(0, op[1])];
            break;
        }
        case 1: {
            let incr = op[1];
            let tpos = 0;
            let newDeck = []
            for(let i=0;i<DECKLEN;++i) {
                newDeck[tpos] = deck[i];
                tpos = (tpos+incr)%DECKLEN;
            }
            deck = newDeck;
            break;
        }
        case 2: {
            deck = deck.reverse();
            break;
        }
    }
    //console.log(idx, deck)
})
console.log(deck.indexOf(2019))