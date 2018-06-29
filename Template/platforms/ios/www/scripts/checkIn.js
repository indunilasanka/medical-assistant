myApp.factory('CheckinInfo', function () {

    var obj = {};
    obj.status = { id: 2, Value: 'Available' };

    return obj;
});

myApp.factory('AgreementDetails', function () {
    var obj = {};
    return obj;
});

myApp.controller('checkInlocation', function ($scope, $rootScope, $http, AppContext, CheckinInfo, AgreementDetails, Enum) {
    ons.ready(function () {
        $scope.info = CheckinInfo;
        $scope.tip = AgreementDetails;
        var request = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetLocations, [AppContext.getUserContext().ClientId]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(request).then(
            function (response) {
                if (response.data === "") {
                    console.log(request.url + "load failed!");

                }
                else {
                    $scope.checkInlocations = response.data;
                    $scope.info.location = $scope.checkInlocations[0];
                    var agreement = homeNavigator.getCurrentPage().options.agreement;
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].ID == agreement.LocationID) {
                            $scope.info.location = response.data[i]
                            $scope.setLocation();
                        }
                    }
                   
               }
            },
            function (error) {
                console.log("error : " + error);
            });

        $scope.setLocation = function () {
            $scope.tip.LocationID = $scope.info.location.ID;
        };
    });
});

myApp.controller('checkInStatus', function ($scope, CheckinInfo, AgreementDetails) {
    ons.ready(function () {
        $scope.tip = AgreementDetails;
        $scope.info = CheckinInfo;
        $scope.checkInStatus = [{ id: 1, Value: 'Accident' }, { id: 2, Value: 'Available' }, { id: 3, Value: 'In Repair' }, { id: 4, Value: 'Stolen' }];

        $scope.info.status = $scope.checkInStatus[0];

;        $scope.setStatus = function () {
            $scope.tip.status =  $scope.info.status.id;
        };
    });
});

myApp.controller('checkInfuelLevel', function ($scope, CheckinInfo, AgreementDetails, Enum, AppContext) {
    ons.ready(function () {
        $scope.tip = AgreementDetails;
        $scope.info = CheckinInfo;
        $scope.checkInfuelLevels =
            [{ id: 0, Value: 'Empty' }, { id: 0.25, Value: 'Quarter' }, { id: 0.5, Value: 'Half' }, { id: 0.75, Value: '3 Quarter' }, { id: 1, Value: 'Full' }];
        //
        if (AppContext.getUserContext().Features.indexOf(Enum.FeatureType.FUELLEVEL_EIGHT) != -1) {
            $scope.checkInfuelLevels =
            [{ id: 1, Value: 'Empty' }, { id: 2, Value: 'OneEight' }, { id: 2, Value: 'Quarter' }, { id: 2, Value: 'ThreeEight' },
                { id: 3, Value: 'Half' }, { id: 2, Value: 'FiveEight' }, { id: 4, Value: '3 Quarter' }, { id: 2, Value: 'SevenEight' }, { id: 5, Value: 'Full' }];
        }
        else {
            $scope.checkInfuelLevels =
            [{ id: 1, Value: 'Empty' }, { id: 2, Value: 'Quarter' }, { id: 3, Value: 'Half' }, { id: 4, Value: '3 Quarter' }, { id: 5, Value: 'Full' }];
        }

        $scope.info.fuelLevel = $scope.checkInfuelLevels[0];

        //
        $scope.setFuelLevel = function () {
            $scope.tip.FuelLevelIn = $scope.info.fuelLevel.Value;
            $scope.$root.$broadcast("changeFuelLevelInEvent");
        };
    });
});


myApp.controller('popOverExtraCharges', function ($scope, AgreementDetails) {
    ons.ready(function () {
        $scope.tip = AgreementDetails;
    });
});


myApp.controller('checkOutDetails', function ($scope) {
    ons.ready(function () {
        ons.createPopover('checkOutDetailsSummary.html').then(function (popover) {
            $scope.popover = popover;

        });
    });

});


myApp.controller('CheckOutDetailsSummary', function ($scope, AgreementDetails) {
    $scope.tip = AgreementDetails;
});

