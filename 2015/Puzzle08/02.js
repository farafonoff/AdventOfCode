const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");
var regexps = [
  /\\/g,
  /\"/g
  ]

function enquote(str) {
  if (str=="") return str;
  var result = str;
  regexps.forEach(re=>{result = result.replace(re, 'XX')});
  result = "\""+result+"\"";
  console.log(result);
  return result;
}

var l1 = contents.reduce((s,elt)=>s+elt.length,0);

var l2 = contents.map(enquote).reduce((s,elt)=>s+elt.length,0);
console.log(l2-l1);
