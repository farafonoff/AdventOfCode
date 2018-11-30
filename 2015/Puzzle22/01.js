function missile(source, target) {
  target.hp-=4;
  return true;
}
function drain(source, target) {
  source.hp+=2;
  target.hp-=2;
  return true;
}
function shield(source, target) {
  if (source.shield_effect>0) return false;
  source.shield_effect=7;
  return true;
}
function poison(source, target) {
  if (target.poison_effect>0) return false;
  target.poison_effect=6;
  return true;
}
function recharge(source, target) {
  if (source.recharge_effect>0) return false;
  source.recharge_effect=5;
  return true;
}

function apply_effects(chr) {
  if (chr.poison_effect>0) {
    chr.hp-=3;
    chr.poison_effect--;
  }
  if (chr.shield_effect>0) {
    chr.a = 7;
    chr.shield_effect--;
    if (chr.shield_effect==0) {
      chr.a=0;
    }
  } else {
    chr.a=0;
  }
  if (chr.recharge_effect>0) {
    chr.mana+=101;
    chr.recharge_effect--;
  }
}

var effects = [
  [53, missile], [73,drain],[113,shield],[173, poison], [229,recharge]
];

function player() {
  return {hp: 50, mana: 500, mana_spent:0,a :0}
}
function boss() {
  return {hp: 55, d: 8}
}

function ss(effect, player, boss) {
  return [{ef: effect,
    pl: Object.assign({}, player),
    bo: Object.assign({}, boss)}];
}

function player_move(player, boss, st, xmin, game) {
  player.hp-=1;
  if (player.hp<=0) return Infinity;
  var shift = " ".repeat(st);
  apply_effects(player);
  apply_effects(boss);
  if (player.mana_spent>=xmin) {
    return Infinity;
  }
  if (boss.hp<=0) {
    console.log("Win! %d %d %d",player.mana_spent, st, xmin);
    game.forEach((gs,idx)=> {
        var shift = " ".repeat(idx);
        console.log("========= %d ============", idx);
          console.log(gs.ef);
          console.log(gs.pl);
          console.log(gs.bo);
    });
    game.forEach((gs)=>{if (gs.ef!=null)console.log(gs.ef[1])});
 
    return player.mana_spent;
  }
  var min = xmin;
  for(eid in effects) {
    var pl = Object.assign({}, player);
    var bo = Object.assign({}, boss);
    var effect = effects[eid];
    if (effect[0]<=pl.mana&&effect[1](pl,bo)) {
      pl.mana-=effect[0];
      pl.mana_spent+=effect[0];
      var res = boss_move(pl, bo, st+1,Math.min(xmin, min),game.concat(ss(effect,pl,bo)));
      min = Math.min(min, res);
    }
  }
  return min;
}

function boss_move(player, boss, st, xmin, game) {
  apply_effects(player);
  apply_effects(boss);
  if (boss.hp<=0) {
    console.log("Win! %d %d %d",player.mana_spent, st, xmin);
    game.forEach((gs,idx)=> {
        var shift = " ".repeat(idx);
        console.log("========= %d ============", idx);
          console.log(gs.ef);
          console.log(gs.pl);
          console.log(gs.bo);
    });
    game.forEach((gs)=>{if (gs.ef!=null)console.log(gs.ef[1])});
    return player.mana_spent;
  }
  player.hp-=Math.max(1,boss.d-player.a);
  if (player.hp<0) {
    return Infinity;
  }
  return player_move(player, boss, st+1, xmin, game.concat(ss(null, player, boss)));
}

console.log(player_move(player(), boss(),0, Infinity, []));

