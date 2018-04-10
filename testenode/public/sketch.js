// Keep track of our socket connection
var socket;
var users = {};
var user = {};
var ids = [];
var comidas = [];
var ownID;

var pos = { x:[], y:[] }; 
var contador = 0;

function setup() {
  createCanvas(500, 500);
  background(0);

  socket = io.connect('http://192.168.9.3:3000');

  socket.on('ids', function(data) {
    ids = data[0];
    users = data[1];
    comidas = data[2];
   
    if(ownID == undefined) ownID = data[3];
    //console.log(data[1]);
  });

  socket.on('users', function(data) {
      //console.log(data);
      users[data[0]] = data[1];
      comidas = data[2];

      background(0);

      for(var i=0; i<comidas.length; i++) ellipse(width/2 + comidas[i].x - users[ownID].x, height/2 + comidas[i].y - users[ownID].y, 5, 5);
      for(var i=0; i<ids.length; i++) ellipse(width/2 + users[ids[i]].x - users[ownID].x, width/2 + users[ids[i]].y - users[ownID].y, users[ids[i]].tamanho, users[ids[i]].tamanho);
      // Draw a blue circle 
    }
  );
}

function draw(){
  if(users[ownID] != undefined){
    var acrescimos = coordenadasTan(width/2, height/2 , 100);
    if(users[ownID].x + acrescimos[0] - width/2 >= -2000 && users[ownID].y + acrescimos[1] - height/2 >= -2000 && users[ownID].x + mouseX - width/2 <= 2000 && users[ownID].y + mouseY - height/2 <= 2000){
      pos.x[ contador % 60 ] = users[ownID].x + acrescimos[0] - width/2;
      pos.y[ contador % 60 ] = users[ownID].y + acrescimos[1] - height/2;
      //console.log(users[ownID].x, users[ownID].y);
      contador++;
    }
  }

  user.x = media( pos.x );
  user.y = media( pos.y );
  
  if(typeof user === 'object' && typeof user.x === 'number' && typeof user.y === 'number') 
    socket.emit('user',user);
}

function coordenadasTan(x,y,raio){
  var yy = mouseY-y;
  var xx = mouseX-x;

  if (xx != 0) {
    ta = yy/xx;
    t = atan(ta);
    if (xx<0)
      t+=PI;
    else if (xx>0 && yy<0)
      t+=TWO_PI;
  }
  
  var resposta = [x + raio * cos(t), y + raio * sin(t)];

  return resposta;
}

function media(valor){
  var resultado = 0;
  for(var i=0; i<valor.length;i++) resultado+= valor[i];
  resultado /= valor.length;

  return resultado;
}

// Function for sending to the socket
//function sendmouse(xpos, ypos) {
  // We are sending!
  //console.log("sendmouse: " + xpos + " " + ypos);
  
  //var data = {
  //  x: xpos,
  //  y: ypos
  //};

  //socket.emit('mouse',data);
//}