myApp.controller('checkInAddDamages', function ($scope, AgreementDetails) {
    ons.ready(function () {
        $scope.navigateToCheckDamage = function () {
            var vehicleId = homeNavigator.getCurrentPage().options.agreement.VehicleId;
            $scope.homeNavigator.pushPage('checkDamage.html', { animation: defaultTransition, vehicleId: vehicleId, agreementId: AgreementDetails.AgreementId });
        };
    });
});
//validate form details and request to load agreement details
myApp.controller('checkInFormCntrl', function ($scope, notify, AgreementDetails, CheckinInfo, $http, AppContext, Enum) {
    ons.ready(function () {

     ons.createPopover('checkInExtrtaPopover.html').then(function (popover) {
            $scope.popover = popover;

        });


        $scope.tip = AgreementDetails;
        $scope.info = CheckinInfo;
        var agreement = homeNavigator.getCurrentPage().options.agreement;
        angular.copy(agreement, $scope.tip);
        angular.copy(null, $scope.info.fuelLevel);
        if ($scope.tip.CheckinOdometer == 0) { $scope.tip.CheckinOdometer = null; }
        $scope.validateReturnDate = function () {

            if ($scope.tip.ReturnDate < $scope.tip.CheckOut) {
                $scope.tip.ReturnDate = $scope.tip.CheckOut;
                ons.notification.alert({ message: 'Invalid Return Date', title: null, animation: 'slide', buttonLabel: 'OK' });
            } else {
                $scope.calculateCharges();
            }
        }

        $scope.validateOdometerIn = function () {

            if ($scope.tip.CheckinOdometer <= $scope.tip.CheckoutOdometer) {
                var massage = 'Odometer in should be greater than ' + $scope.tip.CheckoutOdometer;

                //notify({ position: 'center', message: massage, classes: 'alert-danger', duration: 3000 });
                
                ons.notification.alert({ message: massage, title: null, animation: 'slide', buttonLabel: 'OK' });

                $scope.tip.CheckinOdometer = $scope.tip.CheckoutOdometer;
                $scope.tip.CheckinOdometer++;
            } else {
                $scope.calculateCharges();
            }
        }
        $scope.CalculateFuelLevelIn = function () {
            $scope.calculateCharges();
        }

        $scope.$on("changeFuelLevelInEvent", function () {
            $scope.calculateCharges();
        });

        if (agreement.PromoCode != "--") {

            var request = {
                method: 'GET',

                url: AppContext.getUrl(Enum.Url.GetPromotion, [agreement.PromoCode, agreement.VehicleTypeId, agreement.LocationID, AppContext.getUserContext().ClientId, agreement.CheckOutString, agreement.CheckInString]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
               function (response) {
                   $scope.tip.DiscountTypeNo = response.data.Promotion.DiscountTypeNo;
                   $scope.tip.DiscountValue = response.data.Promotion.DiscountValue;
                   $scope.calculateCharges();
               },
               function (error) {
                   logInfo(request, error, 'warn');
               });
        }

        $scope.calculateCharges = function () {
            var locId = ($scope.tip.LocationID == null) ? agreement.LocationID : $scope.tip.LocationID;
            var checkoutDate = $scope.tip.CheckOut;
            var checkinDate = $scope.tip.CheckIn;
            var returnDate = $scope.tip.ReturnDate;
            $scope.tip.PreTax = ($scope.tip.PreTax == null) ? 0 : $scope.tip.PreTax;
            $scope.tip.FuelLevelIn = $scope.tip.FuelLevelIn == null ? "Empty" : $scope.tip.FuelLevelIn;
            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.GetRateDetail, []),
                async: false,
                data: {
                    clientId: AppContext.getUserContext().ClientId,
                    vehicleTypeId: agreement.VehicleTypeId,
                    LocationId: agreement.LocationID,
                    AgreementType: agreement.AgreementType,
                    RateName: agreement.Rates.RateName,
                    isLowest: agreement.LowestRate,
                    checkOutDate: checkoutDate._d.toString("MM/dd/yyyy HH:mm"),
                    checkInDate: checkinDate._d.toString("MM/dd/yyyy HH:mm"),
                    returnDate: returnDate.toString("MM/dd/yyyy HH:mm"),
                    reservationId: null,
                    agreementId: agreement.AgreementId
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {

                    if (response.data === "") {
                        ons.notification.alert({ message: 'Error Occured while fetching rates', title: 'Error...', animation: 'slide', buttonLabel: 'OK' });
                    } else {
                        rate = response.data[0].Rate;
                        $scope.tip.Rates = rate;
                        $scope.tip.Rates.StartDateStr = response.data[0].StartDateStr;
                        $scope.tip.Rates.EndDateStr = response.data[0].EndDateStr;
                        var charges = calCharges(checkoutDate, checkinDate, returnDate, agreement, $scope.tip, rate, AppContext, Enum);

                        $scope.tip.baseCharge = charges.base;
                        $scope.tip.FinalBaseCharge = charges.finalBase;
                        $scope.tip.KMCharge = charges.extraKM;
                        $scope.tip.ExtraDuration = charges.extraDuration;
                        $scope.tip.OtherCharges = charges.otherCharges;
                        $scope.tip.FuelCharge = charges.fuelCharge;
                        $scope.tip.SubTotal = charges.subTotal;
                        $scope.tip.TotalTax = ((charges.subTotal * $scope.tip.TaxPercentage) / 100).toFixed(2);
                        $scope.tip.MiscNonTax = charges.miscNonTax;
                        $scope.tip.TotalAmount = charges.total;
                        $scope.tip.TotalDue = charges.totalDue;
                        $scope.tip.AmountPaid = charges.amountPaid;
                        $scope.tip.AdvancePaid = charges.advancePaid;
                        $scope.tip.MiscTax = charges.miscTax;
                    }
                },
                function (error) {
                    loadingRates = false;
                    logInfo(request, error, 'warn');
                });
        };

        //var newDate = new Date();
        var Datestr = new Date();

        var x = new Date(Datestr.getFullYear(), Datestr.getMonth(), Datestr.getDate(), Datestr.getHours(), Datestr.getMinutes(), 0, 0);
        $scope.tip.ReturnDate = new Date(x);

        $scope.calculateCharges();

        $scope.validateCheckin = function (val) {
            $scope.validateForm = function (form) {
                $scope.tip.AdvancePaid = Number($scope.tip.AdvancePaid);
                if (form.$valid) {
                    $scope.tip.ReturnDateString = $scope.tip.ReturnDate.toString("MM/dd/yyyy HH:mm");
                    //checkinSavedModal.show();
                    //$('#finalMessage').text("Checkin in process");
                    var vehicleId = homeNavigator.getCurrentPage().options.agreement.VehicleId;
                    console.log($scope.tip.CheckIn + "|" + $scope.tip.CheckinOdometer);
                    $scope.tip.CheckIn = $scope.tip.CheckIn;


                    $scope.homeNavigator.pushPage('checkinTerms.html', { animation: defaultTransition, agreement: $scope.tip });

                    //var requestToSave = {
                    //    method: 'POST',

                    //    url: AppContext.getUrl(Enum.Url.CheckinAgreement, []),
                    //    headers: {
                    //        'Content-Type': 'application/json'
                    //    },
                    //    data: {
                    //        agreement: $scope.tip,
                    //        clientId: AppContext.getUserContext().ClientId
                    //    }
                    //}

                    //$http(requestToSave).then(
                    //    function (response) {
                    //        if (response.data === "") {
                    //            console.log(requestToSave.url + "load failed!");

                    //        } else {

                    //            $('#CheckinLoadingIcon').fadeOut();
                    //            $('#finalMessage').fadeOut();

                    //            setTimeout(function () {
                    //                $('#CheckedInicon').fadeIn();
                    //                $('#finalMessage').text("Checkin successful");
                    //                $('#finalMessage').fadeIn();
                    //            }, 500);

                    //            setTimeout(function () {
                    //                checkinSavedModal.hide();
                    //                $scope.homeNavigator.pushPage('viewAgreement.html', { animation: defaultTransition, aid: $scope.tip.AgreementId, navigateFrom: Enum.NavigateFrom.Home });
                    //                //menu.setMainPage('home.html', { animation: defaultTransition });
                    //            }, 2000);

                    //        }
                    //    },
                    //    function (error) {
                    //        logInfo(request, error, 'warn');
                    //    });
                }
            };
            if (val == "vehicleCheckInDate" || val == "buttonPress") {
                $("#vehicleCheckInDate").fadeOut();
                $("#vehicleCheckInDate").fadeIn();
            }
            if (val == "checkinVehicleOdometer" || val == "buttonPress") {
                $("#checkinVehicleOdometer").fadeOut();
                $("#checkinVehicleOdometer").fadeIn();
            }
            if (val == "checkInFuelLevel" || val == "buttonPress") {
                $("#checkInFuelLevel").fadeOut();
                $("#checkInFuelLevel").fadeIn();
            }
        };

    });
});

