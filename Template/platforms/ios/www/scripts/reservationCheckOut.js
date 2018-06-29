myApp.factory('ReservationCheckOutModel', function () {
    var obj = {};
    obj.location = { Value: 'Location' };
    obj.vehicletype = { Value: 'Vehicle Type' };
    obj.vehicles = { FullVehicleNameWithLicense: 'Select Vehicle' };
    obj.vehicleInfo = {};
    obj.customerInfo = {};
    obj.RateInfo = {};
    return obj;
});

//validate form details
myApp.controller('ReservationCheckOutCtrl', function ($scope, ReservationCheckOutModel, AppContext, $http, Enum) {

    $scope.loading = true;

    $scope.info = ReservationCheckOutModel;
    $scope.info.customerInfo = homeNavigator.getCurrentPage().options.data;

    //load reservation types
    var typeRequest = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetReservationTypes, [AppContext.getUserContext().ClientId]),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(typeRequest).then(
        function (response) {
            if (response.data != "") {
                var types = response.data;
                $scope.resTypes = types;
                $scope.resType = $scope.resTypes[1];
            }
        },
        function (error) {
            logInfo(typeRequest, error, 'warn');
        });

    //load vehicles
    function loadVehicles() {
        if ($scope.info.location != undefined && $scope.info.vehicletype != undefined && $scope.info.vehicletype.Value != "Vehicle Type") {
            var vehRequest = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.GetVehicles, [AppContext.getUserContext().ClientId, $scope.info.location.ID, $scope.info.vehicletype.ID]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(vehRequest).then(
                function (response) {
                    if (response.data === "") {
                        console.log(request.url + "load failed!");

                    } else {
                        $scope.loading = false;
                        $scope.checkOutVehicles = response.data;
                        if (response.data.length > 0) {
                            $scope.info.vehicle = response.data[0];
                        }
                        else {
                            ReservationCheckOutModel.vehicle = 'No Vehicles';
                            ReservationCheckOutModel.vehicle = { FullVehicleNameWithLicense: 'Select Vehicle' };
                            ons.notification.alert({ message: 'Please Select a vehicle', title: null, animation: 'slide', buttonLabel: 'OK' });
                        }

                    }
                },
                function (error) {
                    logInfo(vehRequest, error, 'warn');
                });
        }

        $scope.setVehicle = function (item) {
            if (item == null) {
                $scope.info.vehicle = 'No Vehicles';
                return;
            }
        }

    }

    //load locations
    var locRequest = {
        method: 'POST',
        url: AppContext.getUrl(Enum.Url.GetLocations, [AppContext.getUserContext().ClientId]),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(locRequest).then(
        function (response) {
            if (response.data === "") {
                console.log(locRequest.url + "load failed!");
            }
            else {
                $scope.checkOutLocations = response.data;
                $scope.info.location = response.data[0];
                loadVehicles();
            }
        },
        function (error) {
            logInfo(locRequest, error, 'warn');
        });

    $scope.setLocation = function () {
        loadVehicles();
    }

    //load vehicle Types
    var vehTypeRequest = {
        method: 'POST',
        url: AppContext.getUrl(Enum.Url.GetVehicleTypes, [AppContext.getUserContext().ClientId]),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(vehTypeRequest).then(
        function (response) {
            if (response.data === "") {
                console.log(vehTypeRequest.url + "load failed!");

            } else {
                $scope.checkOutVehicleTypes = response.data;
                $scope.info.vehicletype = response.data[0];
                loadVehicles();
            }
        },
        function (error) {
            logInfo(vehTypeRequest, error, 'warn');
        });

    ons.ready(function () {

        $scope.setVehType = function () {
            loadVehicles();
        }

        var Datestr = new Date();

        var x = new Date(Datestr.getFullYear(), Datestr.getMonth(), Datestr.getDate(), Datestr.getHours(), Datestr.getMinutes(), 0, 0);

        $scope.info.checkOutDate = new Date(x);

        var today = new Date(x);
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        $scope.info.checkInDate = tomorrow;

        $scope.info.isApplied = false;
        $scope.info.promoCode = "";
        var promoCode = "";

        $scope.validateCheckOut = function (val) {
            $scope.validateForm = function (form) {
                //form.$valid
                if (form.$valid) {
                    if ($scope.info.checkOutDate >= $scope.info.checkInDate) {
                        ons.notification.alert({ message: 'Invalid Checkin Date', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if (ReservationCheckOutModel.vehicle.FullVehicleNameWithLicense == "Select Vehicle") {
                        ons.notification.alert({ message: 'Please Select a vehicle', title: null, animation: 'slide', buttonLabel: 'OK' });

                    }
                    else if (!(typeof $scope.info.promoCode === 'undefined' || $scope.info.promoCode === null || $scope.info.promoCode == "")) {
                        if ($scope.info.isApplied && promoCode == $scope.info.promoCode) {
                            ReservationCheckOutModel.vehicleInfo.CurrentOdometer = ReservationCheckOutModel.vehicle.CurrentOdometer;
                            homeNavigator.pushPage('reservationRates.html', { animation: defaultTransition, data: ReservationCheckOutModel });
                        } else {
                            ons.notification.alert({ message: 'Promotion is not applied!', title: null, animation: 'slide', buttonLabel: 'OK' });
                        }
                    }
                    else {
                        ReservationCheckOutModel.vehicleInfo.CurrentOdometer = ReservationCheckOutModel.vehicle.CurrentOdometer;
                        homeNavigator.pushPage('reservationRates.html', { animation: defaultTransition, data: ReservationCheckOutModel });
                    }


                }
            };
            if (val == "checkOutDate" || val == "buttonPress") {
                $("#checkOutDate").fadeOut();
                $("#checkOutDate").fadeIn();
            }
            if (val == "checkOutTime" || val == "buttonPress") {
                $("#checkOutTime").fadeOut();
                $("#checkOutTime").fadeIn();
            }
            if (val == "checkInDate" || val == "buttonPress") {
                $("#checkInDate").fadeOut();
                $("#checkInDate").fadeIn();
            }
            if (val == "checkInTime" || val == "buttonPress") {
                $("#checkInTime").fadeOut();
                $("#checkInTime").fadeIn();
            }
        };

        $scope.applyPromo = function () {
            $scope.info.isApplied = true;
            if ($scope.info.promoCode == "") {
                ons.notification.alert({ message: 'Invalid Code!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            }
            else if (ReservationCheckOutModel.location.Value == 'Location') {
                ons.notification.alert({ message: 'Select a Location!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            } else if (ReservationCheckOutModel.vehicletype.Value == 'Vehicle Type') {
                ons.notification.alert({ message: 'Select a vehicle Type!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            }
            else if ($scope.info.checkOutDate >= $scope.info.checkInDate) {
                ons.notification.alert({ message: 'Invalid Checkin Date', title: null, animation: 'slide', buttonLabel: 'OK' });
            }
            promoCode = $scope.info.promoCode;
            var checkoutString = $scope.info.checkOutDate.toString("MM/dd/yyyy HH:mm");
            var checkinString = $scope.info.checkInDate.toString("MM/dd/yyyy HH:mm");
            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.GetPromotion, [$scope.info.promoCode, ReservationCheckOutModel.vehicletype.ID, ReservationCheckOutModel.location.ID, AppContext.getUserContext().ClientId, checkoutString, checkinString]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
               function (response) {
                   ons.notification.alert({ message: response.data.Message, title: null, animation: 'slide', buttonLabel: 'Ok' });
                   if (response.data.Message == "Promo code appears to be invalid") {
                       $scope.info.promoCode = "";
                   } else {
                       $scope.info.promoId = response.data.Promotion.PromotionID;
                   }
               },
               function (error) {
                   logInfo(request, error, 'warn');
               });
        };

        $scope.changeType = function () {

        };

        $scope.NavigateBackto = function () {
            $scope.homeNavigator.popPage({ animation: defaultTransition });
        };

        checkOutNavigator.on('prepush', function (event) {

        });

    });
});