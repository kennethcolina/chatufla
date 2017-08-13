app.controller('mainCtrl', ['$scope', 'localStorageService', function($scope, localStorageService) {
  $scope.usuario = localStorageService.get('localStorageKey');

	$scope.chat = false;
	$scope.tipo = null;

  $scope.peer = null;
	$scope.destino = null;
	$scope.audio = new Audio();

  var socket = io();

  $scope.recebendo = false;
	$scope.btnAtender = false;

  $scope.entrar = function() {
    socket.emit('entrar', $scope.usuario.nome);
  };

  $scope.entrar();

  socket.on('entrar', (data) => {
    var msg = JSON.parse(data);
    if (msg.error) {
      console.log("ERRRRRRRRRO");
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
		configConstraints();
		$scope.callMsg = "Conectando...";
		$scope.btnAtender = false;
	};

	$scope.desligar = function() {
		if (pc.iceConnectionState !== 'closed') {
			pc.close();
			socket.emit('chamada', JSON.stringify({para: $scope.peer, bye:true, dados: {de:$scope.usuario.nome}}));
			isInCall = false;
			isCaller = false;
			$scope.call = false;
			$scope.chat = true;
		};
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
			$scope.call = false;
			$scope.$apply();
			$scope.chat = true;

		}
		if (chamada.dados.oferta) {
			if (!isInCall) {
				ofertaRecebida = chamada.dados.oferta;
				$scope.tipo = chamada.dados.tipo;
				$scope.peer = chamada.dados.de;
				$scope.recebendo = true;
				setCallMsg("Recebendo chamada de " + $scope.peer);
				$scope.call = true;
				setAudio("audio/ring.mp3");
				isInCall = true;
				$scope.btnAtender = true;
				$scope.$apply();
			}
		} else if (chamada.dados.resposta) {
			$scope.tipo = chamada.dados.tipo;
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
						$scope.recebendo = false;
						isCaller = false;
						$scope.call = false;
					}
				}
				);
		}
	});

	window.URL = window.URL || window.webkitURL;
	//getUserMedia => request dos recursos de audio/video do usuário
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	// Cria a conexão WebRTC com outro $scope.peer
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	//Manipula os SDP local e remoto
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
	//controlador do ICE Agente, que envia nossos candidatos para o peer
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;

	function getConstraints() {
		var constraints = {};
		if($scope.tipo == 'video') {
			constraints = { audio:true, video:true };
			console.log("Estou aqui, video");
		} else if ($scope.tipo == 'voz') {
			constraints = { audio:true, video:false };
		}
		return constraints;
	};

	var ice = {"iceServers": [
		{"url": "stun:stun.l.google.com:19302"}
	]};

	var pc = null;
	var isCaller = false;
	var isInCall = false;
	var ofertaRecebida = null;

	var callbackSuccess = function(stream) {
		if ($scope.tipo == "video") {
			$scope.video = document.querySelector('#video');
			$scope.video.src = window.URL.createObjectURL(stream);
		}
		getMediaSuccess(stream);
	};

	function configConstraints() {
			navigator.getUserMedia(getConstraints(), callbackSuccess
				, getMediaError);
	};

	function getMediaSuccess(stream) {
		pc = new window.RTCPeerConnection(ice);

		pc.onaddstream = onStreamAdded;

		pc.addStream(stream);

		pc.onicecandidate = onIceCandidate;

		pc.oniceconnectionstatechange = onConnectionChange;

		var offerConstraints  = {};
		if ($scope.tipo == 'video') {
			offerConstraints = {
				mandatory: {
					OfferToReceiveAudio: true,
					OfferToReceiveVideo: true
				}
			}
		} else if ($scope.tipo == 'voz') {
			 offerConstraints = {
				mandatory: {
					OfferToReceiveAudio: true,
					OfferToReceiveVideo: false
				}
			}
		}

		if (isCaller) {
			pc.createOffer(function (offerSDP) {
	   			pc.setLocalDescription(new window.RTCSessionDescription(offerSDP),
					function() {
						console.log("SDP Local configurado");
					},
					function() {
						console.log("Falha ao configurar SDP local");
								});
						},
			function(err) {
				console.log("Não foi possivel construir oferta: "+err);
			}, offerConstraints);
		} else {
			pc.setRemoteDescription(new window.RTCSessionDescription(ofertaRecebida),
				function() {
					console.log(ofertaRecebida);
					pc.createAnswer(
						function (respostaSDP) {
						pc.setLocalDescription(
							new window.RTCSessionDescription(respostaSDP),
							function() {
								console.log("SDP Local configurado");
							},
							function() {
								console.log("Falha ao configurar SDP local");
							});
					}, function(err) {
						console.log("Não foi possivel construir resposta: "+err);
					});
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
				$scope.call = false;
			}
		}

		function onIceCandidate(evt) {
			console.log("onIceCandidate: "+evt.target.iceGatheringState);
			if (evt.target.iceGatheringState === "complete") {
				console.log("Busca ICE completa, enviando SDP para peer remoto:");
				console.log(evt.target);

				if (isCaller) {
					var oferta = { "de": $scope.usuario.nome, "oferta": pc.localDescription, "tipo": $scope.tipo };
					socket.emit("chamada", JSON.stringify({ "para": $scope.peer, "dados": oferta }));
				} else {
					var resposta = { "de": $scope.usuario.nome, "resposta": pc.localDescription, "tipo": $scope.tipo };
					socket.emit("chamada", JSON.stringify({ "para": $scope.peer, "dados": resposta }));
				}
			}
		}

		function onStreamAdded(evt) {
			var url = URL.createObjectURL(evt.stream);
			console.log('entrei em stream add');
			window.stream = url;

			if ($scope.tipo == 'video') {
				console.log("Eu estou aqui!, VIDEO");
				setVideo(url);
			} else if ($scope.tipo == 'voz') {
				console.log("Eu estou aqui!, VOZ");
				setAudio(url);
			}

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
			$scope.call = 'error';
			}
		);
		return;
	}

	$scope.chatMessage = function(quem) {
		$scope.destino = quem;
		$scope.chat = true;
	};

	$scope.voiceCall = function() {
		$scope.tipo = "voz";
		$scope.peer = $scope.destino;
		isCaller = true;
		$scope.callMsg = "Ligando para "+$scope.peer;
		$scope.call = true;
    setAudio("audio/call.mp3");
		$scope.chat = false;

		configConstraints();
	};

	$scope.videoCall = function() {
		$scope.tipo = "video";
		$scope.peer = $scope.destino;
		isCaller = true;
		$scope.callMsg = "Ligando para "+$scope.peer;
		$scope.call = true;
		setAudio("audio/call.mp3");
		$scope.chat = false;

		configConstraints();
	};
}]);