function calCharges(checkoutDate, checkinDate, returnDate, ag, scope, rate, AppContext, Enum) {

    //base Charge
    var base = getBaseCharge(rate);

    //promotion
    if ((checkinDate > returnDate)) {
        if (typeof scope.DiscountTypeNo != 'undefined') {
            if (scope.DiscountTypeNo == 2) {
                scope.PromoDiscount = scope.DiscountValue;
            } else if (scope.DiscountTypeNo == 3) {
                scope.PromoDiscount = (base * scope.DiscountValue) / 100;
            }
        }
    } else {
        scope.PromoDiscount = ag.PromoDiscount;
    }


    //extra KM charge calculation
    var extraKMCharges = getExtraKM(rate, scope, ag);

    //extra duration charge calculation
    var extraDuration = getExtraDuration(rate);

    // all misc charges
    var totalMisc = getMiscCharge(ag, rate);

    //other charges
    var otherCharges = (totalMisc.MiscWithTax + extraDuration + extraKMCharges);

    //fuel Charges
    var fuelCharge = getFuelCharge(ag, scope, AppContext, Enum);

    //subtotal calculations with misctax
    var subTotal = base - scope.PromoDiscount + otherCharges + parseFloat(scope.PreTax);

    //tax
    scope.TotalTax = ((subTotal * scope.TaxPercentage) / 100).toFixed(2);

    //misc without tax
    var MiscNonTax = totalMisc.MiscWithOutTax;

    scope.AdditionalCharge = (scope.AdditionalCharge == null) ? 0 : scope.AdditionalCharge;
    scope.PostTax = (scope.PostTax == null) ? 0 : scope.PostTax;

    var taxFloat = parseFloat(scope.TotalTax);
    var additionalFloat = parseFloat(scope.AdditionalCharge);
    var postTaxFloat = parseFloat(scope.PostTax);
    var AmountPaidFloat = parseFloat(scope.AmountPaid);
    var AdvancePaidFloat = parseFloat(scope.AdvancePaid);
    var total = (subTotal + taxFloat + MiscNonTax + fuelCharge + additionalFloat +
        ag.TollCharge + ag.FineCharge);
    var totalDue = (subTotal + taxFloat + MiscNonTax + fuelCharge + additionalFloat +
        ag.TollCharge + ag.FineCharge + postTaxFloat) - AmountPaidFloat - AdvancePaidFloat;

    //calculated final charges
    var result = {
        base: base.toFixed(2),
        finalBase: ((base.toFixed(2)) - scope.PromoDiscount).toFixed(2),
        miscTax: totalMisc.MiscWithTax.toFixed(2),
        extraKM: extraKMCharges.toFixed(2),
        extraDuration: extraDuration.toFixed(2),
        otherCharges: otherCharges.toFixed(2),
        fuelCharge: fuelCharge.toFixed(2),
        subTotal: subTotal.toFixed(2),
        total: total.toFixed(2),
        amountPaid: AmountPaidFloat.toFixed(2),
        advancePaid: AdvancePaidFloat.toFixed(2),
        totalDue: totalDue.toFixed(2),
        miscNonTax: MiscNonTax.toFixed(2)
    }
    return result;
}

