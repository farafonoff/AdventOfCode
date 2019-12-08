//8   00:10:02   588      0   00:17:09   365      0
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
let dims = [3,2];
let data = '123456789012';
let sol1 = (dims, data) => {
    let ls = dims.reduce((cv,pv)=>cv*pv,1);
    let ns = data.split('');
    let lc = ns.length/ls;
    let fz = Infinity;
    let ans = 0;
    for(let ln = 0;ln<lc;++ln) {
        let ld = ns.slice(ln*ls, ln*ls+ls);
        //console.log(ld.join(''));
        let nz = ld.reduce((pv,cv) => cv === '0'?pv+1:pv,0);
        if (nz<fz) {
            let n1 = ld.reduce((pv,cv) => cv === '1'?pv+1:pv,0);
            let n2 = ld.reduce((pv,cv) => cv === '2'?pv+1:pv,0);
            let m12 = n1*n2;
            //console.log(nz, fz, n1, n2, ans)
            ans = m12;
            fz = nz;
        }
    }
    return ans;
}
let sol2 = (dims, data) => {
    let ls = dims.reduce((cv,pv)=>cv*pv,1);
    let ns = data.split('');
    let lc = ns.length/ls;
    let rimg;
    for(let ln = 0;ln<lc;++ln) {
        let ld = ns.slice(ln*ls, ln*ls+ls);
        if (!rimg) {
            rimg = ld;
            continue;
        }
        rimg = rimg.map((rv, idx) => {
            if (rv === '2') {
                return ld[idx];
            }
            return rv;
        })
    }
    for(let rn = 0;rn < dims[1];++rn) {
        let rd = rimg.slice(rn*dims[0],(rn+1)*dims[0]);
        console.log(rd.map(dg => {
            if (dg === '0') return '_';
            if (dg === '1') return '#';
        }).join(''));
    }
    //console.log(rimg);
    //return ans;
}
//console.log(sol1(dims, data));
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

contents.forEach(line => {
    console.log(sol1([25,6], line));
    sol2([25,6], line)
})
