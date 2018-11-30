var inp=33100000;
var is=Math.round(inp/11);
var arr = new Array(is+1).fill(0);

for(var i=1;i<is;++i) {
  for(var j=1;j<=50&&i*j<is;++j) {
    arr[j*i]+=i*11;
  }
  //console.log(arr);
}
arr.forEach((e,i)=>{if (e>=inp) console.log(i);});
//console.log(arr);

