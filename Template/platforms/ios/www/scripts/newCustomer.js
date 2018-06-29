myApp.controller('newCustomerCtrl', function ($scope, $http, AppContext, ExCustomer, Enum) {
    var cid = AppContext.getUserContext().ClientId;

    $scope.today = new Date();
    $scope.info = {};

    //load customer types
    var requestCustomerTypes = {
        method: 'POST',
        url: AppContext.getUrl(Enum.Url.GetCustomerTypes, [cid]),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(requestCustomerTypes).then(
        function (response) {
            $scope.customerTypes = response.data;
            $scope.info.CustomerType = $scope.customerTypes[0];
        },
        function (error) {
            logInfo(requestCustomerTypes, error, 'warn');
        });

    //load countries
    var requestCountries = {
        method: 'POST',
        url: AppContext.getUrl(Enum.Url.GetCountries, [cid]),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(requestCountries).then(
        function (response) {
            $scope.countries = response.data;
            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].Value == AppContext.getUserContext().CountryName) {

                    $scope.info.Country = response.data[i];
                    $scope.loadStates(response.data[i].ID);
                }
            }
        },
        function (error) {
            logInfo(requestCountries, error, 'warn');
        });

    //load states
    $scope.loadStates = function (countryId) {
        if (countryId == undefined) {
            countryId = $scope.info.Country.ID;
        }
        var request = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetStates, [countryId, cid]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(request).then(
            function (response) {
                $scope.states = response.data;

                if (response.data.length < 1) {
                    $scope.states = null;
                } else {
                    $scope.info.State = $scope.states[0];
                }

            },
            function (error) {
                logInfo(request, error, 'warn');
            });
    };

    //load credit card types
    $scope.ccTypes = [{ id: 'Visa', Value: 'Visa' }, { id: 'Master', Value: 'Master' }, { id: 'American Express', Value: 'American Express' },
        { id: 'Discover Card', Value: 'Discover Card' }];
    $scope.info.CreditCardType = $scope.ccTypes[0];

    ons.ready(function () {

        angular.copy(null, $scope.info);
        $scope.info.CreditCardType = $scope.ccTypes[0];

        $scope.info.Phone = homeNavigator.getCurrentPage().options.phoneNumber;
        $scope.info.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;

        $scope.formClear = function () {
            angular.copy(null, $scope.info);
            $scope.info.CustomerType = $scope.customerTypes[0].TypeName;
        };

        switch ($scope.info.navigateFrom) {

            case Enum.NavigateFrom.Home:
                $scope.buttonValue = 'Save';
                break;
            case Enum.NavigateFrom.Reservation: 
                $scope.buttonValue = 'Create Reservation';
                break;
            case Enum.NavigateFrom.ResToAgr:
                var data = homeNavigator.getCurrentPage().options.data;
                $scope.info.FirstName = data.FirstName;
                $scope.info.LastName = data.LastName;
                $scope.info.Phone = data.Phone;
                $scope.buttonValue = 'Create Agreement';
                break;
            default:
                $scope.buttonValue = 'Create Agreement';
                break;
        }
       
        $scope.saveCustomer = function (val) {

            $scope.validateForm = function (form) {

                if (form.$valid) {

                    var today = new Date();
                    var d = new Date("Dec 31, 1996");

                    if ($scope.info.DateOfBirth > d) {
                        ons.notification.alert({ message: 'Customer must be elder than 18 years', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if ($scope.info.LicenseIssueDate > today) {
                        ons.notification.alert({ message: 'Licence Issue Date must be valid', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if ($scope.info.LicenseExpiryDate < $scope.info.LicenseIssueDate) {
                        ons.notification.alert({ message: 'License expiry date must be greater than Issue Date', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if ($scope.info.LicenseExpiryDate < today) {
                        ons.notification.alert({ message: 'License expiry date must be greater than today', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else if ($scope.info.CreditCardExpiryDate != null && $scope.info.CreditCardExpiryDate < today) {
                        ons.notification.alert({ message: 'Credit card expiry Date must be greater than today', title: null, animation: 'slide', buttonLabel: 'OK' });
                    }
                    else {

                        $scope.info.CustomerTypeName = $scope.info.CustomerType.TypeName;
                        $scope.info.ClientId = cid;
                        $scope.info.CreditCardType = $scope.info.CreditCardType.Value;
                        var request = {
                            method: 'POST',
                            url: AppContext.getUrl(Enum.Url.CreateCustomer, []),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: {
                                user: $scope.info,
                                clientId: cid
                            }
                        }

                        $http(request).then(
                            function (response) {
                                if (response.data == 0) {
                                    ons.notification.alert({ message: 'Failed to save the Customer', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                                } else {
                                    if ($scope.info.navigateFrom == Enum.NavigateFrom.Reservation) {

                                        homeNavigator.pushPage('reservationCheckOut.html', { animation: defaultTransition, data: $scope.info });
                                        return;
                                    }
                                    else if ($scope.info.navigateFrom == Enum.NavigateFrom.ResToAgr) {
                                        var cusObj = { CustomerId: response.data };
                                        ExCustomer.setCustomerInfo(cusObj);

                                        var resInfo = homeNavigator.getCurrentPage().options.data;
                                        homeNavigator.pushPage('checkOut.html', { animation: defaultTransition, data: resInfo, navigateFrom: Enum.NavigateFrom.Reservation });
                                        return;
                                    }
                                    else if ($scope.info.navigateFrom == Enum.NavigateFrom.Agreement) {
                                        $scope.info.CustomerId = response.data;
                                        var customerObj = { CustomerId: 0 };
                                        customerObj.CustomerId = response.data;
                                        ExCustomer.setCustomerInfo(customerObj);
                                        $scope.homeNavigator.pushPage('checkOut.html', { animation: defaultTransition, navigateFrom: Enum.NavigateFrom.Agreement });
                                        return;
                                    }
                                    else {
                                        homeNavigator.popPage({ animation: defaultTransition });
                                        return;
                                    }

                                }
                            },
                            function (error) {
                                logInfo(request, error, 'warn');
                            });
                    }
                }
            };

            if (val == "FirstName" || val == "buttonPress") {
                $("#FirstName").fadeOut();
                $("#FirstName").fadeIn();
            }
            if (val == "LastName" || val == "buttonPress") {
                $("#LastName").fadeOut();
                $("#LastName").fadeIn();
            }
            if (val == "phoneNumber" || val == "buttonPress") {
                $("#phoneNumber").fadeOut();
                $("#phoneNumber").fadeIn();
            }
            if (val == "dateOfBirth" || val == "buttonPress") {
                $("#dateOfBirth").fadeOut();
                $("#dateOfBirth").fadeIn();
            }
            if (val == "driverLicenceNumber" || val == "buttonPress") {
                $("#driverLicenceNumber").fadeOut();
                $("#driverLicenceNumber").fadeIn();
            }
            if (val == "expiryDate" || val == "buttonPress") {
                $("#expiryDate").fadeOut();
                $("#expiryDate").fadeIn();
            }
            if (val == "Address" || val == "buttonPress") {
                $("#Address").fadeOut();
                $("#Address").fadeIn();
            }
            if (val == "issuedDate" || val == "buttonPress") {
                $("#issuedDate").fadeOut();
                $("#issuedDate").fadeIn();
            }
            if (val == "City" || val == "buttonPress") {
                $("#City").fadeOut();
                $("#City").fadeIn();
            }
            if (val == "Country" || val == "buttonPress") {
                $("#Country").fadeOut();
                $("#Country").fadeIn();
            }
            if (val == "State" || val == "buttonPress") {
                $("#State").fadeOut();
                $("#State").fadeIn();
            }
            if (val == "ZipCode" || val == "buttonPress") {
                $("#ZipCode").fadeOut();
                $("#ZipCode").fadeIn();
            }
            if (val == "emailAd" || val == "buttonPress") {
                $("#emailAd").fadeOut();
                $("#emailAd").fadeIn();
            }
        };

        $scope.uploadImg = function () {

            if ($scope.info.LicenseNumber == "" || $scope.info.LicenseNumber == undefined) {
                ons.notification.alert({ message: 'License number is empty', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                return;
            }

            var options = {
                quality: 100,
                targetWidth: 500,
                targetHeight: 350,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                correctOrientation: true
            }
            navigator.camera.getPicture(
                function (imageURI) {
                    var image = document.getElementById('IDImage');
                    image.src = "data:image/jpeg;base64," + imageURI;
                    //readImageContent(image);

                    var request = {
                        method: 'POST',

                        url: AppContext.getUrl(Enum.Url.SaveLicenceImage, []),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            licenceNo: $scope.info.LicenseNumber,
                            base64Img: imageURI,
                            clientId: cid
                        }
                    }

                    $http(request).then(
                        function (response) {
                            if (response.data) {
                                // ons.notification.alert({ message: 'Saved ', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                            } else {
                                ons.notification.alert({ message: 'Failed to save', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                            }
                        },
                    function (error) {
                        logInfo(request, error, 'warn');
                        ons.notification.alert({ message: 'Failed : ' + error.statusText, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                    });
                },
                function (message) {
                    ons.notification.alert({ message: 'Failed' + message, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                },
                options);
        };

        $scope.takePic = function () {
            if ($scope.info.LicenseNumber == "" || $scope.info.LicenseNumber == undefined) {
                ons.notification.alert({ message: 'License number is empty', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                return;
            }

            var options = {
                quality: 100,
                targetWidth: 700,
                targetHeight: 450,
                saveToPhotoAlbum: false,
                destinationType: Camera.DestinationType.DATA_URL,
                correctOrientation: true
            }
            navigator.camera.getPicture(
                function (imageData) {
                    var image = document.getElementById('IDImage');
                    image.src = "data:image/jpeg;base64," + imageData;
                    //readImageContent(image);
                    
                    var request = {
                        method: 'POST',
                        url: AppContext.getUrl(Enum.Url.SaveLicenceImage, []),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/xml',
                        },
                        data: {
                            licenceNo: $scope.info.LicenseNumber,
                            base64Img: imageData,
                            clientId: cid
                        }
                    }

                    $http(request).then(
                        function (response) {
                            if (response.data) {
                                // ons.notification.alert({ message: 'Saved ', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                            } else {
                                ons.notification.alert({ message: 'Failed to save', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                            }
                        },
                    function (error) {
                        logInfo(request, error, 'warn');
                        ons.notification.alert({ message: 'Failed : ' + error.statusText + message, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                    });
                },
                function (message) {
                    ons.notification.alert({ message: 'Failed : ' + message, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                },
                options);
        };

        $scope.scanLicense = function () {
            
            homeNavigator.pushPage('licenseScan.html', { animation: defaultTransition });

            //Acuant initialization
            //var acuantKey = "D5E5835A38D1";
            //AcuantMobileSDK.initAcuantMobileSDK(function (data) {
            //    if (data.id == 'mobileSDKWasValidated') {
            //        window.localStorage.setItem("acuantKey", acuantKey);

            //        //var licenseKey = window.localStorage.getItem("acuantKey");
            //        //AcuantMobileSDK.initAcuantMobileSDKAndShowCardCaptureInterfaceInViewController(function (data) {
            //        //    console.log("success");
            //        //}, function (error) {
            //        //    console.log("error");
            //        //}, licenseKey, 2, 5, false);

            //        AcuantMobileSDK.showAutoCameraInterfaceInViewController(function(data) {
            //            console.log("success");
            //        }, function(error) {
            //            console.log("error");
            //        }, 2);

            //    }
            //}, function (error) {
            //    console.log(error + " not validated");
            //}, acuantKey, "cloud.google.com");
            
           
        }
    });
});