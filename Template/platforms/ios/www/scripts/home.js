myApp.factory('ExCustomer', function ($rootScope) {
    $rootScope.obj = {};
    return {
        setCustomerInfo: function (cus) {
            $rootScope.obj = cus;
        },

        getCustomerInfo: function () {
            return $rootScope.obj;
        }
    }
});

myApp.controller('homeNavigation', function ($scope, ExCustomer, AppContext, $http, Enum) {
    ons.enableDeviceBackButtonHandler();
    function searchCustomer(phone, type) {

        if (phone != "") {
            loadingCustomers.show();
            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.GetCustomerInfo, [phone, AppContext.getUserContext().ClientId]),
            }

            $http(request).then(
                function (response) {
                    if (response.data == "") {
                        loadingCustomers.hide();
                        ons.notification.confirm({
                            title: 'Customer Not Found!',
                            messageHTML: "Do you want to Create a New Customer?",
                            buttonLabels: ["NO", "YES"],
                            callback: function (idx) {
                                switch (idx) {
                                    case 0:
                                        break;
                                    case 1:
                                        homeNavigator.pushPage('newCustomer.html', { animation: defaultTransition, phoneNumber: phone, navigateFrom: type });
                                }
                            }
                        });
                    } else {
                        loadingCustomers.hide();
                        $scope.customer = response.data;
                        ExCustomer.setCustomerInfo(response.data);
                        $scope.customer.DateOfBirth = ConvertJsonDateString(response.data.DateOfBirth, 'date');
                        $scope.customer.LicenseExpiryDate = ConvertJsonDateString(response.data.LicenseExpiryDate, 'date');
                        $scope.customer.LicenseIssueDate = ConvertJsonDateString(response.data.LicenseIssueDate, 'date');
                        $scope.customer.LicenseExpiryDate = $scope.customer.LicenseExpiryDate == null ? "--" : $scope.customer.LicenseExpiryDate;
                        $scope.customer.LicenseIssueDate = $scope.customer.LicenseIssueDate == null ? "--" : $scope.customer.LicenseIssueDate;
                        $scope.customer.CreditCardExpiryDate = ConvertJsonDateString(response.data.CreditCardExpiryDate, 'date');
                        $scope.customer.CreditCardExpiryDate = $scope.customer.CreditCardExpiryDate == null ? "--" : $scope.customer.CreditCardExpiryDate;

                        homeNavigator.pushPage('exCustomer.html', { animation: defaultTransition, navigateFrom: type, resData:null });
                    }
                },
            function (error) {
                loadingCustomers.hide();
                logInfo(request, error, 'warn');
            });
        }
        else {
            ons.notification.alert({ message: 'Invalid Phone Number!' });
        }
    }

    function searchCustomerConfirm(type) {

         ons.notification.confirm({
            title: 'Search Customer',
            messageHTML: "<input type='tel' id='customersPhone' class='search-input' placeholder='Phone Number' style=hieght'15px;'>",
            buttonLabels: ["Cancel", "Search"],
            callback: function (idx) {
                var phone = $('#customersPhone').val();
                switch (idx) {
                    case 0:
                        break;
                    case 1:
                        searchCustomer(phone, type);
                        break;
                }
            }
        });
    }

    $scope.newAgreement = function () {
        searchCustomerConfirm(Enum.NavigateFrom.Agreement);
    }

    $scope.newReservation = function () {
        searchCustomerConfirm(Enum.NavigateFrom.Reservation);
    }

    $scope.vehicleStatus = function () {
        homeNavigator.pushPage('vehicleStatus.html', { animation: defaultTransition });
    }

    $scope.newCustomer = function () {
        homeNavigator.pushPage('newCustomer.html', { animation: defaultTransition, navigateFrom : Enum.NavigateFrom.Home});
    }
});

myApp.controller('homeSearchOperator', function ($scope) {

    $scope.searchModes = ['Agreement', 'Reservation'];
    $scope.searchMode = $scope.searchModes[0];
    $scope.isAgreementSearch = true;

    $scope.changeSearch = function () {
        $scope.isAgreementSearch = $scope.searchMode == $scope.searchModes[0];
        $scope.isReservationSearch = $scope.searchMode == $scope.searchModes[1];
    }
});

