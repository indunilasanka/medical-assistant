myApp.controller('CheckDamageColorPopover', function ($scope) {

    ons.createPopover('CheckDamagecolorSetPopover.html').then(function (popover) {
        $scope.popover = popover;
    });
});

var checkDamageSignatureCanvas;
var newCheckDamages = false;

myApp.controller('CheckDamageCtrl', function ($scope) {

    $scope.showVehicleImages = function () {
        var agreementId = homeNavigator.getCurrentPage().options.agreementId;
        var navfrom = homeNavigator.getCurrentPage().options.navigateFrom;
        $scope.homeNavigator.pushPage('vehicleImages.html', { animation: defaultTransition, agreementId: agreementId, navigateFrom: navfrom });
    }

    $scope.showExtraImages = function () {
        homeNavigator.pushPage('vehicleCustomImages.html', { animation: defaultTransition });
    }

});

myApp.controller('checkDamageSign', function ($scope) {
    checkDamageSignatureCanvas = document.getElementById('checkDamageSignatureCanvas');
    var options = {
        defaultAction: 'drawIt',
        penColour: '#2c3e50',
        bgColour: 'rgba(0, 0, 0, 0)',
        lineWidth: 0
    }
    var canvas = $('.sigPad').signaturePad(options);

    $scope.clear = function () {
        canvas.clearCanvas();
    }
});
var checkDamages = [];
myApp.controller('checkDamageCanvas', function ($scope, $http, AppContext, Enum) {
    ons.ready(function () {
        var canvas = document.getElementById('myCanvasCheckDamage');
        var context = canvas.getContext('2d');


        var cid = AppContext.getUserContext().ClientId;
        var vid = homeNavigator.getCurrentPage().options.vehicleId;


        var url = AppContext.getUrl(Enum.Url.GetDamages, [vid, cid]);

        var request = {
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        var damagesLength;
        //$scope.info = AddDamage;
        $http(request).then(
            function (response) {
                if (response.data != "") {

                    var radius = 8;
                    checkDamages = [];

                    damagesLength = response.data.length;
                    for (var i = 0; i < response.data.length; i++) {
                        var oldDamages = { VehicleId: "", DmgType: "", X: "", Y: "" };
                        oldDamages.VehicleId = response.data[i].VehicleId;
                        oldDamages.DmgType = response.data[i].Type;
                        oldDamages.X = response.data[i].X;
                        oldDamages.Y = response.data[i].Y;
                        checkDamages.splice(i, 0, oldDamages);

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

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
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
            pos.VehicleId = vid;
            checkDamages.push(pos);

            return checkDamages;
        }

        $scope.undo = function () {
            newCheckDamages = false;
            checkDamages = checkDamages.slice(0, damagesLength);
            context.clearRect(0, 0, canvas.width, canvas.height);

            var radius = 8;
            for (var i = 0; i < checkDamages.length; i++) {
                var loc = checkDamages[i];
                context.globalAlpha = 0.3;
                context.beginPath();
                context.arc(loc.X, loc.Y, radius, 0, 2 * Math.PI, false);
                context.fillStyle = (loc.DmgType == 1) ? 'yellow' : (loc.DmgType == 2) ? 'orange' : 'red';
                context.fill();
                context.lineWidth = 1;
                context.strokeStyle = '#003300';
                context.stroke();
            }

        }


        canvas.addEventListener('click', function (evt) {
            newCheckDamages = true;
            var pos = getMousePos(canvas, evt);

            var img = document.getElementById('imgVehicle');
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

            var colors = tempCanvas.getContext('2d').getImageData(pos.x, pos.y, 1, 1).data;
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
                    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
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

myApp.controller('checkDamageSubmit', function ($scope, $http, AppContext,Enum) {
    ons.ready(function () {
        $scope.submit = function () {
            
            OnsNotification.show();
            $('#LoadingLoopDiv').fadeIn();
            $('#NotificationMessage').text("Saving...");
            $('#NotificationMessage').fadeIn();
           

            var options = {
                defaultAction: 'drawIt',
                penColour: '#2c3e50',
                lineWidth: 0,
                bgColour: 'rgba(0, 0, 0, 0)',
                drawOnly: true
            }
            var canvas = $('.sigPad').signaturePad(options);
            isCheckDamageSignEmpty = (canvas.getSignature().length == 0);

            if (newCheckDamages && isCheckDamageSignEmpty) {
                OnsNotification.hide();
                ons.notification.alert({ message: 'Sign is Required', title: 'Error!', buttonLabel: 'OK' });
                return;
            }


            var saveCount = 0;
            //to save the damages sign

            var url = AppContext.getUrl(Enum.Url.SaveDamageImage, []);
            var imgerequest = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    dmgs: checkDamages,
                    vehicleId: 0,
                    customerId: 0,
                    agreementNo: "",
                    agreementId: homeNavigator.getCurrentPage().options.agreementId,
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
                            homeNavigator.popPage({ animation: defaultTransition });
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
                    logInfo(imgerequest, error, 'warn');
                });


            if (!isCheckDamageSignEmpty) {
                var dataURL = checkDamageSignatureCanvas.toDataURL();

                var url = AppContext.getUrl(Enum.Url.SaveDamageSign, []);
                var requestSign = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        vehicleId: homeNavigator.getCurrentPage().options.vehicleId,
                        base64Img: dataURL
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
                                homeNavigator.popPage({ animation: defaultTransition });
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
                        logInfo(imgerequest, error, 'warn');
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
                    homeNavigator.popPage({ animation: defaultTransition });
                }
            }


            if (checkDamages.length != 0) {
                //save damages[]
                var url = AppContext.getUrl(Enum.Url.SaveDamages, []);

                var request = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json'

                    },
                    data: {
                        dmgs: checkDamages,
                        clientId: AppContext.getUserContext().ClientId,
                        vehicleId: homeNavigator.getCurrentPage().options.vehicleId
                    }
                }

                $http(request).then(
                    function (response) {
                        if (response.data == 1) {
                            if (++saveCount == 3) {
                                newCheckDamages = false;
                                $('#NotificationMessage').fadeOut();
                                $('#LoadingLoopDiv').fadeOut();
                                $('#NotificationMessage').text("Saved");
                                $('#NotificationMessage').fadeIn();
                                setTimeout(function () {
                                    OnsNotification.hide();
                                }, 1000);
                                homeNavigator.popPage({ animation: defaultTransition });
                            }
                        }
                        else {
                            OnsNotification.hide();
                            ons.notification.alert({ message: 'Save Damages Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        }
                    },
                    function (error) {
                        OnsNotification.hide();
                        ons.notification.alert({ message: 'Save Damages Failed!', title: null, animation: 'slide', buttonLabel: 'Dismiss' });
                        logInfo(imgerequest, error, 'warn');
                    });
            }
            else {
                if (++saveCount == 2) {
                    $('#NotificationMessage').fadeOut();
                    $('#LoadingLoopDiv').fadeOut();
                    $('#NotificationMessage').text("Saved");
                    $('#NotificationMessage').fadeIn();
                    setTimeout(function () {
                        OnsNotification.hide();
                    }, 1000);
                    homeNavigator.popPage({ animation: defaultTransition });
                }
            }





        }
    });

});
