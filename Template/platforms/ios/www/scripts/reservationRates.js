myApp.factory('ReservationRateModel', function () {
    var obj = {};
    obj.rate = 'Rate Name';
    obj.RateInfo = {};
    return obj;
});

myApp.controller('ReservationRatesCtrl', function ($scope, $rootScope, $http, AppContext, ReservationCheckOutModel, ReservationRateModel, Enum) {

    ons.ready(function () {

        $scope.info = ReservationRateModel;
        $scope.info.currencyformat = AppContext.getUserContext().Currency;
        var data = homeNavigator.getCurrentPage().options.data;
        
        var ci = ReservationCheckOutModel;
        var checkinString = ci.checkInDate.toString("MM/dd/yyyy HH:mm");
        var checkoutString = ci.checkOutDate.toString("MM/dd/yyyy HH:mm");

        var request = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetRateTypes, [AppContext.getUserContext().ClientId, data.vehicletype.ID, data.location.ID]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(request).then(
            function (response) {
                if (response.data === "") {
                    console.log(request.url + "load failed!");

                } else {
                    $scope.checkOutRates = response.data;
                    $scope.info.rate = response.data[0];
                    $scope.LoadRateDetails($scope.info.rate);
                    $('#checkOutRateConfirm').attr('disabled', true);
                }
            },
            function (error) {
                logInfo(request, error, 'warn');
            });

        $scope.setRate = function (rate) {
            
            $scope.info.rate = rate;
            $scope.LoadRateDetails(rate);
        };

        $scope.LoadRateDetails = function (RateName) {

            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.GetRateDetail, []),
                data: {
                    clientId: AppContext.getUserContext().ClientId,
                    vehicleTypeId: data.vehicletype.ID,
                    LocationId: data.location.ID,
                    RateName: RateName,
                    isLowest: false,
                    checkOutDate: checkoutString,
                    checkInDate: checkinString,
                    returnDate: null,
                    reservationId: null,
                    agreementId: null
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {
                    if (response.data === "") {
                        console.log(request.url + "load failed!");
                    } else {
                        $scope.info.RateInfo = response.data[0].Rate;
                        $scope.info.RateInfo.StartDate = moment(response.data[0].StartDateStr, "MM/DD/YYYY hh:mm:ss A");
                        $scope.info.RateInfo.StartDate = $scope.info.RateInfo.StartDate.format("YYYY.MM.D, hh:mm A");
                        //$scope.info.RateInfo.StartDate = response.data[0].StartDateStr;
                        $scope.info.RateInfo.EndDate = moment(response.data[0].EndDateStr, "MM/DD/YYYY hh:mm:ss A");
                        $scope.info.RateInfo.EndDate = $scope.info.RateInfo.EndDate.format("YYYY.MM.D, hh:mm A");
                        //$scope.info.RateInfo.EndDate = response.data[0].EndDateStr;
                        $scope.info.RateInfo.HourlyRate = $scope.info.RateInfo.HourlyRate.toFixed(2);
                        $scope.info.RateInfo.HalfDayRate = $scope.info.RateInfo.HalfDayRate.toFixed(2);
                        $scope.info.RateInfo.DailyRate = $scope.info.RateInfo.DailyRate.toFixed(2);
                        $scope.info.RateInfo.WeekEndRate = $scope.info.RateInfo.WeekEndRate.toFixed(2);
                        $scope.info.RateInfo.WeeklyRate = $scope.info.RateInfo.WeeklyRate.toFixed(2);
                        $scope.info.RateInfo.MonthlyRate = $scope.info.RateInfo.MonthlyRate.toFixed(2);
                        $('#checkOutRateConfirm').removeAttr('disabled');
                    }
                },
                function (error) {
                    logInfo(request, error, 'warn');
                });

        }

        $("input.currency").blur(function () {
            this.value = parseFloat(this.value.replace(/,/g, "")).toFixed(2);
        });

        $scope.navigate = function () {
            $scope.val = ReservationRateModel;
            data.RateInfo = $scope.val.RateInfo;
            $scope.homeNavigator.pushPage('reservationCharges.html', { animation: defaultTransition, data: data });
        };

    });
});