function getBaseCharge(rate) {
    var base = (rate.HourlyQty * rate.HourlyRate) + (rate.DailyQty * rate.DailyRate) + (rate.WeekendDailyQty * rate.WeekEndRate) + (rate.WeeklyQty * rate.WeeklyRate) + (rate.MonthlyQty * rate.MonthlyRate);
    base = (base < 0) ? 0 : base;
    return base;
}

function getExtraKM(rate, scope, ag) {
    var kmAllowed = ((rate.ExtraDailyQty + rate.DailyQty + rate.ExtraWeekEndDayQty + rate.WeekendDailyQty) * rate.DailyMailageAllowed) + ((rate.ExtraWeeklyQty + rate.WeeklyQty) * rate.WeeklyMailageAllowed) + (rate.MonthlyQty * rate.MonthlyMailageAllowed);
    var odoDiff = scope.CheckinOdometer - ag.CheckoutOdometer;
    var extraKMCharges;
    if (kmAllowed <= odoDiff) {
        var extraKM = odoDiff - kmAllowed;
        extraKMCharges = extraKM * rate.MilageCharge;
    }
    extraKMCharges = (extraKMCharges == null) ? 0 : extraKMCharges;
    return extraKMCharges;
}

function getExtraDuration(rate) {
    var extraDuration = 0;
    extraDuration = (rate.ExtraHourlyQty * rate.ExtraHourlyRate) + (rate.ExtraDailyQty * rate.ExtraDailyRate) + (rate.ExtraWeekEndDayQty * rate.ExtraWeekEndRate) + (rate.ExtraWeeklyQty * rate.ExtraWeeklyRate);
    return extraDuration
}

