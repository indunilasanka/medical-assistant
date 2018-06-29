var createAgreementSignatureCanvas;

myApp.controller('createAgreementSign', function ($scope) {
    isCreateAgreementSignEmpty = true;
    createAgreementSignatureCanvas = document.getElementById('createAgreementSignatureCanvas');
    var options = {
        defaultAction: 'drawIt',
        penColour: '#2c3e50',
        bgColour: 'rgba(0, 0, 0, 0)',
        lineWidth: 0
    }
    var canvas = $('.sigPad').signaturePad(options);
    $scope.signed = function () {
        isCreateAgreementSignEmpty = false;
    }
    $scope.clear = function () {
        isCreateAgreementSignEmpty = true;
        canvas.clearCanvas();
    }
});

myApp.controller('createAgreementCtrl', function ($scope, $http, ViewAgreement, ExCustomer, CheckOutInfo, ReservationModel, AddDamage, AppContext, AgreementCharges, MiscOptions, CheckOutRateInfo, Enum) {

    $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;
    var cid = AppContext.getUserContext().ClientId;
    var resData = ReservationModel.getReservationData();
    //console.log(resData);
    OnsNotification.show();
    $('#LoadingLoopDiv').fadeIn();
    $('#NotificationMessage').fadeIn();
    $('#NotificationMessage').text("Loading...");
    var request = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetTerms, [cid, Enum.TermType.CheckOut]),
        headers: {
            'Content-Type': 'application/json',
        }
    }

    $http(request).then(
        function (response) {
            if (response.data.length > 0) {
                OnsNotification.hide();
                $scope.terms = response.data;
                $scope.loading = false;
            } else {
                $scope.terms = response.data;
                $scope.loading = false;
            }
        },
        function (error) {
            logInfo(request, error, 'warn');
        });

    ons.ready(function () {


        $scope.info = ViewAgreement;
        var nc = ExCustomer.getCustomerInfo();
        var ci = CheckOutInfo;
        var ri = CheckOutRateInfo;

        var mo = MiscOptions;

        //date strings are sent to the service to solve timezone difference issue
        var checkinString = ci.checkInDate.toString("MM/dd/yyyy HH:mm");
        var checkoutString = ci.checkOutDate.toString("MM/dd/yyyy HH:mm");

        var Rates = {
            HourlyRate: ri.RateInfo.HourlyRate,
            HalfDayRate: ri.RateInfo.HalfDayRate,
            WeekEndRate: ri.RateInfo.WeekEndRate,
            DailyRate: ri.RateInfo.DailyRate,
            WeeklyRate: ri.RateInfo.WeeklyRate,
            MonthlyRate: ri.RateInfo.MonthlyRate,

            HourlyQty: ri.RateInfo.HourlyQty,
            HalfDayQty: ri.RateInfo.HalfDayQty,
            DailyQty: ri.RateInfo.DailyQty,
            WeekendDailyQty: ri.RateInfo.WeekendDailyQty,
            WeeklyQty: ri.RateInfo.WeeklyQty,
            MonthlyQty: ri.RateInfo.MonthlyQty,

            ExtraHourlyRate: ri.RateInfo.ExtraHourlyRate,
            ExtraDailyRate: ri.RateInfo.ExtraDailyRate,
            ExtraWeekEndRate: ri.RateInfo.ExtraWeekEndRate,
            ExtraWeeklyRate: ri.RateInfo.ExtraWeeklyRate,
            ExtraMonthlyRate: ri.RateInfo.ExtraMonthlyRate,

            DailyMailageAllowed: ri.RateInfo.DailyMailageAllowed,
            WeeklyMailageAllowed: ri.RateInfo.WeeklyMailageAllowed,
            MonthlyMailageAllowed: ri.RateInfo.MonthlyMailageAllowed,

            RateId: ri.RateInfo.RateId,
            RateName: ri.RateInfo.RateName

        }
        var agreement = {
            Address: nc.Address,
            AgreementId: "",
            AgreementNo: ci.agreementNo,
            AgreementType: ci.TypeName.TypeName,
            AmountPaid : Number(ci.AmountPaid),

            CheckInString: checkinString,
            CheckinOdometer: "",
            CheckOutString: checkoutString,
            CheckoutLocation: "",
            CheckoutOdometer: ci.vehicle.CurrentOdometer,
            City: nc.City,
            CountryId: nc.CountryId,
            CustomerID: nc.CustomerId,

            DateOfBirth: nc.DateOfBirth,
            DeviceType: "",

            email: "",

            Firstname: nc.FirstName,
            FuelLevelOut: CheckOutInfo.fuelLevel.Value,

            LastName: nc.LastName,
            LocationID: ci.location.ID,
            LDW: mo.LDW,

            Make: ci.vehicleInfo.Make,
            MakeId: "",
            Model: ci.vehicleInfo.Model,
            ModelId: "",
            MiscChargeList: AgreementCharges.getMisc(),


            Phone: nc.Phone,
            PlateExpairyDate: "",
            PlateNo: ci.vehicleInfo.LicenseNo,
            PlateType: "",
            Province: "",
            ProvinceId: "",

            Rates: Rates,

            status: ci.vehicleInfo.Status,

            TaxList: AgreementCharges.getTax(),
            TLDW: mo.TLDW,
            TotalAmount: Number(ci.TotalAmount),

            VehicleId: ci.vehicleInfo.VehcileID,
            VehicleTypeId: ci.vehicleInfo.VehcileTypeID,
            VehicleNo: ci.vehicleInfo.VehcileNo,

            Year: ci.vehicleInfo.Year,
            ZipCode: nc.ZipCode,

            PromoCode: ci.promoCode,
            PromoCodeID: Number(ci.promoCodeID),
            PromoDiscount: Number(ci.promoDiscount),
            PreTax: Number(ci.PreTax),
            PostTax: Number(ci.PostTax),

        }

        function ChangeResStatus() {

            var url = AppContext.getUrl(Enum.Url.UpdateReservationStatus, [cid, resData.ReservationId, Enum.ReservationStatus.CheckOut]);

            var request = {
                method: 'POST',
                crossDomain: true,
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                }
            }

            $http(request).then(function (response) {

            }, function (error) {
                logInfo(request, error, 'warn');
            });
        }

        $scope.submit = function () {

            var options = {
                defaultAction: 'drawIt',
                penColour: '#2c3e50',
                lineWidth: 0,
                bgColour: 'rgba(0, 0, 0, 0)',
                drawOnly: true
            }
            var canvas = $('.sigPad').signaturePad(options);
            isCreateAgreementSignEmpty = (canvas.getSignature().length == 0);

            var allAccepeted = true;
            $(".term-checkbox").each(function () {
                if (!$(this).is(':checked')) {
                    allAccepeted = false;
                }
            });

            if (allAccepeted) {

                if (isCreateAgreementSignEmpty) {
                    ons.notification.alert({ message: 'Sign is Required', title: 'Error!', buttonLabel: 'OK' });
                    return;
                }

                //*****IMPORTANT****
                //saveNotificationModal.show();
                OnsNotification.show();
                $('#LoadingLoopDiv').fadeIn();
                $('#NotificationMessage').fadeIn();
                $('#NotificationMessage').text("Saving...");
                //create new agreement
                url = AppContext.getUrl(Enum.Url.CheckoutAgreement, []);
                var request = {
                    method: 'POST',
                    crossDomain: true,
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        agreement: agreement,
                        clientId: cid

                    }
                }
                $http(request).then(
                    function (response) {
                        if (response.data > 0) {

                            //save signature sign
                            var dataURL = createAgreementSignatureCanvas.toDataURL();
                            // console.log('' + dataURL);

                            var url = AppContext.getUrl(Enum.Url.SaveAgreementSign, []);

                            var request = {
                                method: 'POST',
                                crossDomain: true,
                                url: url,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    agreementId: response.data,
                                    base64Img: dataURL

                                }
                            }

                            $http(request).then(
                                function (response) {
                                    if (response.data == "success") {
                                        if ($scope.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                                            ChangeResStatus();
                                        }
                                        $('#LoadingLoopDiv').fadeOut();
                                        $('#NotificationMessage').fadeOut();

                                        setTimeout(function () {
                                            $('#CheckMarkDiv').fadeIn();
                                            $('#NotificationMessage').text("CheckOut successful");
                                            $('#NotificationMessage').fadeIn();
                                        }, 500);

                                        setTimeout(function () {
                                            $('#CheckMarkDiv').fadeOut();
                                            OnsNotification.hide();
                                            $scope.homeNavigator.pushPage('viewAgreement.html', { animation: defaultTransition, aid: request.data.agreementId, navigateFrom: $scope.navigateFrom });
                                            angular.copy(null, CheckOutRateInfo);
                                            angular.copy(null, CheckOutInfo.resData);

                                            //menu.setMainPage('home.html', { animation: defaultTransition });
                                        }, 2000);
                                    } else {
                                        OnsNotification.hide();
                                        ons.notification.alert({ message: 'Save Agreement Sign Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                                    }
                                },
                                function (error) {
                                    OnsNotification.hide();
                                    ons.notification.alert({ message: 'Save Agreement Sign Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                                    logInfo(request, error, 'warn');
                                });

                        } else {
                            OnsNotification.hide();
                            ons.notification.alert({ message: 'Could not create the Agreement!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        }

                    },
                    function (error) {
                        logInfo(request, error, 'warn');
                    });

                //*********************IMPORTANT**********************

                setTimeout(function () {
                    $('#message').text("Saving Damages..");
                }, 500);
                setTimeout(function () {

                    $('#message').text("Saving Agreement..");
                }, 750);
                setTimeout(function () {
                    $('#pleaseWaitDiv').fadeOut();

                }, 1000);
            }
            else {

                ons.notification.confirm({
                    title: 'Action Required',
                    messageHTML: "You <b>must</b> accept all the conditions to continue",
                    buttonLabels: ["Accept all", "Cancel"],
                    callback: function (idx) {
                        switch (idx) {
                            case 0:
                                $(".term-checkbox").each(function () {
                                    $(this).prop('checked', true);
                                });
                                $('#allAccept').prop('checked', true);
                                break;
                        }
                    }
                });
            }
        };

        $scope.acceptAllFunction = function () {
            if ($scope.selectedAll) {
                $(".term-checkbox").each(function () {
                    $(this).prop('checked', true);
                });
            } else {
                $(".term-checkbox").each(function () {
                    $(this).prop('checked', false);
                });
            }
        };

    });
});
