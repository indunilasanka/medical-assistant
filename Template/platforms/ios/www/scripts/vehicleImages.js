myApp.controller('OldImagesCntr', function ($scope, $http, AppContext, CheckOutInfo, AgreementDetails, Enum) {
    ons.ready(function () {

        OnsNotification.show();
        $('#LoadingLoopDiv').fadeIn();
        $('#NotificationMessage').text("Loading...");
        $('#NotificationMessage').fadeIn();

        var ad = AgreementDetails;
        if (!(typeof ad.AgreementId === 'undefined' || ad.AgreementId === null)) {

            $('#OldImageViews').fadeIn();

            var request = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.GetVehicleImages, [AppContext.getUserContext().ClientId, ad.AgreementId]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(request).then(
                function (response) {

                    if (response.data.Status == false) {
                        $('#NotificationMessage').text("Error Occured!");
                        setTimeout(function () {
                            OnsNotification.hide();
                        }, 1000);
                    }
                    else if (response.data.ImageArray == "false") {
                        OnsNotification.hide();
                    }
                    else {

                        var array = response.data;

                        var image = document.getElementById("frontViewOld");

                        if (array.ImageArray[0] != "NotFound") {
                            image.src = "data:image/jpeg;base64," + array.ImageArray[0];
                        }

                        if (array.ImageArray[1] != "NotFound") {
                            image = document.getElementById("rearViewOld");
                            image.src = "data:image/jpeg;base64," + array.ImageArray[1];
                        }

                        if (array.ImageArray[2] != "NotFound") {
                            image = document.getElementById("leftViewOld");
                            image.src = "data:image/jpeg;base64," + array.ImageArray[2];
                        }

                        if (array.ImageArray[3] != "NotFound") {
                            image = document.getElementById("rightViewOld");
                            image.src = "data:image/jpeg;base64," + array.ImageArray[3];
                        }

                        OnsNotification.hide();
                    }
                },
                function (error) {
                    $('#NotificationMessage').text("Error Occured!");
                    setTimeout(function () {
                        OnsNotification.hide();
                    }, 1000);
                });

        } else {

            OnsNotification.hide();
        }
    });
});

