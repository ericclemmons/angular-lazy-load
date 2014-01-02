angular.lazyLoad = function(rootModule, baseUrl) {
  var $module = angular.module;
  var $q      = angular.injector(['ng']).get('$q');
  var modules = [];

  var LazyLoadModule = function(name, deps, baseUrl) {
    var proxies   = {
      config:     [],
      constant:   [],
      controller: [],
      run:        [],
      value:      []
    };

    var scripts = [];

    this.name   = name;
    this.deps   = deps;
    this.loaded = false;

    this.bootstrap = function() {
      angular.forEach(scripts, function(script) {
        script();
      });
    };

    this.config = function() {
      proxies.config.push(arguments);

      return this;
    };

    this.constant = function() {
      proxies.constant.push(arguments);

      return this;
    };

    this.controller = function() {
      proxies.controller.push(arguments);

      return this;
    };

    this.run = function() {
      proxies.run.push(arguments);

      return this;
    };

    this.value = function() {
      proxies.value.push(arguments);

      return this;
    };

    this.load = function() {
      var $http     = angular.injector(['ng']).get('$http');
      var resources = [];

      angular.forEach(deps, function(dep) {
        var url = baseUrl + dep.replace(/\./g, '/') + '.js';

        resources.push($http.get(url).success(function(source) {
          var script = new Function(source);
          script.name = url;

          scripts.push(script);

          script();
        }));
      });

      return $q.all(resources).then(angular.bind(this, function() {
        this.loaded = true;
      }));
    };
  };

  var ModuleProxy = function(name, deps) {
    var module = new LazyLoadModule(name, deps || [], baseUrl);

    modules.unshift(module);

    return module;
  };

  angular.element().ready(function BootstrapProxy() {
    var $q = angular.injector(['ng']).get('$q');

    if (rootModule) {
      modules.unshift(new LazyLoadModule('lazyLoad.bootstrap', [rootModule], baseUrl));
    }

    var loadModules = function() {
      for (var i in modules) {
        var module = modules[i];

        if (!module.loaded) {
          return $q.when(module.load()).then(function() {
            return loadModules();
          });
        }
      }
    };

    console.log('dang');

    loadModules().then(function() {
      angular.module = $module;

      modules.forEach(function(module) {
        module.bootstrap();
      });

      angular.resumeBootstrap();
    });
  });

  window.name = window.name + 'NG_DEFER_BOOTSTRAP!';

  if (baseUrl && ('/' !== baseUrl.substr(-1))) {
    baseUrl += '/';
  }

  angular.module = ModuleProxy;

  return this;
};
