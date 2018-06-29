myApp.controller('settingController', function ($scope, $translate) {
    ons.ready(function () {

        //set animation
        var animation = window.localStorage.getItem("animation");
        switch (animation) {
            case 'lift': document.getElementById("animationLift").checked=true; break;
            case 'fade': document.getElementById("animationFade").checked=true; break;
            case 'slide': document.getElementById("animationSlide").checked=true; break;
        }

        //set theme
        var value = window.localStorage.getItem("key");
        if (value != "") {
            if (value == "basicTheme") {
                document.getElementById("basic").checked = true;
            }
            else if (value == "blueTheme") {
                document.getElementById("blue").checked = true;
            }
            else if (value == "darkTheme") {
                document.getElementById("dark").checked = true;
            }
            else if (value == "purpleTheme") {
                document.getElementById("purple").checked = true;
            }
            else if (value == "sunshineTheme") {
                document.getElementById("sunshine").checked = true;
            }
        }
        else {
            document.getElementById("basic").checked = true;
        }
        
        //set language
        var lang = window.localStorage.getItem("lang");
        $scope.lang = (lang == null) ? 'en' : lang;
       
        $scope.setTheme = function (colorTheme) {
            switch (colorTheme) {
                case 'basicTheme':
                    $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-blue-basic-theme.css');
                    window.localStorage.setItem("theme", "basicTheme");
                    break;
                case 'blueTheme':
                    $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-blue-theme.css');
                    window.localStorage.setItem("theme", "blueTheme");
                    break;
                case 'darkTheme':
                    $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-dark-theme.css');
                    document.getElementById("dark").checked = true;
                    window.localStorage.setItem("theme", "darkTheme");
                    break;
                case 'purpleTheme':
                    $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-purple-theme.css');
                    window.localStorage.setItem("theme", "purpleTheme");
                    document.getElementById("purple").checked = true;
                    break;
                case 'sunshineTheme':
                    $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-sunshine-theme.css');
                    window.localStorage.setItem("theme", "sunshineTheme");
                    document.getElementById("sunshine").checked = true;
                    break;
            }
           
        }

        $scope.setAnimation = function (animation) {
            switch (animation) {
                case 'lift':
                    window.localStorage.setItem("animation", "lift");
                    defaultTransition = 'lift';
                    break;
                case 'fade':
                    window.localStorage.setItem("animation", "fade");
                    defaultTransition = 'fade';
                    break;
                case 'slide':
                    window.localStorage.setItem("animation", "slide");
                    defaultTransition = 'slide';
                    break;
            }
        }

        $scope.setLanguage = function(lang) {
            //console.log(lang);
            $translate.use(lang);
            window.localStorage.setItem("lang", lang);
        };

        $scope.clearCredentials = function () {
            ons.notification.confirm({
                title: 'Action Required',
                messageHTML: "Do you want to  <b>Clear</b> Credentials?",
                buttonLabels: ["Yes", "No"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            window.localStorage.setItem("rememberMe", "false");
                            window.localStorage.setItem("userName", "");
                            window.localStorage.setItem("password", "");
                            break;
                    }
                }
            });
        }

        $scope.resetTheme = function () {
            ons.notification.confirm({
                title: 'Action Required',
                messageHTML: "Do you want to  <b>Rest</b> them theme?",
                buttonLabels: ["Yes", "No"],
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            window.localStorage.setItem("theme", "basicTheme");
                            $('#themeScript').attr('href', 'lib/onsen/css/onsen-css-components-blue-basic-theme.css');
                            document.getElementById("basic").checked = true;
                            break;
                    }
                }
            });
        }

    });
});