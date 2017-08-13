app.controller('cadastroCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.usuario = {};
  $scope.data = {};

  $scope.getData = function() {
    $scope.data = $.param({
      usuario: JSON.stringify({
        email: $scope.usuario.email,
        nome: $scope.usuario.nome,
        senha: $scope.usuario.senha,
        curso: $scope.usuario.curso
      })
    });
  };

  $scope.cadastrar = function() {
    if ($scope.usuario.senha == $scope.usuario.confirmaSenha) {
      $scope.getData();
      $http({
        method: 'POST',
        url: '/cadastrar',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $scope.data
      }).then(function(response) {
        if (response.data) {
          alert("Usuário cadastrado com sucesso.");
          window.location.href="/";
        } else {
          alert("Erro ao cadastrar o usuário.");
          console.log(response.data);
        }
      });
    } else {
      alert("Senha Incorreta");
    }
  }
}]);
