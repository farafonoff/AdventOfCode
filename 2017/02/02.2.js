const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

let a = contents.reduce((pv, cv) => {
    let dn = 0;
    let dd = 0;
    cv.forEach((n,i) => {
        let dt = cv.findIndex((val) => n > val && n%val === 0);
        if (dt != -1) {
            dn = i;
            dd = dt;
        }
    })
    let df = cv[dn]/cv[dd];
    return pv + df;
}, 0)

console.log(a);