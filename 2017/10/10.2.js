const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

let elements = 256;

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input.2', 'utf8').split("\n").map(s => s.trim());
let suffix = [17, 31, 73, 47, 23];

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

function hash(lengths) {
    let list = [];
    let cp = 0;
    let ss = 0;
    for(let i=0;i<elements;++i) {
        list.push(i);
    }
    //console.log(list);
    for(let r = 0;r<64;++r) {
        lengths.forEach(len => {
            let start = cp;
            let end = start + len - 1;
            //console.log(`${start} ${end}`)
            while(start < end) {
                let tmp = list[start%elements];
                list[start%elements] = list[end%elements];
                list[end%elements] = tmp;
                ++start;
                --end;
            }
            cp += len + ss;
            ss += 1;
            //console.log(list);        
        })    
    }
    //dense it
    let result = new Array(16);
    result.fill(0,0,result.length);
    for(let i=0;i<16;++i) {
        for(let j=0;j<16;++j) {
            result[i] = result[i]^list[i*16+j];
        }
    }
    let answer = "";
    result.forEach(r => {
        answer += decimalToHex(r);
    })
    console.log(result);
    return answer;
    //return list[0]*list[1];
}

contents.forEach(line => {
    let inp = line.split('').map(s => s.charCodeAt(0));
    inp = inp.concat(suffix);
    console.log(hash(inp));
    //console.log(hash(line));
})
