angular.module("reactangularApp", [])
.controller('AppCtrl', [ '$scope', '$http', function AppCtrl($scope, $http) {
	$scope.getProductsData = function () {
		$http({
			method: 'GET',
			url: '/api'
		}).
		success(function (data) {
			$scope.productsData = data;
			// clear the error messages
      		$scope.error = '';
		}).
		error(function (err, status) {
			if (status === 404) {
		      $scope.error = 'No Products';
		    } else {
		      $scope.error = 'Error: ' + status;
		    }
		});
	};

	$scope.getProductsData();
}]);