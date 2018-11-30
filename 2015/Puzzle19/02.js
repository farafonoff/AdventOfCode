const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var regex = /^([a-z]+) => ([a-z]+)$/i

var reps = contents.map(st=>st.match(regex)).filter(m=>m!=null).map(m=>([m[1],m[2]]));
var inp = contents.filter(ct=>ct.trim().length>0);
inp = inp[inp.length-1];
function sd(inp) {
  var atoms = inp.match(/[A-Z]/g).length;
  var ra = inp.match(/Rn|Ar/g).length;
  var y  = inp.match(/Y/g).length;
  return atoms-ra-y*2-1;
}
console.log(sd(inp));

