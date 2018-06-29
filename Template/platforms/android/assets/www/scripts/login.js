var resultBaseUrl;
myApp.factory('AppContext', function ($rootScope, $http) {

    var request = {
        method: 'GET',
        //url: "http://localhost:8080/",
        headers: {
            'Content-Type': 'application/json'
        }
    }

    $http(request).then(
        function () {
            //resultBaseUrl = "http://localhost:8080/";
        },
        function () {
            //resultBaseUrl = "http://www.testapi.com/";
        });

    return {
        setUserContext: function (context) {
            $rootScope.UserContext = context;
        },
        getUserContext: function () {
            return $rootScope.UserContext;
        },

        setBaseUrl: function () {
            $rootScope.baseUrl = resultBaseUrl;
        },
        getBaseUrl: function () {
            return $rootScope.baseUrl;
        },

        getUrl: function (urlSection, params) {
            var url = "";
            var template = resultBaseUrl + urlSection;
            var t1 = template.split('@');
            if (t1.length === 1)
                return t1.toString();
            for (var i = 0; i < t1.length - 1; i++) {
                url += t1[i] + params[i];
            }
            return url.toString();
        },
        baseUrl: $rootScope.baseUrl
    };
});

myApp.controller('LoginController', function ($scope, $http, $translate, AppContext, Enum) {

    $scope.isAndroid = ons.platform.isAndroid();

    //set theme
    var theme = window.localStorage.getItem("theme");
    theme = (theme === "" || theme == null) ? "blue-basic" : theme;
    var themeCss = 'lib/onsen/css/onsen-css-components-' + theme + '-theme.css';
    $('#themeScript').attr('href', themeCss);

    //set remember me
    var rememberMe = window.localStorage.getItem("rememberMe");
    if (rememberMe === "true")
        menu.setMainPage('home.html', { animation: defaultTransition });
    else
        document.getElementById("rememberMe").checked = false;


    //set language
    var lang = window.localStorage.getItem("lang");
    $translate.use(lang == null ? 'en' : lang);

    function checkNetConnection() {
        var xhr = new XMLHttpRequest();
        var file = "http://mediapp.host78.com/dot.png";
        var r = Math.round(Math.random() * 10000);
        xhr.open('HEAD', file + "?subins=" + r, false);
        try {
            xhr.send();
            if (xhr.status >= 200 && xhr.status < 304) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }


    ons.ready(function () {

        //get app version
        if (device.isVirtual != undefined) {
            cordova.getAppVersion(function (version) {

                window.localStorage.setItem("AppVersion", version);
                $scope.versionNumber = version;
                $scope.$apply();
            });
        }

        AppContext.setUserContext(null);

        $scope.Login = function () {

            if (document.getElementById("rememberMe").checked === true) {
                window.localStorage.setItem("rememberMe", "true");
                window.localStorage.setItem("userName", $scope.userEmail);
                window.localStorage.setItem("password", $scope.userPassword);
            }
            else if (document.getElementById("rememberMe").checked === false) {
                window.localStorage.setItem("rememberMe", "false");
                window.localStorage.setItem("userName", "");
                window.localStorage.setItem("password", "");
            }

            AppContext.setBaseUrl();
            //menu.setMainPage('home.html', { animation: defaultTransition });
            
            var request = {
                    method: 'GET',
                    url: "http://mediapp.host78.com/default.php?Username=" + $scope.userEmail + "&Password=" + $scope.userPassword,
            }
 
            $('#loginLoadingMsg').css('display', 'block');
            notificationModal.show();
            $('#dismissButton').css('display', 'none');
            $('#loginErrorMessage').text("");

            if (checkNetConnection()) {
                $http(request).then(
                function (response) {

                    //OnsNotification.hide();

                    if ((response.data[0] == 0)|(response.data[0] == null)) {
                        notificationModal.hide();
                        ons.notification.alert({ message: 'User name or Password is incorrect!!', title: 'Login Failed', animation: 'slide', buttonLabel: 'Close' });
                    }
                    else {
                        notificationModal.hide();
                        AppContext.setUserContext(response.data[0]);
                        $scope.$root.$broadcast("profile", response.data[0]);
                        menu.setMainPage('home.html', { animation: defaultTransition });
                    }
                },
                function (error) {
                    notificationModal.hide();
                    console.log("error : " + error);
                    $('#NotificationMessage').text("Error occured!");
                });
            }

            else
            {
                notificationModal.hide();
                ons.notification.alert({ message: 'Check your network connection!!', title: 'Login Failed', animation: 'slide', buttonLabel: 'Close' });
            }

            

            //menu.setMainPage('home.html', { animation: defaultTransition });

            //var request = {
            //    method: 'POST',
            //    url: AppContext.getUrl(Enum.Url.Login, []),
            //    data: {
            //        userName: $scope.userEmail,
            //        password: $scope.userPassword,
            //        ip: '1.1.1.1'
            //    },
            //    headers: {
            //        'Content-Type': 'application/json',
            //        'Accept': 'application/json'
            //    }
            //}

            //$scope.validateForm = function (form) {
            //    if (form.$valid) {
            //
            //        OnsNotification.show();
            //
            //        setTimeout(function () {
            //            $('#NotificationMessage').text("Timed out please try again");
            //        }, 20000);
            //
            //        $http(request).then(
            //         function (response) {
            //
            //             OnsNotification.hide();
            //
            //             if (response.data.ClientId === 0) {
            //                 ons.notification.alert({ message: 'User name or Password is incorrect!!', title: 'Login Failed', animation: 'slide', buttonLabel: 'Close' });
            //             }
            //             else {
            //                 AppContext.setUserContext(response.data);
            //                 $scope.$root.$broadcast("profile", response.data);
            //                 menu.setMainPage('home.html', { animation: defaultTransition });
            //             }
            //         },
            //         function (error) {
            //             console.log("error : " + error);
            //             $('#NotificationMessage').text("Error occured!");
            //         });
            //    }
            //
            //};

        };
    });
});

myApp.controller('loginPasswordRecovery', function ($scope) {

    $scope.show = function () {
        ons.notification.prompt({
            title: 'Password Recovery!',
            messageHTML: "The Password will be send to the below Email.Click <b>Recover</b> to continue",
            buttonLabel: "Recover",
            cancelable: true,
            placeholder: 'E-mail',
            callback: function (email) {

            }
        });
    };

});