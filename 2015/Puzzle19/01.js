const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var regex = /^([a-z]+) => ([a-z]+)$/i

var reps = contents.map(st=>st.match(regex)).filter(m=>m!=null).map(m=>({s: m[1], t: m[2]}));
var inp = contents.filter(ct=>ct.trim().length>0);
inp = inp[inp.length-1];

console.log(reps);
function solve(reps,inp) {
  var solutions = {}
  for(var i = 1;i<=inp.length;++i) {
    reps.filter(rep=>(rep.s.length<=i&&inp.slice(i-rep.s.length,i)==rep.s))
      .forEach(rep=>{
        var sol = inp.slice(0,i-rep.s.length)+rep.t+inp.slice(i);
        solutions[sol]=1;
      });
  }
  var res = 0;
  for(var key in solutions) {
    ++res;
  }
  return res;
}

console.log(solve(reps, "HOH"));
console.log(solve(reps, "HOHOHO"));
console.log(solve(reps, inp));