myApp.controller('homeReservationSearch', function ($scope, $http, $timeout, $window, AppContext, Enum) {

    ons.ready(function () {
        $scope.deviceWidth = $window.innerWidth;
        $scope.info = {};
        $scope.hideSearch = true;
        $scope.hideProgress = true;
        $scope.resStatus = Enum.ReservationStatus;
        $scope.resType = Enum.ReservationStatus.All;

        $scope.search = function () {
            $scope.resSearching = true;
            $scope.listCount = '';
            $scope.isColumShow = false;

            $scope.fadeSearch = true;
            $timeout(function () {
                $scope.hideSearch = true;
            }, 500);

            $scope.fadeProgress = false;
            $timeout(function () {
                $scope.hideProgress = false;
            }, 200);

            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.SearchReservations, []),
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    ReservationId: $scope.info.reservationNumber,
                    FirstName: $scope.info.customerName,
                    Phone: $scope.info.customerPhone,
                    VehicleNo: $scope.info.vehicleNumber,
                    Status: $scope.resType,
                    ClientID: AppContext.getUserContext().ClientId,
                    UserID: AppContext.getUserContext().UserId
                }
            }

            $http(request).then(
                function (response) {

                    $scope.fadeProgress = true;
                    $timeout(function () {
                        $scope.hideProgress = true;
                    }, 500);

                    if (response.data == "" || response.data.length == 0) {
                        $scope.Agreements = null;
                        $scope.resSearching = false;
                        ons.notification.alert({ message: 'Could not find any Reservation', title: 'Empty Result', animation: 'slide', buttonLabel: 'Close' });
                        document.getElementById("searchContent2").style.height = "0px";

                    } else {
                        $scope.resSearching = false;

                        $scope.fadeSearch = false;
                        $timeout(function () {
                            $scope.hideSearch = false;
                        }, 500);

                        $scope.listCount = response.data.length + ' Results';
                        $scope.isColumShow = response.data.length > 0 ? true : false;
                        $scope.reservations = response.data;

                        if (response.data.length < 10) {
                            document.getElementById("searchContent2").style.height = response.data.length * 45.5 + 1 + "px";
                        }
                        else {
                            document.getElementById("searchContent2").style.height = "455px";
                        }
                    }
                },
                function (error) {
                    $scope.resSearching = false;
                    $scope.fadeSearch = false;
                    $timeout(function () {
                        $scope.hideSearch = false;
                    }, 500);
                    logInfo(request, error, 'warn');
                });
        }

        $scope.hideList = function () {

            $scope.listCount = '';
            $scope.isColumShow = false;

            $scope.fadeSearch = true;
            $timeout(function () {
                $scope.hideSearch = true;
            }, 500);
        }

        $scope.view = function (rid) {
            $scope.homeNavigator.pushPage('viewReservation.html', { animation: defaultTransition, rid: rid });
        }
    });

    window.addEventListener("orientationchange", function () {
        $scope.deviceWidth = $window.innerWidth;
        $scope.$apply();
    });
});

// Controllers for aload agreement list
myApp.controller('homeAgreementSearch', function ($scope, $http, $timeout, $window, AppContext, Enum) {

    $scope.agStatus = Enum.AgreementStatus;
    $scope.deviceWidth = $window.innerWidth;

    ons.ready(function () {
        $scope.agType = Enum.AgreementStatus.All;

        $scope.hideSearch = true;
        $scope.hideProgress = true;
        $scope.info = {};
        var AgListCount;

        $scope.search = function () {
            $scope.agreSearching = true;
            $scope.listCount = '';
            $scope.isColumShow = false;

            $scope.fadeSearch = true;
            $timeout(function () {
                $scope.hideSearch = true;
            }, 500);

            $scope.fadeProgress = false;
            $timeout(function () {
                $scope.hideProgress = false;
            }, 500);

            

            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.SearchAgreements, []),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/xml',
                },
                data: {
                    AgreementNumber: $scope.info.agreementNumber,
                    CustomerName: $scope.info.customerName,
                    CustomerPhone: $scope.info.customerPhone,
                    VehicleNumber: $scope.info.vehicleNumber,
                    AgreementStatus: $scope.agType,
                    noOfRecords: 200,
                    clientId: AppContext.getUserContext().ClientId
                }
            }

                $http(request).then(
                function (response) {

                    $scope.fadeProgress = true;
                    $timeout(function () {
                        $scope.hideProgress = true;
                    }, 500);

                    if (response.data == "") {
                        console.log(request.url + "load failed!");
                        $scope.Agreements = null;
                        $scope.agreSearching = false;
                        ons.notification.alert({ message: 'Could not find any Agreement', title: 'Empty Result', animation: 'slide', buttonLabel: 'Close' });
                        document.getElementById("searchContent").style.height = "0px";

                    } else {
                        $scope.agreSearching = false;
                        $scope.fadeSearch = false;
                        $timeout(function () {
                            $scope.hideSearch = false;
                        }, 500);

                        $scope.listCount = response.data.length + ' Results';
                        $scope.isColumShow = response.data.length > 0 ? true : false;
                        $scope.Agreements = response.data;
                        if (response.data.length < 10) {

                            AgListCount = response.data.length;
                            document.getElementById("searchContent").style.height = AgListCount * 45.5 + 1 + "px";
                        }
                        else {

                            document.getElementById("searchContent").style.height = "455px";
                        }
                    }
                },
                function (error) {
                    $scope.agreSearching = false;
                    $scope.fadeProgress = true;
                    $timeout(function () {
                        $scope.hideProgress = true;
                    }, 500);

                    logInfo(request, error, 'warn');
                });
        }

        $scope.hideList = function () {

            $scope.listCount = '';
            $scope.isColumShow = false;

            $scope.fadeSearch = true;
            $timeout(function () {
                $scope.hideSearch = true;
            }, 500);
        }

        $scope.view = function (aid) {
            $scope.homeNavigator.pushPage('viewAgreement.html', { animation: defaultTransition, aid: aid, navigateFrom: Enum.NavigateFrom.Home });

        }
    });
});

myApp.controller('homeGetCustomer', function ($scope) {
    ons.ready(function () {

        $scope.getCustomer = function () {
            naviDialog.hide();
            homeNavigator.pushPage('exCustomer.html', { animation: defaultTransition });
        };
    });
});

//function navigateTonewCustContinue() {
//    newCustomersaveOrContinue = 'continueToAgreement';
//    homeNavigator.pushPage('newCustomer.html', { animation: defaultTransition, }), naviDialog.hide();
//}

