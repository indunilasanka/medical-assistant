myApp.factory('CheckOutRateInfo', function ($rootScope) {
    var obj = {};
    obj.rate = 'Rate Name';
    obj.RateInfo = {};
    obj.resData = {};
    return obj;
});

//Branch(rate) dropdown
myApp.controller('checkOutRate', function ($scope, $http, CheckOutRateInfo, AppContext, Enum) {
    $scope.loading = true;

    ons.ready(function () {
        $scope.info = CheckOutRateInfo;
        var data = homeNavigator.getCurrentPage().options.data;
        $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;
        if (data.resData != null) {
            CheckOutRateInfo.resData = data.resData;
        }
        data.vehicleInfo.CurrentOdometer = data.vehicles.CurrentOdometer;
        data.vehicleInfo.LicenseNo = data.vehicles.LicenseNo;
        data.vehicleInfo.Status = data.vehicles.Status;

        var request = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetRateTypes, [AppContext.getUserContext().ClientId, data.vehicleInfo.VehcileTypeID, data.location.ID]),
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
                    if (!(typeof data.resData.NewRateList === 'undefined' || data.resData.NewRateList === null)) {
                        var resRate = data.resData.NewRateList;
                        if (resRate[0].RateName != "") {
                            $scope.info.rate = resRate[0].RateName;
                            $scope.loading = true;
                            $scope.LoadRateDetails( $scope.info.rate, true);
                        }
                    } else {
                     $scope.LoadRateDetails( $scope.info.rate, false);
                        $scope.loading = true;
                    }
                }
            },
            function (error) {
                logInfo(request, error, 'warn');
            });

        $scope.setRate = function (rate) {
            //angular.copy(null, $scope.info);
            $scope.info.rate = rate;
            $scope.LoadRateDetails(rate, false);
        };

        $scope.info = CheckOutRateInfo;
        $scope.info.currencyformat = AppContext.getUserContext().Currency;
        var data = homeNavigator.getCurrentPage().options.data;
        $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;
        var ci = CheckOutInfo;
        var checkinString = ci.checkInDate.toString("MM/dd/yyyy HH:mm");
        var checkoutString = ci.checkOutDate.toString("MM/dd/yyyy HH:mm");
       
        $scope.LoadRateDetails = function (RateName, isPageLoad) {

            if (isPageLoad) {
                if (!(typeof data.resData.NewRateList[0].RateName === 'undefined' || data.resData.NewRateList[0].RateName === null)) {
                    $scope.info.RateInfo = data.resData.NewRateList[0];
                    $scope.info.RateInfo.StartDate = moment(data.resData.NewRateList[0].StartDateStr, "MM/DD/YYYY hh:mm:ss A");
                    $scope.info.RateInfo.StartDate = $scope.info.RateInfo.StartDate.format("YYYY.MM.D, hh:mm A");
                    $scope.info.RateInfo.EndDate = moment(data.resData.NewRateList[0].EndDateStr, "MM/DD/YYYY hh:mm:ss A");
                    $scope.info.RateInfo.EndDate = $scope.info.RateInfo.EndDate.format("YYYY.MM.D, hh:mm A");
                    $scope.info.RateInfo.HourlyRate = Number(data.resData.NewRateList[0].HourlyRate).toFixed(2);
                    $scope.info.RateInfo.HalfDayRate = Number(data.resData.NewRateList[0].HalfDayRate).toFixed(2);
                    $scope.info.RateInfo.DailyRate = Number(data.resData.NewRateList[0].DailyRate).toFixed(2);
                    $scope.info.RateInfo.WeekEndRate = Number(data.resData.NewRateList[0].WeekEndRate).toFixed(2);
                    $scope.info.RateInfo.WeeklyRate = Number(data.resData.NewRateList[0].WeeklyRate).toFixed(2);
                    $scope.info.RateInfo.MonthlyRate = Number(data.resData.NewRateList[0].MonthlyRate).toFixed(2);
                    $scope.info.RateInfo.DailyMailageAllowed = data.resData.RateInfo.DailyMailageAllowed;
                    $scope.info.RateInfo.WeeklyMailageAllowed = data.resData.RateInfo.WeeklyMailageAllowed;
                    $scope.info.RateInfo.MonthlyMailageAllowed = data.resData.RateInfo.MonthlyMailageAllowed;
                    $scope.loading = false;
                } else {
                    loadRateDetails(RateName);
                }
            }
            else {

                loadRateDetails(RateName);
            }
        }

        $("input.currency").blur(function () {
            this.value = parseFloat(this.value.replace(/,/g, "")).toFixed(2);
        });

        function loadRateDetails(RateName) {
            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.GetRateDetail, []),
                data: {
                    clientId: AppContext.getUserContext().ClientId,
                    vehicleTypeId: data.vehicleInfo.VehcileTypeID,
                    LocationId: data.location.ID,
                    AgreementType: CheckOutInfo.TypeName.TypeName,
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
                        ons.notification.alert({ message: 'Could not load rates', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        console.log(request.url + "load failed!");
                    } else {
                        $scope.info.RateInfo = response.data[0].Rate;
                        $scope.info.RateInfo.StartDate = moment(response.data[0].StartDateStr, "MM/DD/YYYY hh:mm:ss A");
                        $scope.info.RateInfo.StartDate = $scope.info.RateInfo.StartDate.format("YYYY.MM.D, hh:mm A");
                        //$scope.info.RateInfo.StartDate = response.data[0].StartDateStr;
                        $scope.info.RateInfo.EndDate = moment(response.data[0].EndDateStr, "MM/DD/YYYY hh:mm:ss A");
                        $scope.info.RateInfo.EndDate = $scope.info.RateInfo.EndDate.format("YYYY.MM.D, hh:mm A");
                        //$scope.info.RateInfo.EndDate = response.data[0].EndDateStr;
                        //$scope.info.RateInfo.HourlyRate = $scope.info.RateInfo.HourlyRate.toFixed(2);
                        $scope.info.RateInfo.HalfDayRate = Number($scope.info.RateInfo.HalfDayRate).toFixed(2);
                        $scope.info.RateInfo.DailyRate = Number($scope.info.RateInfo.DailyRate).toFixed(2);
                        $scope.info.RateInfo.WeekEndRate = Number($scope.info.RateInfo.WeekEndRate).toFixed(2);
                        $scope.info.RateInfo.WeeklyRate = Number($scope.info.RateInfo.WeeklyRate).toFixed(2);
                        $scope.info.RateInfo.MonthlyRate = Number($scope.info.RateInfo.MonthlyRate).toFixed(2);
                        $scope.loading = false;
                    }
                },
                function (error) {
                    ons.notification.alert({ message: 'Could not load rates', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                });
        }

        //var values = homeNavigator.getCurrentPage().options.data;
        $scope.navigate = function () {
            $scope.val = CheckOutRateInfo;
            data.RateInfo = $scope.val.RateInfo;
            $scope.homeNavigator.pushPage('agreementCharges.html', { animation: defaultTransition, data: data, resData: CheckOutRateInfo.resData, navigateFrom: $scope.navigateFrom });
        };

    });
});
