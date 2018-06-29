myApp.factory('ReservationChargesModel', function ($rootScope) {
    return {
        setMisc: function (data) {
            $rootScope.Misc = data;
        },

        getMisc: function () {
            return $rootScope.Misc;
        },
        setTax: function (data) {
            $rootScope.Tax = data;
        },

        getTax: function () {
            for (var i = 0; i < $rootScope.Tax.length; i++) {
                if ($rootScope.Tax[i].IsOptional) {
                    $rootScope.Tax[i].IsOption = 1;
                }
                else {
                    $rootScope.Tax[i].IsOption = 0;
                }
            }
            return $rootScope.Tax;
        }
    };
});

myApp.factory('ResMiscOptions', function () {
    var obj = {};
    return obj;
});

myApp.controller('ReservationChargesCntrl', function ($scope, AppContext, $http, ReservationChargesModel, ResMiscOptions, Enum) {
    $scope.MiscOptions = ResMiscOptions;
    $scope.MiscOptions.LDW = undefined;
    $scope.MiscOptions.TLDW = undefined;
    var cid = AppContext.getUserContext().ClientId;
    var count = 0;
    $scope.loading = true;
    var data = homeNavigator.getCurrentPage().options.data;

    //MISC Charges
    var miscRequest = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetMiscCharges, [data.location.ID, data.vehicletype.ID, cid]),
    }

    $http(miscRequest).then(
        function (response) {
            if (++count == 2) {
                $scope.loading = false;
            }
            if (response.data != null) {
                for (var i = 0; i < response.data.length; i++) {
                    response.data[i].Value = response.data[i].Value.toFixed(2);
                }
                ReservationChargesModel.setMisc(response.data);
                $scope.miscChargesList = response.data;
                $scope.currencyformat = AppContext.getUserContext().Currency;
            }
            else {
                $scope.noMisc = true;
            }
        },
        function (error) {
            logInfo(request, error, 'warn');
            ons.notification.alert({ message: 'No Misc charges', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
            $scope.noMisc = true;
            if (++count == 2) {
                $scope.loading = false;
            }
        });

    //TAX charges
    var taxRequest = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetTax, [data.location.ID, cid])
    }

    $http(taxRequest).then(
        function (response) {
            if (++count == 2) {
                $scope.loading = false;
            }
            if (response.data != null) {
                ReservationChargesModel.setTax(response.data);
                $scope.taxChargesList = response.data;

            } else {
                $scope.noTax = true;
            }
        },
        function (error) {
            logInfo(taxRequest, error, 'warn');
            ons.notification.alert({ message: 'No Tax charges', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
            if (++count == 2) {
                $scope.noTax = true;
                $scope.loading = false;
            }
        });

    ons.ready(function () {
        
        $scope.setCurrency = function (model) {
            model.Value = parseFloat(model.Value.replace(/,/g, "")).toFixed(2);
        }

        $scope.miscOptionChange = function (option) {
            var miscs = $scope.miscChargesList;
            for (var i = 0; i < miscs.length; i++) {
                if (miscs[i].MiscChargeID == option.MischargeID) {
                    miscs[i].Value = option.Value;
                    if (option.MischargeID == 1) {
                        $scope.MiscOptions.LDW = option.Option;
                    } else if (option.MischargeID == 9) {
                        $scope.MiscOptions.TLDW = option.Option;
                    }
                }
            }
        }

        $scope.submit = function () {
            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Saving...");
            var rd = data;
           
            var vehicle = {
                VehicleTypeID: rd.vehicletype.ID
            }

            var reservation = {
                ClientID: cid,
                StartDateStr: rd.checkOutDate.toString("MM/dd/yyyy HH:mm"),
                EndDateStr: rd.checkInDate.toString("MM/dd/yyyy HH:mm"),
                VehicleLocationID: rd.location.ID,
                PromotionID: rd.promoId,
                RateInfo: rd.RateInfo,
                VehicleID: rd.vehicle.VehicleID,
                VehicleInfo: vehicle,

                CustomerId: rd.customerInfo.CustomerId,
                FirstName: rd.customerInfo.FirstName,
                LastName: rd.customerInfo.LastName,
                Phone: rd.customerInfo.Phone,
                Email: rd.customerInfo.Email,
                Company: rd.customerInfo.CompanyName,
                CreditCardNo: rd.customerInfo.CreditCardNo,
                CreditCardType: rd.customerInfo.CreditCardType,
                CreditCardExpiryDate: rd.customerInfo.CreditCardExpiryDate,

                TaxList: ReservationChargesModel.getTax(),
                MiscChargeList: ReservationChargesModel.getMisc(),
                LDW :ResMiscOptions.LDW,
                TLDW: ResMiscOptions.TLDW
        }

            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.AddReservation),
                data: reservation
            }

            $http(request).then(
                function (response) {
                   
                    if (response.data != null && response.data != "") {

                        $('#LoadingLoopDiv').fadeOut();
                        $('#NotificationMessage').fadeOut();

                        setTimeout(function () {
                            $('#CheckMarkDiv').fadeIn();
                            $('#NotificationMessage').text("Reservation successful");
                            $('#NotificationMessage').fadeIn();
                        }, 500);

                        setTimeout(function () {
                            $('#CheckMarkDiv').fadeOut();
                            OnsNotification.hide();
                            homeNavigator.pushPage('viewReservation.html', { animation: defaultTransition, rid: response.data.ReservationId, navigateFrom: Enum.NavigateFrom.Reservation });
                        }, 2000);

                    } else {
                        ons.notification.alert({ message: 'Error Occured!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        OnsNotification.hide();
                    }
                },
                function (error) {
                    ons.notification.alert({ message: 'Error Occured!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                    OnsNotification.hide();
                    logInfo(request, error, 'warn');
                });
        }
    });
});
