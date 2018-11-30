/*
 * Это простой редактор JavaScript.
 *
 * Введите JavaScript, затем щёлкните правой кнопкой или выберите из меню Выполнить:
 * 1. Запустить, чтобы исполнить выделенный текст (Ctrl+R),
 * 2. Исследовать, чтобы вызвать для результата Инспектор Объектов (Ctrl+I), или,
 * 3. Отобразить, чтобы вставить результат в комментарий после выделения. (Ctrl+L)
 */
var puzzle = 1
var ins = 'R5, L2, L1, R1, R3, R3, L3, R3, R4, L2, R4, L4, R4, R3, L2, L1, L1, R2, R4, R4, L4, R3, L2, R1, L4, R1, R3, L5, L4, L5, R3, L3, L1, L1, R4, R2, R2, L1, L4, R191, R5, L2, R46, R3, L1, R74, L2, R2, R187, R3, R4, R1, L4, L4, L2, R4, L5, R4, R3, L2, L1, R3, R3, R3, R1, R1, L4, R4, R1, R5, R2, R1, R3, L4, L2, L2, R1, L3, R1, R3, L5, L3, R5, R3, R4, L1, R3, R2, R1, R2, L4, L1, L1, R3, L3, R4, L2, L4, L5, L5, L4, R2, R5, L4, R4, L2, R3, L4, L3, L5, R5, L4, L2, R3, R5, R5, L1, L4, R3, L1, R2, L5, L1, R4, L1, R5, R1, L4, L4, L4, R4, R3, L5, R1, L3, R4, R3, L2, L1, R1, R2, R2, R2, L1, L1, L2, L5, L3, L1'
//var ins = 'R8, R4, R4, R8'
var parts = ins.split(', ')
var pos = {
  x: 0,
  y: 0,
}
var visited = []
var dv = [1, 0]
outer:for (pi in parts) {
  dv.reverse()
  var part = parts[pi]
  //console.log(part)
  if (part[0]=='R') {
    dv[0] = 0-dv[0];
  }
  if (part[0]=='L') {
    dv[1] = 0-dv[1];
  }
  //console.log(dv)
  var l = parseInt(part.substr(1));
  if (puzzle==0) {
    pos.x+=dv[0]*l;
    pos.y+=dv[1]*l;
  }
  if (puzzle==1) {
   for(var st = 0;st<l;++st) {
     var hash = pos.x*1000000+pos.y;
     if (visited[hash]==1) {
       console.log(pos);
       break outer;
     }
     visited[hash] = 1;
     pos.x+=dv[0];
     pos.y+=dv[1];
   }
  }
}
console.log(pos)
Math.abs(pos.x)+Math.abs(pos.y)
