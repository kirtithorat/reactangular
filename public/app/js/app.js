angular.module("reactangularApp", ['ngResource'])
.controller('AppCtrl', [ '$scope', 'ProductsFactory', function AppCtrl($scope, ProductsFactory) {
	$scope.getProductsData = function () {
		ProductsFactory.query(function (products) {
			$scope.productsData = products;
		});
	};
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