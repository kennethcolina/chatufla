app.controller('loginCtrl', ['$scope', '$http', 'localStorageService', function($scope, $http, localStorageService) {
  $scope.usuario = {};

  //var socket = io();

  $scope.login = function() {
    localStorageService.set('localStorageKey', $scope.usuario);
    window.location.href = '/main';
  };

  $scope.submit = function() {
    var data = $.param({
      usuario: JSON.stringify({
          email: $scope.usuario.email,
          senha: $scope.usuario.senha
      })
    });

    $http({
      method: 'POST',
      url: '/entrar',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: data
    }).then(function(response) {
      console.log(response.data);
      if (response.data != false && response.data != "null") {
        $scope.usuario = response.data;
        console.log($scope.usuario)
        $scope.login();
      } else if (response.data == "null") {
        alert("Usuário não encontrado na base de dados.");
      } else {
        alert("Senha Incorreta.");
      }
    });
  }
}]);
