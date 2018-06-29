myApp.factory('AddDamage', function ($rootScope) {
    var obj = {};
    //obj.damages = {};
    return obj;
});

var addDamageSignatureCanvas;

var newAddDamages = false;
myApp.controller('addDamageSignature', function ($scope, AgreementDetails) {
    angular.copy(null, AgreementDetails);
    addDamageSignatureCanvas = document.getElementById('addDamageSignatureCanvas');
    var options = {
        defaultAction: 'drawIt',
        penColour: '#2c3e50',
        bgColour: 'rgba(0, 0, 0, 0)',
        lineWidth: 0,
        drawOnly: true
    }
    var canvas = $('.sigPad').signaturePad(options);

    $scope.clear = function () {

        canvas.clearCanvas();
    }
});

var damagesCanvas;
var damages = [];
var damagesLength;
myApp.controller('addDamageCanvas', function ($scope, $http, AddDamage, AppContext, CheckOutInfo, Enum) {

    ons.ready(function () {

        $scope.dmg = AddDamage;
        $('#addDamageConfirm').attr('disabled');
        var cid = AppContext.getUserContext().ClientId;
        var vid = CheckOutInfo.vehicleInfo.VehcileID;
        damagesCanvas = document.getElementById('damagesCanvas');
        var context = damagesCanvas.getContext('2d');

        var url = AppContext.getUrl(Enum.Url.GetDamages, [vid, cid]);
        var request = {
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        damagesCanvas.dispatchEvent(new Event('mousedown'))
        //$scope.info = AddDamage;
        $http(request).then(
            function (response) {

                $('#addDamageConfirm').removeAttr('disabled');
                damagesLength = response.data.length;

                if (response.data != "") {

                    var radius = 8;
                    damages = [];


                    for (var i = 0; i < response.data.length; i++) {
                        var oldDamages = { VehicleId: "", DmgType: "", X: "", Y: "" };
                        oldDamages.VehicleId = response.data[i].VehicleId;
                        oldDamages.DmgType = response.data[i].Type;
                        oldDamages.X = response.data[i].X;
                        oldDamages.Y = response.data[i].Y;
                        damages.splice(i, 0, oldDamages);

                        var loc = response.data[i];
                        context.beginPath();
                        context.globalAlpha = 0.3;
                        context.arc(loc.X, loc.Y, radius, 0, 2 * Math.PI, false);
                        context.fillStyle = (loc.Type == 1) ? 'yellow' : (loc.Type == 2) ? 'orange' : 'red';
                        context.fill();
                        context.lineWidth = 1;
                        context.strokeStyle = '#003300';
                        context.stroke();
                    }

                }
            },
            function (error) {
                logInfo(request, error, 'warn');
            });

        function getMousePos(damagesCanvas, evt) {
            var rect = damagesCanvas.getBoundingClientRect();
            return {
                X: evt.clientX - rect.left,
                Y: evt.clientY - rect.top
            };
        }

        function getDamageColor() {
            var color;

            switch ($scope.damageType) {
                case 'dent':
                    color = 'yellow';
                    break;
                case 'crack':
                    color = 'orange';
                    break;
                case 'missing':
                    color = 'red';
                    break;
                default:
                    color = null;
            }
            return color;
        }

        function addDamage(pos) {

            switch ($scope.damageType) {
                case 'dent':
                    pos.DmgType = 1;
                    break;
                case 'crack':
                    pos.DmgType = 2;
                    break;
                case 'missing':
                    pos.DmgType = 3;
                    break;
            }
            pos.VehicleId = CheckOutInfo.vehicleInfo.VehcileID;
            damages.push(pos);

            return damages;
        }

        $scope.undo = function () {
            newAddDamages = false;

            damages = damages.slice(0, damagesLength);
            context.clearRect(0, 0, damagesCanvas.width, damagesCanvas.height);

            var radius = 8;
            for (var i = 0; i < damages.length; i++) {
                var loc = damages[i];
                context.beginPath();
                context.globalAlpha = 0.3;
                context.arc(loc.X, loc.Y, radius, 0, 2 * Math.PI, false);
                context.fillStyle = (loc.DmgType == 1) ? 'yellow' : (loc.DmgType == 2) ? 'orange' : 'red';
                context.fill();
                context.lineWidth = 1;
                context.strokeStyle = '#003300';
                context.stroke();
            }

        }
        $scope.clear = function () {

            ons.notification.confirm({
                title: 'Action Required',
                messageHTML: "Do you want to Clear <b>all</b> damages?",
                buttonLabels: ["Yes", "No"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            damagesLength = 0;
                            context.clearRect(0, 0, damagesCanvas.width, damagesCanvas.height);
                            newAddDamages = true;
                            damages = [];
                            break;
                    }
                }
            });

        }
        damagesCanvas.addEventListener('click', function (evt) {
            newAddDamages = true;
            var pos = getMousePos(damagesCanvas, evt);

            var img = document.getElementById('imgVehicle');
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

            var colors = tempCanvas.getContext('2d').getImageData(pos.X, pos.Y, 1, 1).data;
            var alpha = colors[3];

            var damageColor = getDamageColor();
            if (damageColor != null) {
                if (alpha === 0) {
                    ons.notification.alert({ message: 'Invalid point', title: 'Invalid!', buttonLabel: 'OK' });
                    return;
                } else {
                    var radius = 8;
                    context.beginPath();
                    context.globalAlpha = 1;
                    context.arc(pos.X, pos.Y, radius, 0, 2 * Math.PI, false);
                    context.fillStyle = damageColor;
                    context.fill();
                    context.lineWidth = 1;
                    context.strokeStyle = '#003300';
                    context.stroke();

                    addDamage(pos);
                }
            } else {
                ons.notification.alert({ message: 'Please select a damage type!', title: 'Invalid!', buttonLabel: 'OK' });
                return;
            }

        }, false);
    });
});

