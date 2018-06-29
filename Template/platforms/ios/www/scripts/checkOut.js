myApp.factory('CheckOutInfo', function () {
    var obj = {};
    obj.location = { Value: 'Location' };
    obj.vehicletype = { Value: 'Vehicle Type' };
    obj.vehicles = { FullVehicleNameWithLicense: 'Select Vehicle' };
    obj.vehicleInfo = {};
    obj.RateInfo = {};
    obj.resData = {};
    obj.fuelLevel = { Value: 'Select Fuel Level' }
    return obj;
});

//sercha by vehicle plate number and create accordian style
myApp.controller('checkOutAccordian', function ($scope, $http, AppContext, CheckOutInfo, Enum) {

    ons.ready(function () {

        var cid = AppContext.getUserContext().ClientId;

        $scope.isCollapsed = true;
        $("#checkOutVehicleInfo").hide();
        $scope.info = CheckOutInfo;

        $('.accordianButton').attr('disabled', true);

        function plateKeyUp() {
            if (CheckOutInfo.location.Value == 'Location') {
                ons.notification.alert({ message: 'Select Location first!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            }

            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.GetVehicleInfo, [CheckOutInfo.vehicle.LicenseNo, CheckOutInfo.location.ID, cid]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
               function (response) {
                   if (response.data === "") {
                       console.log(request.url + "load failed!");
                       angular.copy(null, $scope.info.vehicleInfo);
                       $('.accordianButton').attr('disabled', true);
                       $('#checkOutConfirm').attr('disabled', true);
                       $('#checkOutVehicleInfo').fadeOut();
                       $scope.isCollapsed = true;
                   } else {
                       $scope.info.vehicleInfo = response.data;
                       $scope.info.vehicle.CurrentOdometer = response.data.CurrentOdometer;
                       $scope.info.fuelLevel.Value = response.data.FuelLevel;

                       if (typeof $scope.info.agreementNo != 'undefined') {
                           $('.accordianButton').attr('disabled', false);
                           $('#checkOutConfirm').removeAttr('disabled');
                       } else {
                           var autoNum = setInterval(function () {
                               if (typeof $scope.info.agreementNo != 'undefined') {
                                   $('.accordianButton').attr('disabled', false);
                                   $('#checkOutConfirm').removeAttr('disabled');
                                   clearInterval(autoNum);
                               }
                           }, 2000);
                       }
                       //$('.accordianButton').attr('disabled', false);
                       //$('#checkOutConfirm').removeAttr('disabled');
                   }
               },
               function (error) {
                   logInfo(request, error, 'warn');
                   angular.copy(null, $scope.info.vehicleInfo);
                   $('.accordianButton').attr('disabled', true);
                   $('#checkOutConfirm').attr('disabled', true);
                   $('#checkOutVehicleInfo').fadeOut();
                   $scope.isCollapsed = true;
               });
        }

        $scope.$on("plateTxtTrigger", function () {
            plateKeyUp();
        });

        $('#plateTxt').keyup(function () {
            plateKeyUp();
        });

        $scope.getVehicleInfo = function () {
            $('#checkOutVehicleInfo').fadeIn();
            $scope.isCollapsed = !$scope.isCollapsed;
            if (!$scope.isCollapsed) {
                $('#checkOutVehicleInfo').fadeIn();
            }
            else {
                $('#checkOutVehicleInfo').fadeOut();
            }
        }

    });
});

//validate form details
myApp.controller('checkOutFormCntrl', function ($scope, CheckOutInfo, AppContext, $http, Enum) {

    ons.ready(function () {

        var cid = AppContext.getUserContext().ClientId;
        $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;
        if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
            var resData = homeNavigator.getCurrentPage().options.data;
            CheckOutInfo.resData = resData;
        }

        vehicleviewimages = [["frontView", ""], ["rearView", ""], ["leftView", ""], ["rightView", ""]];
        $scope.info = CheckOutInfo;

        //load agreement no
        var requestAgNo = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetAutoAgreementNo, [cid]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(requestAgNo).then(
            function (response) {
                if (response.data === "") {
                    console.log(request.url + "load failed!");

                } else {
                    $scope.info.agreementNo = response.data;
                }
            },
            function (error) {
                logInfo(requestAgNo, error, 'warn');
            });

        //load types
        var requestTypes = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetAgreementTypes, [cid]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(requestTypes).then(
            function (response) {
                if (response.data === "") {
                    console.log(request.url + "load failed!");

                } else {
                    $scope.agreementTypes = response.data;
                    $scope.info.TypeName = response.data[0];
                }
            },
            function (error) {
                logInfo(requestTypes, error, 'warn');
            });

        //load vehicles
        function loadVehicles() {
            if ($scope.info.location != undefined && $scope.info.vehicletype != undefined && $scope.info.vehicletype.Value != "Vehicle Type") {

                var vehRequest = {
                    method: 'POST',
                    url: AppContext.getUrl(Enum.Url.GetVehicles, [cid, $scope.info.location.ID, $scope.info.vehicletype.ID]),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                $http(vehRequest).then(
                    function (response) {
                        if (response.data === "") {
                            console.log(request.url + "load failed!");

                        } else {
                            $scope.checkOutVehicles = response.data;
                            if (response.data.length != 0) {

                                if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                                    for (var i = 0; i < $scope.checkOutVehicles.length; i++) {
                                        if ($scope.checkOutVehicles[i].VehicleID == resData.VehicleID) {
                                            $scope.info.vehicle = $scope.checkOutVehicles[i];
                                        }
                                    }
                                } else {
                                    $scope.info.vehicle = response.data[0];
                                }
                                
                                $('#plateTxt').val(response.data[0].LicenseNo);
                                $scope.$root.$broadcast("plateTxtTrigger", {});
                            }
                            else {
                                var msg = 'No vehicles for ' + $scope.info.vehicletype.Value + ' type in ' + $scope.info.location.Value;
                                ons.notification.alert({ message: msg, title: 'No Vehicle', animation: 'slide', buttonLabel: 'OK' });
                                $scope.info.fuelLevel.Value = 0;
                                $scope.info.vehicle = 'No Vehicles';
                                $scope.info.vehicle = { FullVehicleNameWithLicense: 'Select Vehicle' };
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
                    $scope.info.vehicle = { FullVehicleNameWithLicense: 'Select Vehicle' };
                    return;
                }
                $('#plateTxt').val(item.LicenseNo);
                $scope.$root.$broadcast("plateTxtTrigger", {});
            }
        }

        //load locations
        var locRequest = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetLocations, [cid]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(locRequest).then(
            function (response) {
                if (response.data === "") {
                    console.log(locRequest.url + "load failed!");
                } else {
                    $scope.checkOutLocations = response.data;

                    if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                        for (var i = 0; i < $scope.checkOutLocations.length; i++) {
                            if ($scope.checkOutLocations[i].ID == resData.StartLocation.LocationID) {
                                $scope.info.location = $scope.checkOutLocations[i];
                            }
                        }
                    } else {
                        $scope.info.location = response.data[0];
                    }

                    loadVehicles();
                }
            },
            function (error) {
                logInfo(locRequest, error, 'warn');
            });

        $scope.setLocation = function () {
            $scope.info.vehicle.FullVehicleNameWithLicense = "Select Vehicle";
            $('#plateTxt').val('');
            loadVehicles();
        }

        //load vehicle Types
        var vehTypeRequest = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetVehicleTypes, [cid]),
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

                    if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                        for (var i = 0; i < $scope.checkOutVehicleTypes.length; i++) {
                            if ($scope.checkOutVehicleTypes[i].ID == resData.VehicleInfo.VehicleType.VehicleTypeID) {
                                $scope.info.vehicletype = $scope.checkOutVehicleTypes[i];
                            }
                        }
                    } else {
                        $scope.info.vehicletype = $scope.checkOutVehicleTypes[0];
                    }

                    loadVehicles();
                }
            },
            function (error) {
                logInfo(vehTypeRequest, error, 'warn');
            });

        $scope.setVehType = function () {
            $scope.info.vehicle.FullVehicleNameWithLicense = 'Select Vehicle';
            $('#plateTxt').val('');
            loadVehicles();
        }

        //load fuel levels
        if (AppContext.getUserContext().Features.indexOf(Enum.FeatureType.FUELLEVEL_EIGHT) != -1) {
            $scope.checkOutfuelLevels =
            [{ id: 0, Value: 'Select' }, { id: 1, Value: 'Empty' }, { id: 2, Value: 'OneEight' }, { id: 2, Value: 'Quarter' }, { id: 2, Value: 'ThreeEight' },
                { id: 3, Value: 'Half' }, { id: 2, Value: 'FiveEight' }, { id: 4, Value: '3 Quarter' }, { id: 2, Value: 'SevenEight' }, { id: 5, Value: 'Full' }];
        }
        else {
            $scope.checkOutfuelLevels =
            [{ id: 0, Value: 'Select' }, { id: 1, Value: 'Empty' }, { id: 2, Value: 'Quarter' }, { id: 3, Value: 'Half' }, { id: 4, Value: '3 Quarter' },
                { id: 5, Value: 'Full' }];
        }

        $scope.info.fuelLevel = $scope.checkOutfuelLevels[0];

        if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {

            $scope.info.checkOutDate = setDate(resData.CheckOut);
            $scope.info.checkInDate = setDate(resData.CheckIn);

        } else {
            var datestr = new Date();
            var x = new Date(datestr.getFullYear(), datestr.getMonth(), datestr.getDate(), datestr.getHours(), datestr.getMinutes(), 0, 0);
            $scope.info.checkOutDate = new Date(x);

            var today = new Date(x);
            var tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            $scope.info.checkInDate = tomorrow;
        }

        $scope.info.isApplied = false;
        $scope.info.promoCode = "";
        var promoCode = "";

        if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr && (typeof CheckOutInfo.resData.PromoCode != 'undefined')) {
            $scope.info.promoCode = CheckOutInfo.resData.PromoCode;
            promoCode = CheckOutInfo.resData.PromoCode;
        }

        $scope.validateCheckOut = function (val) {

            $scope.validateForm = function (form) {
                //form.$valid
                if (form.$valid) {
                    if ($scope.info.checkOutDate >= $scope.info.checkInDate) {
                        ons.notification.alert({ message: 'Invalid Checkin Date', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if (CheckOutInfo.vehicle.FullVehicleNameWithLicense == "Select Vehicle") {
                        ons.notification.alert({ message: 'No vehicles for selected vehicle type in this location', title: 'No Vehicle', animation: 'slide', buttonLabel: 'OK' });
                        $('#checkOutConfirm').attr('disabled', true);
                    }
                    else if (!(typeof $scope.info.promoCode === 'undefined' || $scope.info.promoCode === null || $scope.info.promoCode == "")) {
                        if ($scope.info.isApplied && promoCode == $scope.info.promoCode) {
                            CheckOutInfo.vehicleInfo.CurrentOdometer = CheckOutInfo.vehicle.CurrentOdometer;
                            $scope.homeNavigator.pushPage('agreementRates.html', { animation: defaultTransition, data: CheckOutInfo, navigateFrom: $scope.navigateFrom });
                        } else {
                            ons.notification.alert({ message: 'Promotion is not applied!', title: null, animation: 'slide', buttonLabel: 'OK' });
                        }
                    }
                    else {
                        CheckOutInfo.vehicleInfo.CurrentOdometer = CheckOutInfo.vehicle.CurrentOdometer;
                        $scope.homeNavigator.pushPage('agreementRates.html', { animation: defaultTransition, data: CheckOutInfo, navigateFrom: $scope.navigateFrom });
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
            else if (CheckOutInfo.location.Value == 'Location') {
                ons.notification.alert({ message: 'Select a Location!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            } else if (CheckOutInfo.vehicletype.Value == 'Vehicle Type') {
                ons.notification.alert({ message: 'Select a vehicle Type!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
                return;
            }
            else if ($scope.info.checkOutDate >= $scope.info.checkInDate) {
                ons.notification.alert({ message: 'Invalid Checkin Date', title: null, animation: 'slide', buttonLabel: 'OK' });
            }
            promoCode = $scope.info.promoCode;
            var checkoutString = $scope.info.checkOutDate.toString("MM/dd/yyyy HH:mm");
            var checkinString = $scope.info.checkInDate.toString("MM/dd/yyyy HH:mm");

            //get promotion
            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.GetPromotion, [$scope.info.promoCode, CheckOutInfo.vehicletype.ID, CheckOutInfo.location.ID, cid, checkoutString, checkinString]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
               function (response) {
                   ons.notification.alert({ message: response.data.Message, title: null, animation: 'slide', buttonLabel: 'Ok' });
                   if (response.data.Message == "Promo code appears to be invalid") {
                       $scope.info.promoCode = "";
                   }
               },
               function (error) {
                   logInfo(request, error, 'warn');
               });
        };

        $scope.NavigateBackto = function () {

            homeNavigator.popPage({ animation: defaultTransition });
        };

        function setDate(date) {

            var t1 = date.split(',');
            var t2 = t1[0];
            var t3 = t2.split('.');

            var t4 = t1[1].trim();
            var t5 = t4.split(' ');
            var t6 = t5[0].split(':');

            var year = t3[2];
            var month = Number(t3[0]) - 1;
            var date = t3[1];
            var hour = Number(t6[0]);
            if (t5[1] == 'PM') {
                hour += 12;
            }
            var minutes = t6[1];

            return new Date(year, month, date, hour, minutes, 0);
        }
    });
});