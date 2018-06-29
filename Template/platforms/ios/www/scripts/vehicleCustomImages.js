myApp.controller('vehicleCustomImagesCtrl', function ($scope, $http, ExCustomer, CheckOutInfo, AppContext, Enum) {

    $scope.image = {};
    $scope.image.Base64 = 'images/add-image.png';

    //load images
    var request = {
        method: 'GET',
        url: AppContext.getUrl(Enum.Url.GetCustomImages, [AppContext.getUserContext().ClientId, AppContext.getUserContext().UserId, CheckOutInfo.agreementNo]),
    }

    $http(request).then(
        function (response) {
            if (response.data === "") {
                $scope.images = [];
            } else {
                $scope.images = response.data;
            }
        },
    function (error) {
        logInfo(request, error, 'warn');
    });

    ons.ready(function () {

        $scope.save = function () {

            $('#NotificationMessage').text("Saving...");
            OnsNotification.show();
            var url = $scope.updateMode ? Enum.Url.UpdateCustomImage : Enum.Url.AddCustomImage;
            var base64 = $scope.image.Base64.replace("data:image/jpeg;base64,", "");
            var request = {
                method: 'POST',
                url: AppContext.getUrl(url, []),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/xml',
                },
                data: {
                    ImageId: $scope.image.ImageId,
                    VehicleId: CheckOutInfo.vehicleInfo.VehcileID, 
                    Title: $scope.image.Title,
                    Description: $scope.image.Description,
                    Base64: base64,
                    ClientId: AppContext.getUserContext().ClientId,
                    UserId: AppContext.getUserContext().UserId, 
                    AgreementNumber: CheckOutInfo.agreementNo 
                }
            }

            $http(request).then(
                function (response) {
                    $scope.showModal = false;

                    if (response.data > 0) {
                        if ($scope.updateMode) {
                            $scope.images.forEach(function (element, index) {
                                if (element.ImageId === $scope.image.ImageId) {
                                    $scope.images[index] = angular.copy($scope.image);
                                }

                            });
                        }
                        else {
                            $scope.image.ImageId = response.data;
                            $scope.images.push($scope.image);
                        }

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
                    $scope.showModal = false;
                    OnsNotification.hide();
                    logInfo(request, error, 'warn');
                });
        }
        
        $scope.takePic = function() {

            var options = {
                quality: 100,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: false,
                destinationType: Camera.DestinationType.DATA_URL,
                correctOrientation: true,
            }
            navigator.camera.getPicture(

                function (imageData) {
                    $scope.image.Base64 = "data:image/jpeg;base64," + imageData;
                },
                function (message) {
                    OnsNotification.hide();
                    ons.notification.alert({ message: 'Failed : ' + message, title: null, animation: 'slide', buttonLabel: 'Try Again' });
                },
                options);
        }

        $scope.add = function () {
            $scope.image = {};
            $scope.image.Base64 = 'images/add-image.png';
            $scope.updateMode = false;
            $scope.showModal = true;
        }

        $scope.edit = function (image) {
            $scope.image = image;
            $scope.updateMode = true;
            $scope.showModal = true;
        }

        $scope.delete = function (image) {

            ons.notification.confirm({
                title: 'Delete Confirm',
                messageHTML: "Do you want to <span style=\"color: red;\">delete</span> image?",
                buttonLabels: ["NO", "YES"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            OnsNotification.show();

                            var request = {
                                method: 'GET',
                                url: AppContext.getUrl(Enum.Url.DeleteCustomImages, [AppContext.getUserContext().ClientId, image.ImageId])
                            }

                            $http(request).then(
                                function (response) {

                                    if (response.data) {
                                        $scope.images.forEach(function (element, index) {
                                            if (element.ImageId === image.ImageId) {
                                                $scope.images.splice(index, 1);
                                                if ($scope.images.length === 0) {
                                                    return;
                                                }
                                            }
                                                
                                        });
                                    } 
                                    else {
                                        $scope.images = [];
                                    }

                                    OnsNotification.hide();
                                },
                            function (error) {
                                OnsNotification.hide();
                                logInfo(request, error, 'warn');
                            });
                    }
                }
            });

        }

    });
});





