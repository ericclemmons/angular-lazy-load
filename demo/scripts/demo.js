angular
  .module('demo', [
    'demo.config',
    'demo.controllers.home'
  ])
  .value('VERSION', '0.0.1')
  .run([
    '$rootScope',
    'VERSION',
    function($rootScope, version) {
      $rootScope.version = version;
    }
  ])
;
