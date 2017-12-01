const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n");

let puz = 2;

function cnext(list, pos) {
    let op = pos;
    if (puz === 1) {
        op += 1;
    }
    if (puz === 2) {
        op+=list.length/2;
    }
    op = op%list.length;
    return op;
}

console.log(contents[0]);
contents.forEach(is => {
    let as = is.trim().split('');
    let a = as.reduce((pv, cv,i,list) => {
        let next = list[cnext(list, i)];
        if (next === cv) {
            pv.s+=Number(cv);
        }
        return pv;
    }, {s:0,ch:''});
    console.log(a);
})
