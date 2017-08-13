app.controller('mainCtrl', ['$scope', 'localStorageService', function($scope, localStorageService) {
  //$scope.usuario = localStorageService.get('usuario');
	$scope.usuario = localStorageService.get('localStorageKey');
  $scope.usuarios = [];
	$scope.chamadaVideo = true;
	//$scope.video = document.querySelector('#video');
	$scope.tela = false;
	$scope.chat = false;
  $scope.peer = null;
	$scope.destino = null;
	$scope.audio = new Audio();

  console.log($scope.usuario.curso);
  var socket = io();

  $scope.recebendo = false;
	$scope.btnAtender = false;

  $scope.entrar = function() {
    socket.emit('entrar', $scope.usuario.nome);
    $scope.route = 'list';
  };

  $scope.entrar();

  socket.on('entrar', (data) => {
    var msg = JSON.parse(data);
    if (msg.error) {
      console.log("ERRRRRRRRRO");
      // $scope.error = msg.error;
      //console.log($escope.error);
    }
  })

  socket.on('disconnect', function() {
		window.location.href = '/';
		$scope.usuario = {};
	});

  socket.on('lista', function(data) {
		var lista = JSON.parse(data);
		var i = lista.indexOf($scope.usuario.nome);
		lista.splice(i, i+1);

		$scope.list = lista;
		$scope.$apply();
	});

  $scope.logout = function() {
		socket.emit('sair', $scope.usuario.nome);
		window.location.href = '/';
    $scope.usuario = {};
	};

  $scope.atender = function() {
		iniciaConversa();
		$scope.callMsg = "Conectando...";
		$scope.btnAtender = false;
	};

	$scope.desligar = function() {
		if (pc.iceConnectionState !== 'closed')
			pc.close();
			socket.emit('chamada', JSON.stringify({para: $scope.peer, bye:true, dados: {de:$scope.usuario.nome}}));
			isInCall = false;
			isCaller = false;
			$scope.route = 'list';
	};

  function setAudio(audio) {
		$scope.audio.src = audio;
		$scope.audio.play();
	}

	function setVideo (video) {
		$scope.video.src = video;
	}
	function setCallMsg(msg) {
		$scope.callMsg = msg;
		$scope.$apply();
	}

	socket.on('chamada', function (json) {
		var chamada = JSON.parse(json);
		if (chamada.error) {
			alert("Não foi possivel realizar a operação. Erro: " + chamada.error);
			return;
		}
		if (chamada.bye) {
			console.log("Chamada desligada pelo peer remoto");
			pc.close();
			isInCall = false;
			isCaller = false;
			$scope.route = 'list';
			$scope.$apply();
		}
		//			if (isInCall && !isCaller) {
		//				socket.emit("chamada",
		//				JSON.stringify({
		//						para:chamada.dados.de,
		//						error: "Usuário já está em uma chamada!",
		//						dados: {de:$scope.usuario.nome}
		//					})
		//				);
		//				return;
		//			}
		if (chamada.dados.oferta) {
			if (!isInCall) {
				ofertaRecebida = chamada.dados.oferta;
				$scope.peer = chamada.dados.de;
				$scope.recebendo = true;
				setCallMsg("Recebendo chamada de " + $scope.peer);
				$scope.route = 'call';
				//setAudio("audio/ring.mp3");
				isInCall = true;
				$scope.btnAtender = true;
				$scope.$apply();
			}
		} else if (chamada.dados.resposta) {
			pc.setRemoteDescription(
				new window.RTCSessionDescription(chamada.dados.resposta),
				function () {
					setCallMsg("Em chamada com " + $scope.peer);
					isInCall = true;

				},
				function (error) {
					console.log("Falha na conexão: " + error);
					if (pc.iceConnectionState !== 'connected') {
						$scope.peer = null;
						isInCall = false;
						$scope.recebendod = false;
						isCaller = false;
						$scope.route = 'list';
					}
				}
				);
		}
	});
	//Transforma binário em URL
	window.URL = window.URL || window.webkitURL;
	//getUserMedia => request dos recursos de audio/video do usuário
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	// Cria a conexão WebRTC com outro $scope.peer
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	//Manipula os SDP local e remoto
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
	//controlador do ICE Agente, que envia nossos candidatos para o peer
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	//Configurações do getuserMedia
	var constraints = { audio:false, video:true };
	var ice = {"iceServers": [
		{"url": "stun:stun.l.google.com:19302"}
	]};
	var pc = null;

	var isCaller = false;
	var isInCall = false;
	var ofertaRecebida = null;
	var mediaStream = null;

	navigator.getUserMedia(constraints,
		function(stream) {
			$scope.chamadaVideo = true;
			$scope.video = document.querySelector('#video');
			$scope.video.src = window.URL.createObjectURL(stream);
			$scope.chamadaVideo = false;

			mediaStream = stream;
		}, getMediaError);

	$scope.audioSrc = null;
	$scope.chamadaVideo = false;
	function getMediaSuccess(stream) {
		//Cria o RTCPeerConnection
		pc = new window.RTCPeerConnection(ice);

		pc.onaddstream = onStreamAdded;
		//Adiciona o mediaStream local ao RTCPeerCon
		pc.addStream(stream);

		//Callbacks do RTCPC

		pc.onicecandidate = onIceCandidate;

		pc.oniceconnectionstatechange = onConnectionChange;

		var offerConstraints = {
			mandatory: {
				OfferToReceiveAudio: true,
				OfferToReceiveVideo: true
			}
		};

		if (isCaller) {
			//Chamar createOffer() irá executar o processo ICE
			pc.createOffer(function (offerSDP) {
	   			pc.setLocalDescription(new window.RTCSessionDescription(offerSDP),
					//Sucesso ao setar localDescription - pode enviar a oferta(trickle ICE)
					function() {
//						var oferta = { "de": $scope.usuario.nome ,"oferta": pc.localDescription};
//						socket.emit("chamada", JSON.stringify( {"para": $scope.peer, "dados":oferta} ));
						console.log("SDP Local configurado");
					},
					//Falha ao setar localDescription
					function() {
						console.log("Falha ao configurar SDP local");
								});
						},
			function(err) {
				console.log("Não foi possivel construir oferta: "+err);
			}, offerConstraints);
		} else {
      $scope.chamadaVideo = true;
			pc.setRemoteDescription(new window.RTCSessionDescription(ofertaRecebida),
				//Sucesso ao setar SDP pra resposta
				function() {
					console.log(ofertaRecebida);
					pc.createAnswer(
						//Resposta criada com sucesso
						function (respostaSDP) {
						pc.setLocalDescription(
							new window.RTCSessionDescription(respostaSDP),
	   						//Sucesso ao setar localDescription - pode enviar a resposta(trickle ICE)
							function() {
								// var resposta = {"de": $scope.usuario.nome , "resposta":pc.localDescription };
								// socket.emit("chamada", JSON.stringify({ "para": $scope.peer, "dados":resposta}));
								console.log("SDP Local configurado");
							},
							//Falha ao setar localDescription
							function() {
								console.log("Falha ao configurar SDP local");
							});
					//Falha ao construir a resposta
					}, function(err) {
						console.log("Não foi possivel construir resposta: "+err);
					});
			//Falha ao setRemoteDescription
			}, function() {
				console.log("Falha ao construir SDP remoto");
			});
		}
	};

		function onConnectionChange(evt) {
			console.log(evt);
			var connState = evt.target.iceConnectionState;
			if (connState == 'closed') {
				isInCall = false;
				isCaller = false;
				$scope.route = 'list';
			}
		}

		function onIceCandidate(evt) {
			//Espera por todos os candidates serem encontrados e envia para nosso peer
			console.log("onIceCandidate: "+evt.target.iceGatheringState);
			if (evt.target.iceGatheringState === "complete") {
				console.log("Busca ICE completa, enviando SDP para peer remoto:");
				console.log(evt.target);

				if (isCaller) {
					var oferta = { "de": $scope.usuario.nome, "oferta": pc.localDescription };
					socket.emit("chamada", JSON.stringify({ "para": $scope.peer, "dados": oferta }));
				} else {
					var resposta = { "de": $scope.usuario.nome, "resposta": pc.localDescription };
					socket.emit("chamada", JSON.stringify({ "para": $scope.peer, "dados": resposta }));
				}
			}
		}

		function onStreamAdded(evt) {
			var url = URL.createObjectURL(evt.stream);
			//setAudio(url);
			window.stream = url;
			setVideo(url);
			console.log("stream added!");
			setCallMsg("Em chamada com "+$scope.peer);
		}

	//Falha
	function getMediaError(err) {
		console.log('Falha ao capturar audio!');
		console.log(err);
		isCaller = false;
		isInCall = false;
		$scope.peer = null;
		$scope.$apply(function() {
			$scope.route = 'error';
			}
		);
		return;
	}

	$scope.chat = function(quem) {
		//$scope.peer = quem;
		//isCaller = true;
		//$scope.callMsg = "Ligando para "+$scope.peer;
		//$scope.route = 'call';
		$scope.destino = quem;
		$scope.chat = true;
		$scope.tela = false;
		//iniciaConversa();
	};

	$scope.call = function() {
		$scope.chat = false;
		$scope.peer = $scope.destino;
		isCaller = true;
		$scope.callMsg = "Ligando para "+$scope.peer;
		$scope.route = 'call';
    setAudio("audio/call.mp3");

		iniciaConversa();
	};

	$scope.videoCall = function() {
		$scope.video = document.querySelector('#video');
		$scope.peer = $scope.destino;
		isCaller = true;
		$scope.callMsg = "Ligando para "+$scope.peer;
		$scope.route = 'call';
		//setAudio("audio/call.mp3");
		$scope.chat = false;
		$scope.chamadaVideo = true;

		iniciaConversa();
	};

	function iniciaConversa() {
		getMediaSuccess(mediaStream);
		//navigator.getUserMedia(constraints, getMediaSuccess, getMediaError);
	}
}]);