function getMiscCharge(ag, rate) {
    var MiscWithOutTax = 0;
    var MiscWithTax = 0;
    var miscCharge = { MiscWithOutTax: 0, MiscWithTax: 0 };
    var MiscDays = rate.DailyQty + rate.ExtraDailyQty + rate.WeekendDailyQty + rate.ExtraWeekEndDayQty + (rate.WeeklyQty * 7) + (rate.ExtraWeeklyQty * 7);
    for (var i = 0; i < ag.MiscChargeList.length; i++) {

        if (ag.MiscChargeList[i].CalculationType == 3) {
            if (ag.MiscChargeList[i].TaxNotAvailable) {
                MiscWithOutTax = MiscDays * ag.MiscChargeList[i].Value;
                miscCharge.MiscWithOutTax += MiscWithOutTax;
            } else {
                MiscWithTax = MiscDays * ag.MiscChargeList[i].Value;
                miscCharge.MiscWithTax += MiscWithTax;
            }
        }
        if (ag.MiscChargeList[i].CalculationType == 1) {
            if (!ag.MiscChargeList[i].TaxNotAvailable) {
                MiscWithTax = ag.MiscChargeList[i].Value;
                miscCharge.MiscWithTax += MiscWithTax;
            } else {
                MiscWithOutTax = ag.MiscChargeList[i].Value;
                miscCharge.MiscWithOutTax += MiscWithOutTax;
            }
        }


    }
    return miscCharge;
}

function getFuelCharge(ag, scope, AppContext, Enum) {
    var FuelOut = ag.FuelLevelOut;
    var FuelIn = scope.FuelLevelIn;
    var Size = ag.TankSize;
    var FuelOutL = 0;
    var FuelInL = 0;
    var fuelCharge;
    if (AppContext.getUserContext().Features.indexOf(Enum.FeatureType.FUELLEVEL_EIGHT) != -1) {
        FuelOutL = GetEightFuel(FuelOut, Size);
        FuelInL = GetEightFuel(FuelIn, Size);
    }
    else {
        FuelOutL = GetFuel(FuelOut, Size);
        FuelInL = GetFuel(FuelIn, Size);
    }

    var Difference = FuelOutL - FuelInL;

    if (Difference <= 0)
    {
        fuelCharge = 0;
    }
    else
    {
        fuelCharge = Difference * ag.FuelRate;
    }
    return fuelCharge;
}

function GetEightFuel(str, size) {
    var check = str;
    var value = 0;
    switch (check) {
        case "Full":
            value = size;
            break;
        case "SevenEight":
            value = size * 7 / 8;
            break;
        case "ThreeQuarter":
            value = size * 3 / 4;
            break;
        case "FiveEight":
            value = size * 5 / 8;
            break;
        case "Half":
            value = size * 1 / 2;
            break;
        case "ThreeEight":
            value = size * 3 / 8;
            break;
        case "Quarter":
            value = size * 1 / 4;
            break;
        case "OneEight":
            value = size * 1 / 8;
            break;
        case "Empty":
            value = 0;
            break;
    }
    return value;
}

function GetFuel(str, size) {
    var check = str;
    var value = 0;
    switch (check) {
        case "Full":
            value = size;
            break;
        case "ThreeQuater":
            value = size * 3 / 4;
            break;
        case "Half":
            value = size / 2;
            break;
        case "Quater":
            value = size / 4;
            break;
        case "Empty":
            value = 0;
            break;
    }
    return value;
}
