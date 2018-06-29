myApp.controller('settingController', function ($scope, $translate) {
    ons.ready(function () {

        //set theme
        var value = window.localStorage.getItem("theme");
        value = (value === "" || value == null) ? "blue-basic" : value;
        document.getElementById(value).checked = true;
        
        //set language
        var lang = window.localStorage.getItem("lang");
        $scope.lang = (lang == null) ? 'en' : lang;
       
        $scope.setTheme = function (colorTheme) {

            var url = 'lib/onsen/css/onsen-css-components-' + colorTheme + '-theme.css';
            $('#themeScript').attr('href', url);
            document.getElementById(colorTheme).checked = true;
            window.localStorage.setItem("theme", colorTheme);
           
        }

        $scope.setLanguage = function(lang) {
            
            $translate.use(lang);
            window.localStorage.setItem("lang", lang);
        };

    });
});