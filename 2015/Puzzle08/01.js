const fs = require('fs');

var contents = fs.readFileSync('input_short', 'utf8').split("\n");
var regexps = [
  /\\x[0-9a-f]{2}/g,
  /\\\\/g,
  /\\"/g
  ]

function dequote(str) {
  var result = str;
  regexps.forEach(re=>{result = result.replace(re, 'X')});
  return result.slice(1,result.length-1);
}

var l1 = contents.reduce((s,elt)=>s+elt.length,0);
var l2 = contents.map(dequote).reduce((s,elt)=>s+elt.length,0);
console.log(l1-l2);
