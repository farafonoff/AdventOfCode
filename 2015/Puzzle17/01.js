const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var numbers = contents.map(Number).filter(n=>!isNaN(n)&&n>0);

function solve(target,containers) {
  containers = containers.sort((a,b) => a-b);
  var solutions = new Array(target+1).fill(0);
  solutions[0] = 1;
  containers.forEach(n=>{
    for(var i=solutions.length-n-1;i>=0;--i) {
      if (solutions[i]!=0) {
        solutions[i+n] = solutions[i]+solutions[i+n];
      }
    }
    //console.log(solutions)
  });
  return solutions;
}
function solve2(target,containers) {
  containers = containers.sort((a,b) => a-b);
  var variants = new Array(target+1).fill(0);
  var numbers = new Array(target+1).fill(10000000);
  variants[0] = 1;
  numbers[0] = 0;
  containers.forEach(n=>{
    for(var i=variants.length-n-1;i>=0;--i) {
      if (numbers[i]+1<=numbers[i+n]) {
        if (numbers[i]+1==numbers[i+n]) {
          variants[i+n] = variants[i]+variants[i+n];
        } else {
          variants[i+n] = variants[i];
        }
        numbers[i+n] = numbers[i]+1;
      }
    }
  });
  return variants;
}

console.log(solve(25,[20,15,10,5,5]));
console.log(solve2(25,[20,15,10,5,5]));
console.log(solve(150, numbers)[150]);
console.log(solve2(150, numbers)[150]);

