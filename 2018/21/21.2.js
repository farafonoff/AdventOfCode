let q = 15466939;
let q2 = 65536;
let m = 65899;
let f = 16777215;
q = ((q&f)*m)&f;
q2 = Math.floor(q2/256);
q = q+(q2&255)

for(let i=0;i<5;++i) {
    while (q2 >= 256) {
        q2 = Math.floor(q2/256);
        q = q+(q2&255)
        q = ((q&f)*m)&f;
        console.log(q2, q)        
    };
    console.log(q2, q)
    q2 = q | 65536
    console.log(q2)
    console.log('##')
}
