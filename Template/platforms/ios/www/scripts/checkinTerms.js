myApp.controller('checkinTermsCtrl', function ($scope, $http, AppContext, Enum) {
    $scope.loading = true;
    OnsNotification.show();
    $('#LoadingLoopDiv').fadeIn();
    $('#NotificationMessage').fadeIn();
    $('#NotificationMessage').text("Loading...");

    //Terms
    var request = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetTerms, [AppContext.getUserContext().ClientId, Enum.TermType.CheckIn]),
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
               OnsNotification.hide();
               $scope.terms = response.data;
               $scope.loading = false;
           }
       },
       function (error) {
           logInfo(request, error, 'warn');
       });

    $scope.acceptAllTerms = function () {
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

    //Signature
    var options = {
        defaultAction: 'drawIt',
        penColour: '#2c3e50',
        lineWidth: 0,
        bgColour: 'rgba(0, 0, 0, 0)',
        penCap: 'round',
    }

    var canvas = $('.sigPad').signaturePad(options);

    $scope.clear = function () {
        isCreateAgreementSignEmpty = true;
        canvas.clearCanvas();
    }




    //submit
    $scope.checkin = function () {

        var canvas = $('.sigPad').signaturePad(options);
        isSignEmpty = (canvas.getSignature().length == 0);

        var allAccepeted = true;
        $(".term-checkbox").each(function () {
            if (!$(this).is(':checked')) {
                allAccepeted = false;
            }
        });

        if (allAccepeted) {
            if (isSignEmpty) {
                ons.notification.alert({ message: 'Sign is Required', title: 'Error!', buttonLabel: 'OK' });
                return;
            } else {
                OnsNotification.show();
                $('#LoadingLoopDiv').fadeIn();
                $('#NotificationMessage').fadeIn();
                $('#NotificationMessage').text("Saving...");
                var agreement = homeNavigator.getCurrentPage().options.agreement;

                var requestToSave = {
                    method: 'POST',

                    url: AppContext.getUrl(Enum.Url.CheckinAgreement, []),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        agreement: agreement,
                        clientId: AppContext.getUserContext().ClientId
                    }
                }

                $http(requestToSave).then(
                    function (response) {
                        if (response.data === "") {
                            OnsNotification.hide();
                            ons.notification.alert({ message: 'Could not checkin!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        } else {

                            //save sign
                            checkinSign = document.getElementById('checkinSign');
                            var dataURL = checkinSign.toDataURL();
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
                                    base64Img: dataURL,
                                    type: "In"
                                }
                            }

                            $http(request).then(
                                 function (response) {
                                     if (response.data == "success") {
                                         $('#LoadingLoopDiv').fadeOut();
                                         $('#NotificationMessage').fadeOut();

                                         setTimeout(function () {
                                             $('#CheckMarkDiv').fadeIn();
                                             $('#NotificationMessage').text("CheckIn successful");
                                             $('#NotificationMessage').fadeIn();
                                         }, 500);

                                         setTimeout(function () {
                                             $('#CheckMarkDiv').fadeOut();
                                             OnsNotification.hide();
                                             $scope.homeNavigator.pushPage('viewAgreement.html', { animation: defaultTransition, aid: agreement.AgreementId, navigateFrom: Enum.NavigateFrom.Checkin });

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
                        }
                    },
                    function (error) {
                        ons.notification.alert({ message: 'Could not checkin!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                    });
            }
        } else {
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
    }

});
