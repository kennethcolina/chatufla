const signaling = (server) => {
	const users = {};
	const io = require('socket.io')(server);

	io.on('connection', function(socket) {

  	const removeUser = (user) => {
		  console.log(user+' saiu.');
		  delete users[user];
		  io.emit('lista', JSON.stringify(Object.keys(users)));
		}

	  socket.on('disconnect', function(data) {
		  removeUser(socket.username);
	  });

	  socket.on('sair', function(data) {
		 removeUser(data);
	  });

	  console.log('usuario conectou');
	  socket.on('entrar', (msg) => {
		  if (users[msg.email]) {
			  socket.emit('entrar',JSON.stringify({"error":"Usuario "+msg.email+" já existe!"}));
			  return;
		  }
	    console.log(msg.nome+' entrou');
			users[msg.email] = {"socket": socket};
	    socket.emit('entrar' , JSON.stringify({"nomeLogado":msg.nome}));
			socket.username = msg.nome;
	    io.emit('lista', JSON.stringify(Object.keys(users)));
	  });

	  socket.on('chamada', (msg) => {
		  const chamada = JSON.parse(msg);
		  console.log(chamada);
		  if (users[chamada.para]) {
			  users[chamada.para].socket.emit('chamada', msg);
			  console.log("Mensagem enviada de "+chamada.dados.de+" para "+chamada.para);
		  } else {
			  chamada.error = "Usuário não encontrado!";
			  socket.emit("chamada", JSON.stringify(chamada));
		  }
	  })
	});
	return io;
}
module.exports = signaling;
