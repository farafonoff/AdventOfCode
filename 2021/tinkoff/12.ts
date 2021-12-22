import _ from "lodash";

let primez = [2];
function isPrime(num) {
  for (let i = 0; i < primez.length; ++i) {
    if (primez[i] * primez[i] > num) {
      return true;
    }
    if (num % primez[i] === 0) return false;
  }
}
let candidates = [];
let top = 0;
//let UPLIMIT = Number(`1${_.repeat("0", 2)}`);
let UPLIMIT = Number(`1${_.repeat("0", 14)}`);
let LOWLIMIT = Number(`1${_.repeat("0", 13)}`);
function primes(upto) {
  for (let i = 3; i < upto; ++i) {
    if (isPrime(i)) {
      primez.push(i);
      let pprime = primez.length - 1;
      while (primez[pprime] + 100 >= i) {
        let cand = primez[pprime] * i;
        if (cand > top && cand < UPLIMIT && cand > LOWLIMIT) {
          top = cand;
          console.log(top);
        }
        --pprime;
      }
    }
  }
}

primes(UPLIMIT);
//console.log(primez);
