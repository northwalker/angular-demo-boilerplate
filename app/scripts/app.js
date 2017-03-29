(function () {
  'use strict';

  angular.module('Demo', [])
    .constant('DEMO_API', 'http://localhost:3000/')
    .factory('DemoService', DemoService)
    .controller('DemoCtrl', DemoCtrl);

  DemoService.$inject = ['$http', 'DEMO_API'];
  DemoCtrl.$inject = ['$scope', '$http', '$timeout', 'DemoService'];

  function DemoService($http, DEMO_API) {
    var DemoService = {
      postData: function (newData) {
        var req = {
          method: 'POST',
          url: DEMO_API,
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          data: newData
        };
        // $http returns a promise, which has a then function, which also returns a promise
        var promise = $http(req)
          .then(function (response) {
            return response;
          }, function (error) {
            return error;
          });
        // Return the promise to the controller
        return promise;
      },
      getDataById: function (token, id) {
        return $http({
          method: 'GET',
          url: DEMO_API + id,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function successCallback(response) {
          return response;
        }, function errorCallback(error) {
          return error;
        });
      },
      getDataList: function (token) {
        return $http({
          method: 'GET',
          url: DEMO_API + 'getDataList',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function successCallback(response) {
          return response;
        }, function errorCallback(error) {
          return error;
        });
      }
    };
    return DemoService;
  }

  function DemoCtrl($scope, $http, $timeout, DemoService) {
    var vm = this;

    $scope.init = init;
    $scope.dayText = 'a good day.';

    function init() {
      console.log('Greeting from demo controller initial function.');
      $scope.dayText = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();

    }

    init();
  }

})();


