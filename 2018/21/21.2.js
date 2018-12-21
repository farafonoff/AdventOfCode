let q = 15466939;
let q2 = 65536;
let m = 65899;
let f = 16777215;
for(let i=0;i<20;++i) {
    while(q2 > 256) {
        q = q+q2&255
        console.log(q2, q)
        q = ((q&f)*m)&f;
        q2 = q2>>8;
    }
    console.log(q2, q)
    q2 = q | 65536
}
