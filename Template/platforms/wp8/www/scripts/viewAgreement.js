myApp.factory('ViewAgreement', function () {
    var obj = {};
    obj.newCustomer = {};
    obj.checkOut = {};
    obj.addDamage = {};
    return obj;
});

myApp.controller('viewAgreementCtrl', function ($scope, ViewAgreement, $timeout,AppContext, $http, Enum) {
    ons.ready(function () {
        //vehicleviewimages = [["frontView", ""], ["rearView", ""], ["leftView", ""], ["rightView", ""]];
        viewAgreemntNavigator.getDeviceBackButtonHandler().setListener(stopButton);
        function stopButton(e) {
            var navfrom = homeNavigator.getCurrentPage().options.navigateFrom;
            if (navfrom == Enum.NavigateFrom.Home) {
                homeNavigator.popPage({ animation: defaultTransition });
            }
            else {
                menu.setMainPage('home.html', { animation: defaultTransition });
            }
        }
        $scope.loading = true;
        var agreementID = homeNavigator.getCurrentPage().options.id;

        function createView() {
            //$scope.info.Currency = AppContext.getUserContext().Currency;
            //for dynamic page creation
            
        };

        var request = {
            method: 'GET',
            url: "http://mediapp.host78.com/getdata.php?DataId=" + agreementID,
            
        }

        $http(request).then(
            
            function (response) {

                $scope.fadeProgress = true;
                $timeout(function () {
                    $scope.hideProgress = true;
                }, 500);

                if (response.data.length == 0) {
                    console.log(request.url + "no data!");

                } else {
                    $scope.loading = false;
                    $scope.info = response.data;
                    var a = $scope.info[0].DataId;
                    //createView();
                }
            },
            function (error) {
                //logInfo(request, error, 'warn');
            });

        $scope.navigate = function () {
            //homeNavigator.pushPage('checkIn.html', { animation: defaultTransition, agreement: $scope.info });
        };

        $scope.Print = function () {
            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to print the Details?",
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

        $scope.printPdf = function () {

            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Print started.");
            if ($scope.info.status == "Open") {
                $scope.info.intstatus = 2;
            } else {
                $scope.info.intstatus = 0;
            }
            var request = {
                method: 'GET',
                //url: AppContext.getUrl(Enum.Url.PrintAgreement, [AppContext.getUserContext().ClientId, agreementID, $scope.info.intstatus]),
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

        $scope.Email = function () {

            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to Email the Details?",
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

        $scope.sendMail = function () {
            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Sending Mail...");

            if ($scope.info.status == "Open") {
                $scope.info.intstatus = 2;
            } else {
                $scope.info.intstatus = 0;
            }

            var request = {
                method: 'GET',
                //url: AppContext.getUrl(Enum.Url.SendAgreementEmail, [AppContext.getUserContext().ClientId, agreementID, $scope.info.intstatus]),
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
