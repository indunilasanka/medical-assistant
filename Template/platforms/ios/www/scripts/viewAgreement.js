myApp.factory('ViewAgreement', function () {
    var obj = {};
    obj.newCustomer = {};
    obj.checkOut = {};
    obj.addDamage = {};
    return obj;
});

myApp.controller('viewAgreementCtrl', function ($scope, $http, AppContext, CheckOutInfo, Enum) {
    ons.ready(function () {
        vehicleviewimages = [["frontView", ""], ["rearView", ""], ["leftView", ""], ["rightView", ""]];

        function stopButton(e) {
            var navfrom = homeNavigator.getCurrentPage().options.navigateFrom;
            if (navfrom == Enum.NavigateFrom.Home) {
                homeNavigator.popPage({ animation: defaultTransition });
            }
            else {
                menu.setMainPage('home.html', { animation: defaultTransition });
            }
        }

        viewAgreemntNavigator.getDeviceBackButtonHandler().setListener(stopButton);
       
        $scope.loading = true;
        var agreementID = homeNavigator.getCurrentPage().options.aid;

        function createView() {
            $scope.info.Currency = AppContext.getUserContext().Currency;

            //for dynamic page creation
            $scope.info.paymentInfo = [
              { value: $scope.info.baseCharge, text: "Rate Charge" },
              { value: $scope.info.PromoCode, text: "Promo Code", notCurrency: true },
              { value: $scope.info.PromoDiscount, text: 'Promo Discount' },
              { value: $scope.info.FinalBase, text: "Final Base Charge" },
              { value: $scope.info.MiscTax, text: "Miscellaneous Charges" },
              { value: $scope.info.KMCharge, text: "Miles Charge" },
              { value: $scope.info.ExtraDuration, text: "Extra Duration" },
              { value: $scope.info.PreTax, text: "Pre Tax" },
              { value: $scope.info.SubTotal, text: "Sub Total", subtitle: true },
              { value: $scope.info.TotalTax, text: "Tax Charges" },
              { value: $scope.info.MiscNonTax, text: "Non-Tax Misc" },
              { value: $scope.info.FuelCharge, text: "Fuel Charges" },
              { value: $scope.info.AdditionalCharge, text: "Additional" },
              { value: $scope.info.PostTax, text: "Post Tax" },
              { value: $scope.info.TotalAmount, text: "Total" },
              { value: $scope.info.AmountPaid, text: "Amount Paid" }
              //{ value: $scope.info.TotalDue, text: 'Total Balance Due' }
            ];
        };

        var request = {
            method: "POST",
            url: AppContext.getUrl(Enum.Url.GetAgreement, []),
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                ClientId: AppContext.getUserContext().ClientId,
                agreementId: agreementID
            }
        }

        $http(request).then(
            function (response) {
                if (response.data === "") {
                    console.log(request.url + "no data!");

                } else {
                    $scope.loading = false;
                    $scope.info = response.data;
                    $scope.info.FinalBase = $scope.info.baseCharge - $scope.info.PromoDiscount;

                    $scope.info.baseCharge = $scope.info.baseCharge.toFixed(2);
                    $scope.info.PromoDiscount = $scope.info.PromoDiscount.toFixed(2);
                    $scope.info.FinalBase = $scope.info.FinalBase.toFixed(2);

                    var miscTax = 0;
                    if (typeof $scope.info.MiscTax != 'undefined') {
                        $scope.info.MiscTax = $scope.info.MiscTax.toFixed(2);
                        miscTax = $scope.info.MiscTax;
                    }

                    var miscNonTax = 0;
                    if (typeof $scope.info.MiscNonTax != 'undefined') {
                        $scope.info.MiscNonTax = $scope.info.MiscNonTax.toFixed(2);
                        miscNonTax = $scope.info.MiscNonTax;
                    }

                    var preTax = 0;
                    if ($scope.info.PreTax != null) {
                        $scope.info.PreTax = $scope.info.PreTax.toFixed(2);
                        preTax = $scope.info.PreTax;
                    }

                    var subtotal = Number($scope.info.FinalBase) + Number(miscTax) + Number($scope.info.KMCharge) + Number($scope.info.ExtraDuration) + Number(preTax);


                    $scope.info.SubTotal = subtotal.toFixed(2);
                    $scope.info.TotalTax = (($scope.info.SubTotal * $scope.info.TaxPercentage) / 100);
                    var totalTax = 0;
                    if (typeof $scope.info.TotalTax != 'undefined') {
                        $scope.info.TotalTax = $scope.info.TotalTax.toFixed(2);
                        totalTax = $scope.info.TotalTax;
                    }

                    $scope.info.FuelCharge = $scope.info.FuelCharge.toFixed(2);

                    if ($scope.info.PostTax != null) {
                        $scope.info.PostTax = $scope.info.PostTax.toFixed(2);
                    }

                    var totalAmount = Number(subtotal + Number(totalTax) + Number(miscNonTax) + Number($scope.info.FuelCharge) + Number($scope.info.AdditionalCharge) + Number($scope.info.FineCharge) + Number($scope.info.PostTax));

                    $scope.info.TotalAmount = totalAmount.toFixed(2);
                    $scope.info.AmountPaid = (Number($scope.info.AdvancePaid) + Number($scope.info.AmountPaid)).toFixed(2);
                    $scope.info.TotalDueBalance = ($scope.info.TotalAmount - $scope.info.AmountPaid).toFixed(2);
                    $scope.info.ExtraDuration = $scope.info.ExtraDuration.toFixed(2);
                    $scope.info.KMCharge = $scope.info.KMCharge.toFixed(2);


                    if ($scope.info.AdditionalCharge != null)
                        $scope.info.AdditionalCharge = $scope.info.AdditionalCharge.toFixed(2);


                    $scope.$root.$broadcast("SetVehIdForDamage", {
                        VehicleId: response.data.VehicleId,
                        AgreementId: agreementID
                    });


                    $scope.info.CheckinOdometerString = $scope.info.CheckinOdometer;
                    if ($scope.info.PromoCode == null) {
                        $scope.info.PromoCode = "--";
                    }
                    if (response.data.status === 2) {

                        $scope.info.CheckinOdometerString = "-";
                        $('#checkinConfirm').fadeIn();
                        $('#checkinConfirm').removeAttr('disabled');
                    }
                    else {
                        $('#checkinConfirm').css("display", "none");
                    }
                    if ($scope.info.status !== 2) {
                        $scope.info.isClose = true;
                    }
                    $scope.info.Vehicle = $scope.info.Make + " " + $scope.info.Model + " " + $scope.info.Year;

                    $scope.info.viewAgreementNo = CheckOutInfo.agreementNo;

                    $scope.info.CheckIn = moment(response.data.CheckInString, "MM/DD/YYYY hh:mm:ss A");
                    $scope.info.CheckOut = moment(response.data.CheckOutString, "MM/DD/YYYY hh:mm:ss A");
                    $scope.info.ReturnDate = moment(response.data.ReturnDateString, "MM/DD/YYYY hh:mm:ss A");
                    $scope.info.CreditCardExpiryDate = moment(response.data.CreditCardExpiryDateString, "MM/DD/YYYY hh:mm:ss A");

                    $scope.info.DateOfBirthString = ConvertJsonDateString(response.data.DateOfBirth, 'date');
                    $scope.info.CheckOutString = $scope.info.CheckOut.format("MM.D.YYYY, hh:mm A");
                    $scope.info.CheckInString = $scope.info.CheckIn.format("MM.D.YYYY, hh:mm A");
                    $scope.info.ReturnDateString = $scope.info.ReturnDate.format("MM.D.YYYY, hh:mm A");
                    $scope.info.CreditCardExpiryDateString = $scope.info.CreditCardExpiryDate.format("MM.D.YYYY, hh:mm A");

                    
                    $scope.info.status = ($scope.info.status === 1) ? 'New' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 2) ? 'Open' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 3) ? 'Close' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 4) ? 'Cancel' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 5) ? 'Pending Payment' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 6) ? 'Void' : $scope.info.status;
                    $scope.info.status = ($scope.info.status === 7) ? 'Pending Deposit' : $scope.info.status;

                    createView();
                }
            },
            function (error) {
                logInfo(request, error, 'warn');
            });

        $scope.navigate = function () {
            homeNavigator.pushPage('checkIn.html', { animation: defaultTransition, agreement: $scope.info });
        };

        $scope.PrintMenu = function () {
            var templates = $scope.info.PdfTemplates;

            if (templates.length === 0) {
                $scope.Print();
            }
            else {
                var html = "<div style=\"margin-left: 30px;\">";
                for (var i = 0; i < templates.length; i++) {
                    html += "<input id=" + templates[i].TemplateId + " type=\"radio\" name=\"pdfTypes\" value="+ templates[i].TemplateId +" ";
                    html += "checked=\"checked\"";
                    html += ">";
                    html += "<label for=" + templates[i].TemplateId + " style=\"margin-bottom: 10px;\"><span><span></span></span>" + templates[i].TemplateName + "</label><br>";
                }
                html += "</div>";
                //var ss = jQuery("<option/>", { value: 10, text: 'buhhh' }).prop("outerHTML"); //easy way to create elements 

                ons.notification.confirm({
                    title: "Select PDF type",
                    messageHTML: html,
                    buttonLabels: ["Cancel", "Print"],
                    callback: function (idx) {
                        switch (idx) {
                            case 0:
                                break;
                            case 1:
                                var templateId = $('input[name=pdfTypes]:checked').val();
                                $scope.printPdf(templateId);
                        }
                    }
                });
            }
            
        };

        $scope.Print = function () {
            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to print the Agreement?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            $scope.printPdf();
                    }
                }
            });
        };

        $scope.printPdf = function (templateId) {

            templateId = (typeof templateId != 'undefined') ? templateId : 0 ;

            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Print started.");
            if ($scope.info.status === "Open") {
                $scope.info.intstatus = 2;
            } else {
                $scope.info.intstatus = 0;
            }
            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.PrintAgreement, [AppContext.getUserContext().ClientId, agreementID, $scope.info.intstatus, templateId]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {

                    if ((response.data.Status)) {

                        var printTitle = 'Agreement no:' + $scope.info.AgreementNo + ', Date:' + new Date();
                        var datauri = response.data.PdfBase64Str;
                        window.plugins.PrintPDF.isPrintingAvailable(function (isAvailable) {
                            if (isAvailable) {
                                var encodedString = datauri;
                                window.plugins.PrintPDF.print({
                                    data: encodedString,
                                    type: 'Data',
                                    title: printTitle,
                                    success: function () {
                                        setTimeout(function () {
                                            OnsNotification.hide();
                                        }, 1000);
                                        ons.notification.alert({ message: 'Your printout was successful or cancel', title: null, animation: 'slide', buttonLabel: 'OK' });
                                    },
                                    error: function () {

                                        setTimeout(function () {
                                            OnsNotification.hide();
                                        }, 1000);
                                        ons.notification.alert({ message: 'Failed to Print', title: null, animation: 'slide', buttonLabel: 'OK' });
                                    }
                                });
                            } else {
                                setTimeout(function () {
                                    OnsNotification.hide();
                                }, 1000);
                                ons.notification.alert({ message: 'Printer is not available', title: null, animation: 'slide', buttonLabel: 'OK' });
                            }
                        });
                    } else {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Failed to Print', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                },
                function (error) {
                    setTimeout(function () {
                        OnsNotification.hide();
                    }, 1000);
                    ons.notification.alert({ message: 'Error occurred', title: null, animation: 'slide', buttonLabel: 'OK' });

                    logInfo(request, error, 'warn');
                });
        }
        
        $scope.EmailMenu = function () {
            var templates = $scope.info.EmailTemplates;

            if (templates.length === 0) {
                $scope.Email();
            }
            else {
                var html = "<div style=\"margin-left: 30px;\">";
                for (var i = 0; i < templates.length; i++) {
                    html += "<input id=" + templates[i].TemplateId + " type=\"radio\" name=\"emailTypes\" value="+ templates[i].TemplateId +" ";
                    html += "checked=\"checked\"";
                    html += ">";
                    html += "<label for=" + templates[i].TemplateId + " style=\"margin-bottom: 10px;\"><span><span></span></span>" + templates[i].TemplateName + "</label><br>";
                }
                html += "</div>";
                //var ss = jQuery("<option/>", { value: 10, text: 'buhhh' }).prop("outerHTML"); //easy way to create elements 

                ons.notification.confirm({
                    title: "Select Email type",
                    messageHTML: html,
                    buttonLabels: ["Cancel", "Email"],
                    callback: function (idx) {
                        switch (idx) {
                            case 0:
                                break;
                            case 1:
                                var templateId = $('input[name=emailTypes]:checked').val();
                                $scope.sendMail(templateId);
                        }
                    }
                });
            }
            
        };

        $scope.Email = function () {

            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to Email the Agreement?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            $scope.sendMail();
                    }
                }
            });
        };

        $scope.sendMail = function (templateId) {
            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Sending Email...");

            if ($scope.info.status === "Open") {
                $scope.info.intstatus = 2;
            }
            else {
                $scope.info.intstatus = 0;
            }

            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.SendAgreementEmail, [AppContext.getUserContext().ClientId, agreementID, $scope.info.intstatus, templateId]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {
                    if (!(response.data.Status)) {
                        $('#LoadingLoopDiv').fadeOut();
                        $('#NotificationMessage').fadeOut();
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'E-mail could not be sent', title: null, animation: 'slide', buttonLabel: 'OK' });

                    } else {
                        if (response.data.Message == "FailedToCustomer") {
                            $('#LoadingLoopDiv').fadeOut();
                            $('#NotificationMessage').fadeOut();
                            OnsNotification.hide();
                            ons.notification.alert({ message: "Customer's Mail is empty, Mail successfully sent to the owner!", title: null, animation: 'slide', buttonLabel: 'OK' });

                        } else {
                            $('#LoadingLoopDiv').fadeOut();
                            $('#NotificationMessage').fadeOut();
                            OnsNotification.hide();
                            ons.notification.alert({ message: "E-Mail Sent", title: null, animation: 'slide', buttonLabel: 'OK' });
                        }

                    }
                },
                function (error) {
                    $('#LoadingLoopDiv').fadeOut();
                    $('#NotificationMessage').fadeOut();
                    OnsNotification.hide();
                    logInfo(request, error, 'warn');
                    ons.notification.alert({ message: 'Error occurred', title: null, animation: 'slide', buttonLabel: 'OK' });
                });
        };

        $scope.navigateBack = function () {
            var navfrom = homeNavigator.getCurrentPage().options.navigateFrom;
            if (navfrom == Enum.NavigateFrom.Home) {
                homeNavigator.popPage({ animation: defaultTransition });
            }
            else {
                menu.setMainPage('home.html', { animation: defaultTransition });
            }

        };

        //add damages section
        var vehicleId = '';
        var agreementId = '';

        $scope.$on("SetVehIdForDamage", function (event, args) {
            vehicleId = args.VehicleId;
            agreementId = args.AgreementId;
        });

        $scope.navigateToCheckDamage = function () {
            $scope.homeNavigator.pushPage('checkDamage.html', { animation: defaultTransition, vehicleId: vehicleId, agreementId: agreementId, navigateFrom: Enum.NavigateFrom.Home });
        };

    });
});