myApp.controller('newImagesCntr', function ($scope, $http, AppContext, CheckOutInfo, ExCustomer, AgreementDetails, Enum) {

    function loadtookimages() {

        for (var i = 0; i < vehicleviewimages.length; i++) {
            if (vehicleviewimages[i][1] != "") {
                var image = document.getElementById(vehicleviewimages[i][0]);
                image.src = vehicleviewimages[i][1];
            }
        }
    }

    ons.ready(function () {

        loadtookimages();

        $('#NotificationMessage').text("Loading...");

        $scope.takeFront = function () {
            $scope.commonCam("frontView");
        }

        $scope.takeRear = function () {
            $scope.commonCam("rearView");
        }

        $scope.takeLeft = function () {
            $scope.commonCam("leftView");
        }

        $scope.takeRight = function () {
            $scope.commonCam("rightView");
        }

        $scope.commonCam = function (imageId) {

            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').text("Loading...");
            $('#NotificationMessage').fadeIn();

            var options = {
                quality: 50,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: false,
                destinationType: Camera.DestinationType.DATA_URL,
                correctOrientation: true,
            }
            navigator.camera.getPicture(
                function (imageData) {

                    var image = document.getElementById(imageId);
                    for (var i = 0; i < vehicleviewimages.length; i++) {
                        if (vehicleviewimages[i][0] == imageId) {
                            vehicleviewimages[i][1] = "data:image/jpeg;base64," + imageData;
                        }
                    }
                    image.src = "data:image/jpeg;base64," + imageData;

                    $('#NotificationMessage').text("Saving...");

                    $scope.saveImage(imageId, imageData);
                },
                function (message) {
                    OnsNotification.hide();
                    ons.notification.alert({ message: 'Failed : ' + message, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                },
                options);
        }

        $scope.saveImage = function (imageId, imageData) {
            
            var ad = AgreementDetails;
            imageId = !(typeof ad.AgreementId === 'undefined' || ad.AgreementId === null) ? imageId + "In" : imageId + "Out";

            var navfrom = homeNavigator.getCurrentPage().options.navigateFrom;
            var t = (navfrom == Enum.NavigateFrom.Home)
                ? { vehicleId: 0, customerId: 0, agreementNo: "", agreementId: homeNavigator.getCurrentPage().options.agreementId }
                : { vehicleId: CheckOutInfo.vehicleInfo.VehcileID, customerId: ExCustomer.getCustomerInfo().CustomerId, agreementNo: CheckOutInfo.agreementNo, agreementId: 0 };

            var request = {
                method: 'POST',
                url: AppContext.getUrl(Enum.Url.SaveVehicleImages, []),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/xml',
                },
                data: {
                    vehicleId: t.vehicleId,
                    imageView: imageId,
                    base64Img: imageData,
                    clientId: AppContext.getUserContext().ClientId,
                    customerId: t.customerId,
                    agreementNo: t.agreementNo,
                    agreementId: t.agreementId,
                }
            }

            $http(request).then(
                function (response) {

                    if (response.data) {
                        $('#NotificationMessage').fadeOut();
                        $('#LoadingLoopDiv').fadeOut();
                        $('#NotificationMessage').text("Saved");
                        $('#NotificationMessage').fadeIn();
                        setTimeout(function () { OnsNotification.hide(); }, 1000);

                    } else {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Failed to save image', title: null, animation: 'slide', buttonLabel: 'Try Again' });
                    }
                },
                function (error) {
                    logInfo(request, error, 'warn');
                });

        }
    });

});

var isChange = true;

myApp.controller('vehicleImagesCtrl', function ($scope) {

    ons.ready(function () {

        $('#PrevBtn').fadeOut();
        var indexNumber = 0;
        var changeNumb = 0;

        $scope.prev = function () {
            changeNumb = indexNumber;
            if (indexNumber != 0) {
                $('#PrevBtn').fadeIn();
                $('#NextBtn').fadeIn();
                oldcarousel.setActiveCarouselItemIndex(--indexNumber);
                newcarousel.setActiveCarouselItemIndex(indexNumber);
                if (indexNumber == 0) {
                    $('#PrevBtn').fadeOut();
                }
            } else {
                $('#PrevBtn').fadeOut();
            }
        }

        $scope.next = function () {
            changeNumb = indexNumber;
            if (indexNumber != 3) {
                $('#NextBtn').fadeIn();
                $('#PrevBtn').fadeIn();
                oldcarousel.setActiveCarouselItemIndex(++indexNumber);
                newcarousel.setActiveCarouselItemIndex(indexNumber);
                if (indexNumber == 3) {
                    $('#NextBtn').fadeOut();
                }
            } else {
                $('#NextBtn').fadeOut();
            }
        }

        document.addEventListener('ons-carousel:init', function () {

            newcarousel.on('postchange', function (event) {
                if (isChange) {
                    var x = event.lastActiveIndex - event.activeIndex;
                    if (x < 0) {
                        $('#PrevBtn').fadeIn();
                        ++changeNumb;
                        indexNumber = changeNumb;
                        isChange = !isChange;
                        oldcarousel.setActiveCarouselItemIndex(indexNumber);
                        isChange = !isChange;
                    } else {
                        $('#NextBtn').fadeIn();
                        --changeNumb;
                        indexNumber = changeNumb;
                        isChange = !isChange;
                        oldcarousel.setActiveCarouselItemIndex(indexNumber);
                        isChange = !isChange;
                    }
                    if (changeNumb == 0) {
                        $('#PrevBtn').fadeOut();
                    }
                    else if (changeNumb == 3) {
                        $('#NextBtn').fadeOut();
                    }
                }

            });

            oldcarousel.on('postchange', function (event) {
                if (isChange) {
                    var x = event.lastActiveIndex - event.activeIndex;
                    if (x < 0) {
                        $('#PrevBtn').fadeIn();
                        ++changeNumb;
                        indexNumber = changeNumb;
                        isChange = !isChange;
                        newcarousel.setActiveCarouselItemIndex(indexNumber);
                        isChange = !isChange;
                    } else {
                        $('#NextBtn').fadeIn();
                        --changeNumb;
                        indexNumber = changeNumb;
                        isChange = !isChange;
                        newcarousel.setActiveCarouselItemIndex(indexNumber);
                        isChange = !isChange;
                    }
                    if (changeNumb == 0) {
                        $('#PrevBtn').fadeOut();
                    }
                    else if (changeNumb == 3) {
                        $('#NextBtn').fadeOut();
                    }
                }
            });

        });

    });
});





