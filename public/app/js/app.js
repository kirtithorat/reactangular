angular.module("reactangularApp", ['ngResource'])
.controller('AppCtrl', [ '$scope', 'ProductsFactory', '$timeout', function AppCtrl($scope, ProductsFactory, $timeout) {
	$scope.getProducts = function () {
		ProductsFactory.query(function (products) {
			$scope.products = products;
			$scope.message = "Got "+products.length+ " products";
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
	};
	$scope.setTimer = function(timer) {
		$scope.timer = timer;
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