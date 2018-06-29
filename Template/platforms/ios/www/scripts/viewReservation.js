myApp.factory('ReservationModel', function () {
    var obj = {};
    return {
        setReservationData: function (res) {
            obj = res;
        },

        getReservationData: function () {
            return obj;
        }
    }
});

myApp.controller('viewReservationCtrl', function ($scope, $http, Enum, AppContext, ExCustomer, ReservationModel) {

    function updateView(d) { 

        if (d == null) {
            $scope.info = {};
            $scope.info.customerInfo = [{ text: 'First Name' }, { text: 'Last Name' }, { text: 'Phone' }, { text: 'Email' }, { text: 'Company' }];
            $scope.info.reservationInfo = [{ text: 'Location' }, { text: 'CheckOut' }, { text: 'CheckIn' }, { text: 'Status' }];
            $scope.info.paymentInfo = [{ text: 'Base Price' }];
        }
        else {
            $scope.info.customerInfo = [
                { value: $scope.info.FirstName, text: 'First Name' },
                { value: $scope.info.LastName, text: 'Last Name' },
                { value: $scope.info.Phone, text: 'Phone' },
                { value: $scope.info.Email, text: 'Email', simplecase: true },
                { value: $scope.info.Company, text: 'Company' }
            ];
            $scope.info.reservationInfo = [
                { value: $scope.info.StartLocation.LocationName, text: 'Location' },
                { value: $scope.info.CheckOut, text: 'CheckOut' },
                { value: $scope.info.CheckIn, text: 'CheckIn' },
                { value: $scope.info.Status, text: 'Status' }
            ];
            $scope.info.paymentInfo = [
                { value: $scope.info.BasePrice, text: 'Base Price' },
                //{ value: $scope.info.SubTotal, text: 'Sub Total' },
                //{ value: $scope.info.TotalTax, text: 'Total Tax' },
                //{ value: $scope.info.TotalAmount, text: 'Total Amount' },
                //{ value: $scope.info.AmountPaid, text: 'Amount Paid' },
                //{ value: $scope.info.TotalDue, text: 'Total Due' }
            ];
        }
        
    }

    updateView();

    ons.ready(function () {

        $scope.pageLoading = true;
        
        var cid = AppContext.getUserContext().ClientId;
        var reservationId = homeNavigator.getCurrentPage().options.rid;
        var navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;

        var request = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetReservation, []),
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                ReservationId: reservationId,
                ClientID: AppContext.getUserContext().ClientId,
                UserID: AppContext.getUserContext().UserId
            }
        }

        $http(request).then(
            function (response) {
                $scope.pageLoading = false;

                if (!response.data) {
                    ons.notification.alert({ message: 'Failed to load Reservation', title: null, animation: 'slide', buttonLabel: 'OK' });
                }
                else {
                    response.data.ReservationId = reservationId;
                    ReservationModel.setReservationData(response.data);

                    $scope.info = response.data;
                    $scope.info.StatusValue = $scope.info.Status;

                    var endDate = moment(response.data.EndDateStr, "MM/DD/YYYY hh:mm:ss A");
                    var startDate = moment(response.data.StartDateStr, "MM/DD/YYYY hh:mm:ss A");

                    $scope.info.CheckIn = endDate.format("MM.D.YYYY, hh:mm A");
                    $scope.info.CheckOut = startDate.format("MM.D.YYYY, hh:mm A");

                    $scope.info.CreditCardExpiryDate = moment(response.data.CreditCardExpiryDateString).format("MM.D.YYYY, hh:mm A");

                    var s = $scope.info.Status;
                    var e = Enum.ReservationStatus;
                    $scope.info.Status = (s == e.Open) ? 'Open' : (s == e.CheckOut) ? 'CheckOut' : (s == e.NoShow) ? 'NoShow' : (s == e.Canceled) ? 'Canceled' : (s == e.New) ? 'New' : 'All';

                    //for dynamic page creation
                    updateView($scope.info);
                }
            },
            function (error) {
                logInfo(request, error, 'warn');
            });

        function searchCustomerConfirm(type) {
            //$.get('newCustomer.html', function (html) {});
            ons.notification.confirm({
                title: 'Create Customer',
                messageHTML: "Customer is not registered in the system. Do you want to create customer?", //html,
                buttonLabels: ["Cancel", "Create"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            homeNavigator.pushPage('newCustomer.html', { animation: defaultTransition, data: $scope.info, navigateFrom: type });
                            break;
                    }
                }
            });
        }

        $scope.navigate = function () {
            if ($scope.info.CustomerId != 0 && $scope.info.CustomerId != null) {
                var request = {
                    method: 'POST',
                    url: AppContext.getUrl(Enum.Url.GetCustomerInfo, [$scope.info.Phone, AppContext.getUserContext().ClientId]),
                }

                $http(request).then(
                    function (response) {
                        ExCustomer.setCustomerInfo(response.data);
                        homeNavigator.pushPage('checkOut.html', { animation: defaultTransition, data: $scope.info, navigateFrom: Enum.NavigateFrom.ResToAgr });
                    },
                    function (error) {
                        logInfo(request, error, 'warn');
                    });

            } else {
                searchCustomerConfirm(Enum.NavigateFrom.ResToAgr);
            }
        };

        $scope.confirm = function () {

            ons.notification.confirm({
                title: 'Confirm Reservation',
                messageHTML: "Do you want to confirm the Reservation?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:

                             var request = {
                                method: 'POST',
                                url: AppContext.getUrl(Enum.Url.UpdateReservationStatus, [cid, reservationId, Enum.ReservationStatus.Open]),
                            }

                            $http(request).then(
                                function (response) {
                                    $scope.info.StatusValue = Enum.ReservationStatus.Open;
                                    $scope.info.Status = 'Open';
                                    $scope.info.reservationInfo[3].value = $scope.info.Status;
                                },
                                function (error) {
                                    logInfo(request, error, 'warn');
                                });
                    }
                }
            });
           
        };

        function printPdf() {

            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Printing reservation.");

            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.PrintReservation, [AppContext.getUserContext().ClientId, reservationId, $scope.info.StatusValue]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {
                    OnsNotification.hide();

                    if ((response.data.Status)) {

                        var printTitle = 'Reservation no:' + reservationId + ', Date:' + new Date();
                        var datauri = response.data.PdfBase64Str;
                        window.plugins.PrintPDF.isPrintingAvailable(function (isAvailable) {
                            if (isAvailable) {
                                var encodedString = datauri;
                                window.plugins.PrintPDF.print({
                                    data: encodedString,
                                    type: 'Data',
                                    title: printTitle,
                                    success: function () {
                                        ons.notification.alert({ message: 'Your printout was successful or cancel', title: null, animation: 'slide', buttonLabel: 'OK' });
                                    },
                                    error: function (data) {
                                        ons.notification.alert({ message: 'Failed to Print', title: null, animation: 'slide', buttonLabel: 'OK' });
                                    }
                                });
                            }
                            else {

                                ons.notification.alert({ message: 'Printer is not available', title: null, animation: 'slide', buttonLabel: 'OK' });
                            }
                        });
                    }
                    else {

                        ons.notification.alert({ message: 'Failed to Print', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                },
                function (error) {
                    OnsNotification.hide();
                    logInfo(request, error, 'warn');
                });
        }

        $scope.Print = function () {
            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to print the Reservation?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            printPdf();
                    }
                }
            });
        };

        function sendMail() {
            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').fadeIn();
            $('#NotificationMessage').text("Email sending.");
            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.SendReservationEmail, [AppContext.getUserContext().ClientId, reservationId, $scope.info.StatusValue]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {
                    OnsNotification.hide();
                    ons.notification.alert({ message: response.data.Message, title: null, animation: 'slide', buttonLabel: 'OK' });
                },
                function (error) {
                    OnsNotification.hide();
                    logInfo(request, error, 'warn');
                });
        };

        $scope.Email = function () {

            ons.notification.confirm({
                title: null,
                messageHTML: "Do you want to Email the Reservation?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            sendMail();
                    }
                }
            });
        };

        $scope.navigateBack = function () {
            if (navigateFrom == Enum.NavigateFrom.Reservation) {
                menu.setMainPage('home.html', { animation: defaultTransition });
            } else {
                homeNavigator.popPage({ animation: defaultTransition });
            }
        };
    });
});
