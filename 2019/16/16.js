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

let precalcCoefs = (len) => {
    let data = [];
    for(let i=0;i<len;++i) {
        let row = [];
        for(let j=0;j<i;++j) {
            row.push(0)
        }
        while(row.length < len) {
            for(let j=0;j<i+1;++j) {
                row.push(1)
            }
            for(let j=0;j<i+1;++j) {
                row.push(0)
            }
            for(let j=0;j<i+1;++j) {
                row.push(-1)
            }
            for(let j=0;j<i+1;++j) {
                row.push(0)
            }
        }
        row = row.slice(0, len);
        data.push(row)
    }
    return data;
}

let phase = (sig, mul) => {
    let result = [];
    for(let i=0;i<sig.length;++i) {
        result[i] = 0;
        for(let j=0;j<sig.length;++j) {
            result[i]+=sig[j]*mul[i][j];
        }
        result[i] = Math.abs(result[i])%10;
    }
    return result;
}

contents.forEach(line => {
    let data = line.split('').map(Number)
    let mul = precalcCoefs(data.length)
    for(let i=0;i<100;++i) {
        //console.log(i, data)
        data = phase(data, mul)
    }
    console.log(data.slice(0,8).join(''))
})

contents.forEach(line => {
    let data = line.split('').map(Number)
    let buffer = line.repeat(10000).split('').map(Number)
    let offset = (Number(data.slice(0,7).join('')))
    for(let phase = 0; phase < 100; ++phase) {
        for(let i=buffer.length-1;i>=offset;--i) {
            if (i<buffer.length-1) {
                buffer[i] += buffer[i+1]
            }
            buffer[i] = Math.abs(buffer[i])%10;
        }
    }
    console.log(buffer.slice(offset, offset+8).join(''))
})
