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
		  removeUser(socket.email);
	  });

	  socket.on('sair', function(data) {
		 removeUser(data);
	  });

	  console.log('usuario conectou');
	  socket.on('entrar', (msg) => {

	    console.log(msg.nome+' entrou');
			users[msg.email] = {"socket": socket};
	    socket.emit('entrar' , JSON.stringify({"nomeLogado":msg.nome}));
			socket.email = msg.email;
	    io.emit('lista', JSON.stringify(Object.keys(users)));
	  });

	  socket.on('chamada', (msg) => {
		  const chamada = JSON.parse(msg);
		  console.log("CHAMADA",chamada);
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
