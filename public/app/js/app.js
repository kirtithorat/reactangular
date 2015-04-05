angular.module("reactangularApp", ['ngResource'])
.controller('AppCtrl', [ '$scope', 'ProductsFactory', '$timeout', function AppCtrl($scope, ProductsFactory, $timeout) {
	$scope.getProducts = function () {
		$scope.clearProducts();
		ProductsFactory.query(function (products) {
			$scope.products = products;
			$scope.message = "Products Count: "+products.length;
		});

		$scope.message = "Fetching Products..."
	};
	$scope.renderAngular = function () {
		$scope.showAngularReact = false;
		$scope.showAngular = true;
		renderingTime();
	};
	$scope.renderAngularReact = function () {
		$scope.showAngular = false;
		$scope.showAngularReact = true;
	};
	$scope.clearProducts = function () {
		$scope.products = {};
		$scope.timer = "--";
		$scope.message = "";
		$scope.showAngular = false;
		$scope.showAngularReact = false;
		$scope.watchersCount = 0;
	};
	$scope.setTimer = function(timer) {
		$scope.timer = timer;
	};
	$scope.countWatchers = function () {
        (function () { 
		    var root = angular.element(document.getElementsByTagName('body'));

		    var watchers = [];

		    var f = function (element) {
		        angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) { 
		            if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
		                angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
		                    watchers.push(watcher);
		                });
		            }
		        });

		        angular.forEach(element.children(), function (childElement) {
		            f(angular.element(childElement));
		        });
		    };

		    f(root);

		    // Remove duplicate watchers
		    var watchersWithoutDuplicates = [];
		    angular.forEach(watchers, function(item) {
		        if(watchersWithoutDuplicates.indexOf(item) < 0) {
		             watchersWithoutDuplicates.push(item);
		        }
		    });

		    $scope.watchersCount = watchersWithoutDuplicates.length;
		})();
    };

	function renderingTime() {
        var startTime = new Date().getTime();
        $timeout(function () {
            var time = (new Date().getTime() - startTime) + " ms";
            $scope.setTimer(time);
        });
    };

    $scope.clearProducts();
}])
.directive('productsData', [function () {
	return {
		restrict: 'E',
		templateUrl: '/app/partials/products-data.html'
	};
}])
.factory('ProductsFactory', ['$resource', function ($resource) {
	return $resource('/api/products.json');
}]);