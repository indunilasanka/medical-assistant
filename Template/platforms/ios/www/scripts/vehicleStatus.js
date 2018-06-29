myApp.controller('vehicleStatusCtrl', function ($scope, $http, AppContext, Enum) {
    ons.ready(function () {
        var cid = AppContext.getUserContext().ClientId;

        //Pie Chart
        function LoadChartData(locId) {

            var ChartRequest = {
                method: 'GET',
                url: AppContext.getUrl(Enum.Url.GetVehicleChartData, [cid, locId]),
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(ChartRequest).then(
                function (response) {
                    var data = response.data === "" ? [{value:0, label:'Vehicle', color:'#FFFFFF'}] : response.data;

                    $('#pieChart').remove();
                    $('#graph-container').append('<canvas id="pieChart" class="center-it" style="" width="200" height="200"></canvas>');
                    var ctx = document.getElementById("pieChart").getContext("2d");
                    var pieChart = new Chart(ctx).Pie(data, { animationSteps: 100, animationEasing: 'easeInOutQuart' });
                    $scope.pieLegends = data;
                },
                function (error) {
                    logInfo(ChartRequest, error, 'warn');
                });
        }

        //Location
        var locRequest = {
            method: 'POST',
            url: AppContext.getUrl(Enum.Url.GetLocations, [cid]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(locRequest).then(
            function (response) {
                if (response.data === "") {
                    console.log(locRequest.url + "load failed!");
                } else {
                    var obj = { ID: 0, IDValue: "", Value: "All" }
                    response.data.unshift(obj);
                    $scope.Locations = response.data;
                    $scope.location = response.data[0];
                    LoadChartData(0);
                }
            },
            function (error) {
                logInfo(locRequest, error, 'warn');
            });

        $scope.setLocation = function (loc) {
            LoadChartData(loc.ID);
        }

    });
});

