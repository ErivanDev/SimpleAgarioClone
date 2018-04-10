var express = require('express');
var app = express();

var server = app.listen(process.env.PORT || 3000, listen);
var ids = [];
var users = {};
var comidas = [];

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
  
    console.log("We have a new client: " + socket.id);

    users[socket.id] = new player(socket.id);
    ids.push(socket.id);

    var back = [ ids , users, comidas, socket.id ];

    io.sockets.emit('ids', back);
  
    socket.on('user', function(data) {
        // Data comes in as whatever was sent, including objects
        //console.log("Received: 'mouse' " + data.x + " " + data.y);
        //console.log(users); 
        // Send it to all other clients
        //socket.broadcast.emit('mouse', data);
        //for(var i=0; i<users.length; i++) if(users[i].id == socket.id){ users[i].x = data.x ; users[i].y = data.y }
        users[socket.id].x = data.x;
        users[socket.id].y = data.y;

        comer( users[socket.id] );
        matar( users[socket.id] );

        while( comidas.length < 1000 ){
          comidas.push( new comida() );
        }

        var back = [ socket.id , users[socket.id] , comidas];

        //console.log(users);
        // This is a way to send to everyone including sender
        io.sockets.emit('users', back);

      }
    );
    
    socket.on('disconnect', function() {
      delete users[socket.id];
      ids.splice( ids.indexOf(socket.id) , 1);

      //console.log(users);

      var back = [ ids , users ];
      io.sockets.emit('ids', back);
    });
});

function player(id){
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.tamanho = 20;
}

function comida(){
  this.x = -2000 + Math.round( Math.random() * 4000 );
  this.y = -2000 + Math.round( Math.random() * 4000 );
}

function comer(user){
  for(var i=0; i<comidas.length; i++){ 
    var d = Math.abs( Math.sqrt(Math.pow(comidas[i].x - user.x, 2 ) + Math.pow(comidas[i].y - user.y, 2 )) );  
    if( d <= user.tamanho/2 ){ comidas.splice(i,1); user.tamanho++; }
  }
}

function matar(user){
  for(var i=0; i<ids.length; i++){ 
    var d = Math.abs( Math.sqrt(Math.pow(users[ids[i]].x - user.x, 2 ) + Math.pow(users[ids[i]].y - user.y, 2 )) );  
    if( users[ids[i]] != user && d <= users[ids[i]].tamanho/2 - user.tamanho/2 ){ 
      if(user.tamanho > users[ids[i]].tamanho)
        user.tamanho += users[ids[i]].tamanho - 20;
      else if(user.tamanho < users[ids[i]].tamanho)
        user.tamanho = 20;
    }
  }
}