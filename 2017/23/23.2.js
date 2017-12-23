var a, b, c, d, e, f, g, h;
h = 0;
a = 1;
b = 65;
b *= 100;
b += 100000;
c = b + 17000;
let ans = 0;
for(let i=b;i<c+17;i+=17) {
    let simpl = true;
    for(let dv = 2;dv*dv<=i;++dv) {
        if (i%dv == 0) {
            simpl = false;
        }
    }
    if (!simpl) ans += 1;
}
console.log(b,c,ans);