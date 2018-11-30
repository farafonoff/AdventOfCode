function boss() {
  return {h: 104, d: 8, a: 1};
}

function parse(block) {
  var lines = block.split('\n');
  return lines.slice(1).map(l=>l.match(/([a-z0-9+]+)[ ]+([0-9]+)[ ]+([0-9]+)[ ]+([0-9]+)/i));
}

var weapons = parse(`Weapons:    Cost  Damage  Armor
    Dagger        8     4       0
    Shortsword   10     5       0
    Warhammer    25     6       0
    Longsword    40     7       0
    Greataxe     74     8       0`);
var armor = parse(`Armor:      Cost  Damage  Armor
    Leather      13     0       1
    Chainmail    31     0       2
    Splintmail   53     0       3
    Bandedmail   75     0       4
    Platemail   102     0       5`).concat(null);
var rings = parse(`Rings:      Cost  Damage  Armor
    Damage1    25     1       0
    Damage2    50     2       0
    Damage3   100     3       0
    Defens1   20     0       1
    Defense2   40     0       2
    Defense3   80     0       3`).concat(null).concat(null);

function fight(player, boss) {
  var hp = Math.max(1,player.d-boss.a);
  var bp = Math.max(1,boss.d-player.a);
  while(player.h>0&&boss.h>0) {
    boss.h -= Math.max(1,player.d-boss.a);
    player.h -= Math.max(1,boss.d-player.a);
  }
  if (boss.h<=0) {
    return true;
  } return false;
}

function sum(items) {
  var player = {h:100, d:0, a:0, c:0}
  items.forEach(it=>{
    if (it!=null) {
      player.d+=Number(it[3]);
      player.a+=Number(it[4]);
      player.c+=Number(it[2]);
    }
  });
  return player;
}

function solve() {
  var cost = Infinity;
  var pack = null;
  weapons.forEach(w=>{
    armor.forEach(a=>{
      rings.forEach(r1=>{
        rings.forEach(r2=>{
          if (r1!=r2||r1==null) {
            var xp = [w,a,r1,r2];
            var pl = sum(xp);
            if (fight(pl,boss())) {
              cost = Math.min(cost,pl.c);
              if (cost==pl.c) {
                console.log(sum(xp));
                pack = (xp.map(x=>x!=null?x[1]:" ").join(' '));
                console.log(pack);
              }
            }
          }
        });
      });
    });
  });
  return cost;
}
function solve2() {
  var cost = 0;
  var pack = null;
  weapons.forEach(w=>{
    armor.forEach(a=>{
      rings.forEach(r1=>{
        rings.forEach(r2=>{
          if (r1!=r2||r1==null) {
            var xp = [w,a,r1,r2];
            var pl = sum(xp);
            if (!fight(pl,boss())) {
              cost = Math.max(cost,pl.c);
              if (cost==pl.c) {
                console.log(sum(xp));
                pack = (xp.map(x=>x!=null?x[1]:" ").join(' '));
                console.log(pack);
              }
            }
          }
        });
      });
    });
  });
  return cost;
}

//console.log(fight({h:100, d: 0, a:0}, {h: 104, d: 8, a: 1}));

console.log(solve());
console.log(solve2());

