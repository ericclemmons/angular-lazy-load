angular
  .module('demo.controllers.home', [])
  .controller('HomeController', [
    '$scope',
    function($scope) {
      $scope.message = 'HomeController loaded!';
    }
  ])
;
