myApp.controller('MenuCtrl', function ($scope) {
    $scope.$on("profile", function (event, args) {
        $scope.profileName = args.FirstName + " " +args.LastName;
        $scope.companyName = "@ " + args.CompanyName;
    });
});