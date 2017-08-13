var app = angular.module('webrtc', ['ngRoute', 'ngAnimate', 'LocalStorageModule'])
  .config(function($routeProvider){

    $routeProvider.when('/', {
        templateUrl: 'views/login.html',
        controller: 'loginCtrl'
    });

    $routeProvider.when('/cadastro', {
        templateUrl: '../views/cadastro.html',
        controller: 'cadastroCtrl'
    });

    $routeProvider.when('/main', {
        templateUrl: '../../views/main.html',
        controller: 'mainCtrl'
    });

});
