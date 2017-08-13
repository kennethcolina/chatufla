app.controller('videoCtrl', ['$scope', 'localStorageService', function($scope, localStorageService) {
  $scope.usuario = localStorageService.get('Key');

  function getMediaSuccess(stream) {
    pc = new window.RTCPeerConnection(ice);

    pc.onaddstream = onStreamAdded;

    pc.addStream(stream);

    pc.onicecandidate = onIceCandidate;

    pc.oniceconnectionstatechange = onConnectionChange;

    var offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };

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
      $scope.chamadaVideo = true;
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
        $scope.route = 'list';
      }
    }

    function onIceCandidate(evt) {
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

  $scope.videoCall = function() {

    navigator.getUserMedia(constraints,
      function(stream) {
        $scope.chamadaVideo = true;
        $scope.video = document.querySelector('#video');
        $scope.video.src = window.URL.createObjectURL(stream);

        mediaStream = stream;
      }, getMediaError);

    $scope.peer = $scope.destino;
    isCaller = true;
    $scope.callMsg = "Ligando para "+$scope.peer;
    $scope.route = 'call';
    setAudio("audio/call.mp3");

    iniciaConversa();
  };

  function iniciaConversa() {
    getMediaSuccess(mediaStream);
    //navigator.getUserMedia(constraints, getMediaSuccess, getMediaError);
  }
}]);
