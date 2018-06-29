
myApp.controller('exCustomerDetails', function ($scope, $http, $rootScope, AppContext, ExCustomer, Enum) {
    ons.ready(function () {
        
        $scope.customer = ExCustomer.getCustomerInfo();
        $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;
       // myNav.popPage();
        $scope.Navigate = function () {
            if ($scope.navigateFrom == Enum.NavigateFrom.Reservation) {
                homeNavigator.pushPage('reservationCheckOut.html', { animation: defaultTransition, data: $scope.customer });
            }
            else if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                var resInfo = homeNavigator.getCurrentPage().options.data;
                homeNavigator.pushPage('checkOut.html', { animation: defaultTransition, data: resInfo, navigateFrom: Enum.NavigateFrom.ResToAgr });
            }
            else {
                homeNavigator.pushPage('checkOut.html', { animation: defaultTransition, navigateFrom: Enum.NavigateFrom.Agreement });
            }
        };
    });
});