function pos(id) {
    id -= 1;
    let ring = Math.floor(Math.sqrt(id));
    if (ring%2==0) {
        ring -=1;
    }
    //console.log(ring);
    let rid = id - ring * ring;
    let side = ring + 1;
    let sn = rid % side;
    if (ring > 2) {
        sn -= (ring - 1) / 2;
    }
    let sid = Math.floor(rid / side);
    switch(sid) {
        case 0: return {sid, y: sn, x: ( ring + 1 ) /2};
        case 1: return {sid, y: ( ring + 1 ) /2, x: -sn};
        case 2: return {sid, y: -sn, x: -( ring + 1 ) /2};
        case 3: return {sid, y: - ( ring + 1 ) /2, x: sn};        
    }
    //console.log(`${ring} ${sn}`);      
    //sn = Math.abs(sn);    
    //sn += ( ring + 1 ) /2;
    //console.log(sn);
    //return {x: sn, y: ( ring + 1 ) /2}
}
let l = 10000;
let c = 5000;
let input = 265149;
let grid = new Array(l);
for(let i = 0;i<l;++i) {
    grid[i] = new Array(l);
    for(let j = 0;j< l;++j) {
        grid[i][j] = 0;
    }
}
//console.log(grid);
//grid = grid.map(g => new Array(l).map(t => 0));
//console.log(grid);
grid[c][c] = 1;
for (let i=2;i<l*l; ++i) {
    let pp = pos(i);
    console.log(pp);
    grid[pp.x+c][pp.y+c] =
    grid[pp.x+c + 1][pp.y+c] +
    grid[pp.x+c - 1][pp.y+c] +
    grid[pp.x+c][pp.y+c + 1] +
    grid[pp.x+c][pp.y+c - 1] +
    grid[pp.x+c + 1][pp.y+c + 1] +
    grid[pp.x+c - 1][pp.y+c - 1] +
    grid[pp.x+c - 1][pp.y+c + 1] +
    grid[pp.x+c + 1][pp.y+c - 1];
    let t = grid[pp.x+c][pp.y+c];
    if (t > input) {
        console.log(t);
        break;
    }

}
//console.log(grid);