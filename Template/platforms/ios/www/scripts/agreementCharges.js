myApp.factory('AgreementCharges', function ($rootScope) {
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

myApp.factory('MiscOptions', function () {
    var obj = {};
    return obj;
});

myApp.controller('miscChargeCntrl', function ($scope, AppContext, $http, AgreementCharges, CheckOutInfo, MiscOptions, Enum) {

    //$scope = {};

    ons.ready(function () {

        var count = 0;
        $('#miscChargeConfirm').attr('disabled');

        var data = homeNavigator.getCurrentPage().options.data;
        var reservationData = homeNavigator.getCurrentPage().options.resData;
        $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;

        $scope.MiscOptions = MiscOptions;
        $scope.MiscOptions.LDW = undefined;
        $scope.MiscOptions.TLDW = undefined;
        //MISC Charges
        var requestMisc = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetMiscCharges, [data.location.ID, data.vehicleInfo.VehcileTypeID, AppContext.getUserContext().ClientId]),
        }

        $http(requestMisc).then(
            function (response) {
                if (++count == 2) {
                    $('#miscChargeConfirm').removeAttr('disabled');
                }
                if (response.data != null) {
                    for (var i = 0; i < response.data.length; i++) {
                        response.data[i].Value = response.data[i].Value.toFixed(2);
                    }
                    if (!(typeof reservationData.MiscChargeList === 'undefined' || reservationData.MiscChargeList === null)) {
                        var resMiscList = homeNavigator.getCurrentPage().options.resData.MiscChargeList;
                        for (var i = 0; i < response.data.length; i++) {
                            for (var j = 0; j < resMiscList.length; j++) {
                                if (response.data[i].MiscChargeID == resMiscList[j].MiscChargeID) {
                                    var options = response.data[i].MiscOptions;
                                    response.data[i].IsSelected =true;
                                    response.data[i].Value = resMiscList[j].Value;
                                    response.data[i].Value = Number(response.data[i].Value).toFixed(2);
                                    response.data[i].MiscOptions = [];
                                    if (options != null) {
                                        response.data[i].MiscOptions = options.slice();
                                    }

                                    if (reservationData.LDW != 0 && response.data[i].MiscChargeID == 1) {
                                        for (var k = 0; k < response.data[i].MiscOptions.length; k++) {
                                            if (response.data[i].MiscOptions[k].Option == reservationData.LDW) {
                                                var id = response.data[i].MiscOptions[k].MischargeOptionID;
                                                $scope.LDWid = id;
                                            }
                                        }
                                    }
                                    if (reservationData.TLDW != 0 && response.data[i].MiscChargeID == 9) {
                                        for (var l = 0; l < response.data[i].MiscOptions.length; l++) {
                                            if (response.data[i].MiscOptions[l].Option == reservationData.TLDW) {
                                                var id = response.data[i].MiscOptions[l].MischargeOptionID;
                                                $scope.TLDWid = id;
                                            }
                                        }
                                    }

                                    
                                }
                            }
                        }

                    }
                    AgreementCharges.setMisc(response.data);
                    $scope.miscChargesList = response.data;
                    $scope.currencyformat = AppContext.getUserContext().Currency;
                } else {
                    $scope.noMisc = true;
                }
            },
            function (error) {
                ons.notification.alert({ message: 'Could not connect to the server', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                $scope.noMisc = true;
                if (++count == 2) {
                    $('#miscChargeConfirm').removeAttr('disabled');
                }
                logInfo(requestMisc, error, 'warn');
            });

        $scope.setCurrency = function (model) {
            model.Value = Number(model.Value).toFixed(2);
        }

        var checkLDWExist = setInterval(function () {
            if ($('#' + $scope.LDWid).length) {
                if (!(typeof reservationData.MiscChargeList === 'undefined' || reservationData.MiscChargeList === null)) {
                    setSelectedOption($scope.LDWid);
                }
                clearInterval(checkLDWExist);
            }
        }, 100);

        var checkTLDWExist = setInterval(function () {
            if ($('#' + $scope.TLDWid).length) {
                if (!(typeof reservationData.MiscChargeList === 'undefined' || reservationData.MiscChargeList === null)) {
                    setSelectedOption($scope.TLDWid);
                }
                clearInterval(checkTLDWExist);
            }
        }, 100);

        function setSelectedOption(element) {
            $("#" + element).prop("checked", true);
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

        //TAX charges
        var requestTax = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetTax, [data.location.ID, AppContext.getUserContext().ClientId]),
        }

        $http(requestTax).then(
            function (response) {
                if (++count == 2) {
                    $('#miscChargeConfirm').removeAttr('disabled');
                }
                if (response.data != null) {
                    if (!(typeof reservationData.TaxList === 'undefined' || reservationData.TaxList === null)) {
                        var resTaxList = homeNavigator.getCurrentPage().options.resData.TaxList;
                        for (var i = 0; i < response.data.length; i++) {
                            for (var j = 0; j < resTaxList.length; j++) {
                                if (response.data[i].TaxID == resTaxList[j].TaxID) {
                                    response.data[i] = resTaxList[j];
                                }
                            }
                        }
                    }
                    AgreementCharges.setTax(response.data);
                    $scope.taxChargesList = response.data;

                } else {
                    $scope.noTax = true;
                }
            },
            function (error) {
                ons.notification.alert({ message: 'Could not connect to the server', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                if (++count == 2) {
                    $scope.noTax = true;
                    $('#miscChargeConfirm').removeAttr('disabled');
                }
                logInfo(requestTax, error, 'warn');
            });

        $scope.submit = function () {
            $scope.homeNavigator.pushPage('checkOutCharges.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
        }
    });
});