myApp.controller('addDamageColorPopover', function ($scope) {

    ons.createPopover('colorSetPopover.html').then(function (popover) {
        $scope.popover = popover;
    });
});

myApp.controller('addDamageSubmit', function ($scope, AppContext, $http, AddDamage, CheckOutInfo, ExCustomer,Enum) {

    $scope.navigateFrom = homeNavigator.getCurrentPage().options.navigateFrom;

    ons.ready(function () {
        //$scope.info = AddDamage;
        $scope.submit = function () {

            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').text("Saving...");
            $('#NotificationMessage').fadeIn();

            var dataURL = addDamageSignatureCanvas.toDataURL();
         
            var options = {
                defaultAction: 'drawIt',
                penColour: '#2c3e50',
                bgColour: 'rgba(0, 0, 0, 0)',
                lineWidth: 0,
                drawOnly: true
            }
            var canvas = $('.sigPad').signaturePad(options);
            isAddDamageSignEmpty = (canvas.getSignature().length == 0);

            if (newAddDamages && isAddDamageSignEmpty) {

                ons.notification.alert({ message: 'Sign is Required', title: 'Error!', buttonLabel: 'OK' });
                OnsNotification.hide();
                return;
            }

            var saveCount = 0;

            var url = AppContext.getUrl(Enum.Url.SaveDamageImage, []);
            var test = ExCustomer.getCustomerInfo();
            var imgerequest = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    dmgs: damages,
                    vehicleId: CheckOutInfo.vehicleInfo.VehcileID,
                    customerId: ExCustomer.getCustomerInfo().CustomerId,
                    agreementNo: CheckOutInfo.agreementNo,
                    agreementId: 0,
                    clientId: AppContext.getUserContext().ClientId,
                }
            }

            $http(imgerequest).then(
                function (response) {
                    if (response.data) {

                        if (++saveCount == 3) {
                            $('#NotificationMessage').fadeOut();
                            $('#LoadingLoopDiv').fadeOut();
                            $('#NotificationMessage').text("Saved");
                            $('#NotificationMessage').fadeIn();
                            setTimeout(function () {
                                OnsNotification.hide();
                            }, 1000);
                            homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
                        }
                    }
                    else {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Save Damage image Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                    }
                },
                function (error) {
                    OnsNotification.hide();
                    ons.notification.alert({ message: 'Save Damages image Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                    logInfo(imgerequest, error, 'warn');
                });


            if (damages.length != 0 || newAddDamages) {
                //to save the damage[]
                var url = AppContext.getUrl(Enum.Url.SaveDamages, []);
                var request = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        dmgs: damages,
                        clientId: AppContext.getUserContext().ClientId,
                        vehicleId: CheckOutInfo.vehicleInfo.VehcileID,
                    }
                }

                $http(request).then(
                    function (response) {
                        if (response.data == 1) {
                            newAddDamages = false;
                            if (++saveCount == 3) {
                                $('#NotificationMessage').fadeOut();
                                $('#LoadingLoopDiv').fadeOut();
                                $('#NotificationMessage').text("Saved");
                                $('#NotificationMessage').fadeIn();
                                setTimeout(function () {
                                    OnsNotification.hide();
                                }, 1000);
                                homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
                            }
                        }
                        else {
                            OnsNotification.hide();
                            ons.notification.alert({ message: 'Save Damages Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        }
                    },
                    function (error) {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Save Damages  Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        logInfo(request, error, 'warn');
                    });
            }
            else {
                if (++saveCount == 3) {
                    $('#NotificationMessage').fadeOut();
                    $('#LoadingLoopDiv').fadeOut();
                    $('#NotificationMessage').text("Saved");
                    $('#NotificationMessage').fadeIn();
                    setTimeout(function () {
                        OnsNotification.hide();
                    }, 1000);
                    homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
                }
            }

            //to save the damages sign
            if (!isAddDamageSignEmpty) {
                var url = AppContext.getUrl(Enum.Url.SaveDamageSign, []);
                var requestSign = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        vehicleId: CheckOutInfo.vehicleInfo.VehcileID,
                        base64Img: dataURL,
                    }
                }

                $http(requestSign).then(
                    function (response) {
                        if (response.data == "success") {

                            if (++saveCount == 3) {
                                $('#NotificationMessage').fadeOut();
                                $('#LoadingLoopDiv').fadeOut();
                                $('#NotificationMessage').text("Saved");
                                $('#NotificationMessage').fadeIn();
                                setTimeout(function () {
                                    OnsNotification.hide();
                                }, 1000);
                                homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
                                //homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition });
                            }
                        }
                        else {
                            OnsNotification.hide();
                            ons.notification.alert({ message: 'Save Damage Sign Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        }
                    },
                    function (error) {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Save Damage Sign Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        logInfo(requestSign, error, 'warn');
                    });
            }
            else {
                if (++saveCount == 3) {
                    $('#NotificationMessage').fadeOut();
                    $('#LoadingLoopDiv').fadeOut();
                    $('#NotificationMessage').text("Saved");
                    $('#NotificationMessage').fadeIn();
                    setTimeout(function () {
                        OnsNotification.hide();
                    }, 1000);
                    homeNavigator.pushPage('createAgreement.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
                }
            }
        };
    });
});

myApp.controller('AddDamageCtrl', function ($scope) {

    $scope.showVehicleImages = function () {
        homeNavigator.pushPage('vehicleImages.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
    }
    
    $scope.showExtraImages = function () {
        homeNavigator.pushPage('vehicleCustomImages.html', { animation: defaultTransition });
    }

});
