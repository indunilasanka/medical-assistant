myApp.controller('MenuCtrl', function ($scope) {

    $scope.logout = function () {
        window.localStorage.setItem("rememberMe", "false");
        menu.setMainPage('login.html', { closeMenu: true });
    };

    $scope.$on("profile", function (event, args) {
        $scope.profileName = args.Name;
        $scope.companyName = "@ " + args.Country;
    });
});