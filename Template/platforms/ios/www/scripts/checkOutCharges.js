myApp.controller('checkOutChargesCtrl', function ($scope, $http, $filter, AppContext, CheckOutInfo, CheckOutRateInfo, AgreementCharges, Enum) {
    $scope.loading = true;

    var ci = CheckOutInfo;
    var ri = CheckOutRateInfo.RateInfo;
    setDefaults();
    var mo = AgreementCharges.getMisc();
    var tax = AgreementCharges.getTax();
    var cid = AppContext.getUserContext().ClientId;
    var checkinString = ci.checkInDate.toString("MM/dd/yyyy HH:mm");
    var checkoutString = ci.checkOutDate.toString("MM/dd/yyyy HH:mm");

    $scope.Currency = AppContext.getUserContext().Currency;

    $scope.payment = [
                   { value: $scope.baseCharge, text: 'Rate Charge', name: 'baseCharge' },
                   { value: $scope.PromoCode, text: 'Promo Code', notCurrency: true, textfield: true, name: 'promoCode', promoDisabled: false },
                   { value: $scope.PromoDiscount, text: 'Promo Discount', name: 'promoDiscount' },
                   { value: $scope.FinalBase, text: 'Final Base Charge', name: 'finalBase' },
                   { value: $scope.MiscTax, text: 'Miscellaneous Charges', name: 'miscTax' },
                   { value: $scope.PreTax, text: 'Pre Tax', textfield: true, name: 'preTax' },
                   { value: $scope.SubTotal, text: 'Sub Total', subtitle: true, name: 'subTotal' },
                   { value: $scope.TotalTax, text: 'Tax Charges', name: 'totalTax' },
                   { value: $scope.MiscNonTax, text: 'Non-Tax Misc', name: 'miscNonTax' },
                   { value: $scope.Total, text: 'Total', name: 'total' },
                   { value: $scope.PostTax, text: 'Post Tax', textfield: true, name: 'postTax' },
                   { value: $scope.AdvancePaid, text: 'Advance Paid', textfield: true, name: 'advancePaid' },
                   { value: $scope.Balance, text: 'Balance', name: 'balance' },
    ];

    GetAutoPromotion();

    function calculateCheckOut() {
        CalculateUptoFinalBase();
        CalculateUptoSubTotal();
        CalculateUptoBalance();
        tofixednum();
    }

    function CalculateUptoFinalBase() {
        calculateBaseCharge();
        var baseCharge = $filter('filter')($scope.payment, { name: 'baseCharge' }, true)[0].value;
        var finalBase = 0;
        var promoDiscount = $filter('filter')($scope.payment, { name: 'promoDiscount' }, true)[0].value;
        if ((typeof promoDiscount == 'undefined')) {
            promoDiscount = $filter('filter')($scope.payment, { name: 'promoDiscount' }, true)[0].value = 0;
        } else {
            $filter('filter')($scope.payment, { name: 'promoDiscount' }, true)[0].value = promoDiscount = Number(promoDiscount);
        }
        finalBase = baseCharge - promoDiscount;
        $filter('filter')($scope.payment, { name: 'finalBase' }, true)[0].value = finalBase;
    }

    function CalculateUptoSubTotal() {
        calculateMiscCharge();
        var finalBase = $filter('filter')($scope.payment, { name: 'finalBase' }, true)[0].value;
        var miscTax = $filter('filter')($scope.payment, { name: 'miscTax' }, true)[0].value;
        var preTax = $filter('filter')($scope.payment, { name: 'preTax' }, true)[0].value;
        if ((typeof preTax == 'undefined')) {
            preTax = $filter('filter')($scope.payment, { name: 'preTax' }, true)[0].value = 0
        } else {
            $filter('filter')($scope.payment, { name: 'preTax' }, true)[0].value = preTax = Number(preTax);
            CheckOutInfo.PreTax = preTax;
        }
        var subTotal = 0;
        subTotal = finalBase + miscTax + preTax;
        $filter('filter')($scope.payment, { name: 'subTotal' }, true)[0].value = subTotal;
    }

    function CalculateUptoBalance() {
        calculateTax();

        var subTotal = $filter('filter')($scope.payment, { name: 'subTotal' }, true)[0].value;
        var totalTax = $filter('filter')($scope.payment, { name: 'totalTax' }, true)[0].value;
        var miscNonTax = $filter('filter')($scope.payment, { name: 'miscNonTax' }, true)[0].value;
        var total = 0;
        var postTax = $filter('filter')($scope.payment, { name: 'postTax' }, true)[0].value;
        if ((typeof postTax == 'undefined')) {
            postTax = $filter('filter')($scope.payment, { name: 'postTax' }, true)[0].value = 0;
        } else {
            $filter('filter')($scope.payment, { name: 'postTax' }, true)[0].value = postTax = Number(postTax);
            CheckOutInfo.PostTax = postTax;
        }
        var advancePaid = $filter('filter')($scope.payment, { name: 'advancePaid' }, true)[0].value;
        if ((typeof advancePaid == 'undefined')) {
            advancePaid = $filter('filter')($scope.payment, { name: 'advancePaid' }, true)[0].value = 0;
        } else {
            $filter('filter')($scope.payment, { name: 'advancePaid' }, true)[0].value = advancePaid = Number(advancePaid);
            CheckOutInfo.AmountPaid = advancePaid;
        }
        total = subTotal + totalTax + miscNonTax;

        $filter('filter')($scope.payment, { name: 'total' }, true)[0].value = total;
        var balance = 0;

        balance = total + postTax - advancePaid;
        $filter('filter')($scope.payment, { name: 'balance' }, true)[0].value = balance;
        CheckOutInfo.TotalAmount = balance;
    }

    function calculateBaseCharge() {
        var baseCharge = $filter('filter')($scope.payment, { name: 'baseCharge' }, true)[0].value;
        baseCharge = ((Number(ri.HourlyRate)) * ri.HourlyQty) +
                           ((Number(ri.HalfDayRate)) * ri.HalfDayQty) +
                           ((Number(ri.DailyRate)) * ri.DailyQty) +
                           ((Number(ri.WeeklyRate)) * ri.WeeklyQty) +
                           ((Number(ri.WeekEndRate)) * ri.WeekendDailyQty) +
                           ((Number(ri.MonthlyRate)) * ri.MonthlyQty);
        $filter('filter')($scope.payment, { name: 'baseCharge' }, true)[0].value = baseCharge;
        $filter('filter')($scope.payment, { name: 'finalBase' }, true)[0].value = baseCharge;
    }

    function calculateMiscCharge() {
        var MiscWithOutTax = 0;
        var MiscWithTax = 0;
        var miscCharge = { MiscWithOutTax: 0, MiscWithTax: 0 };
        var MiscDays = ri.DailyQty + ri.ExtraDailyQty + ri.WeekendDailyQty + ri.ExtraWeekEndDayQty + (ri.WeeklyQty * 7) + (ri.ExtraWeeklyQty * 7);
        for (var i = 0; i < mo.length; i++) {
            if (mo[i].IsSelected) {
                if (mo[i].CalculationType == 3) {
                    if (mo[i].TaxNotAvailable) {
                        MiscWithOutTax = MiscDays * Number(mo[i].Value);
                        miscCharge.MiscWithOutTax += Number(MiscWithOutTax);
                    } else {
                        MiscWithTax = MiscDays * Number(mo[i].Value);
                        miscCharge.MiscWithTax += Number(MiscWithTax);
                    }
                }
                if (mo[i].CalculationType == 1) {
                    if (!mo[i].TaxNotAvailable) {
                        MiscWithTax = Number(mo[i].Value);
                        miscCharge.MiscWithTax += Number(MiscWithTax);
                    } else {
                        MiscWithOutTax = mo[i].Value;
                        miscCharge.MiscWithOutTax += Number(MiscWithOutTax);
                    }
                }
            }
        }
        $filter('filter')($scope.payment, { name: 'miscTax' }, true)[0].value = Number(miscCharge.MiscWithTax);
        $filter('filter')($scope.payment, { name: 'miscNonTax' }, true)[0].value = Number(miscCharge.MiscWithOutTax);
    }

    function calculateTax() {
        var totalTax = 0;
        totalTax = 0;
        for (var i = 0; i < tax.length; i++) {
            if (tax[i].IsSelected) {
                totalTax += tax[i].Percentage;
            }
        }
        var subTotal = $filter('filter')($scope.payment, { name: 'subTotal' }, true)[0].value;
        totalTax = (subTotal * totalTax) / 100;
        $filter('filter')($scope.payment, { name: 'totalTax' }, true)[0].value = totalTax;

    }

    function calculatePromotion(promotion) {
        var PromoDiscount = 0
        if (typeof promotion.DiscountTypeNo != 'undefined') {
            if (promotion.DiscountTypeNo == 2) {
                PromoDiscount = promotion.DiscountValue;
            } else if (promotion.DiscountTypeNo == 3) {
                var baseCharge = $filter('filter')($scope.payment, { name: 'baseCharge' }, true)[0].value;
                PromoDiscount = (baseCharge * promotion.DiscountValue) / 100;
            }
            $filter('filter')($scope.payment, { name: 'promoDiscount' }, true)[0].value = Number(PromoDiscount);
            $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].value = promotion.PromotionCode;
            CheckOutInfo.promoCode = promotion.PromotionCode;
            CheckOutInfo.promoCodeID = promotion.PromotionID;
            CheckOutInfo.promoDiscount = PromoDiscount;
        }
    }

    function tofixednum() {
        for (var i = 0; i < $scope.payment.length; i++) {
            if ($scope.payment[i].name != 'promoCode') {
                $scope.payment[i].value = $scope.payment[i].value.toFixed(2);
            }
        }
    }

    function GetAutoPromotion() {
        var request = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetAutoPromotion, [cid, CheckOutInfo.location.ID, CheckOutInfo.vehicletype.ID, checkoutString, checkinString]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(request).then(
           function (response) {
               $scope.loading = false;
               if (response.data.Promotion != null) {
                   calculateBaseCharge();
                   calculatePromotion(response.data.Promotion);
                   $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].promoDisabled = true;
               }
               calculateCheckOut();
           },
           function (error) {
               ons.notification.alert({ message: 'Erorr Occured', title: null, animation: 'slide', buttonLabel: 'Ok' });
           });
    }

    function setDefaults() {
        CheckOutInfo.promoCode = "";
        CheckOutInfo.promoCodeID = 0;
        CheckOutInfo.promoDiscount = 0;
        CheckOutInfo.PreTax = 0;
        CheckOutInfo.PostTax = 0;
        CheckOutInfo.AmountPaid = 0;
    }

    $scope.applyPromo = function () {
        var promoCode = $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].value;
        if (typeof promoCode == 'undefined' ||  promoCode == "") {
            ons.notification.alert({ message: 'Invalid Code!', title: 'Error', animation: 'slide', buttonLabel: 'Ok' });
            return;
        }

        var request = {
            method: 'GET',
            url: AppContext.getUrl(Enum.Url.GetPromotion, [promoCode, CheckOutInfo.vehicletype.ID, CheckOutInfo.location.ID, cid, checkoutString, checkinString]),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        $http(request).then(
           function (response) {

               var message = "";
               if (response.data.Result == -99) {
                   $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].value = "";
                   ons.notification.alert({ message: "Promotion is not available!", title: null, animation: 'slide', buttonLabel: 'Ok' });
                   return;
               }else if (response.data.Result > -1) {
                   message = "Promotion Applied!";
                   ons.notification.alert({ message: message, title: null, animation: 'slide', buttonLabel: 'Ok' });
               }
               else if (response.data.Result == -1) {
                   message = "This Promo Code is Valid for " + response.data.Promotion.MinimumDay + " Minimum no. of Rental Days";
                   $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].value = "";
                   ons.notification.alert({ message: message, title: null, animation: 'slide', buttonLabel: 'Ok' });
                   return;
               }
               else {
                   var startDate = ConvertJsonDateString(response.data.Promotion.StartDate, 'date');
                   var endDate =  ConvertJsonDateString(response.data.Promotion.EndDate, 'date');
                   message = "This Promo will be Valid from " + startDate + " to " + endDate;
                   $filter('filter')($scope.payment, { name: 'promoCode' }, true)[0].value = "";
                   ons.notification.alert({ message: message, title: null, animation: 'slide', buttonLabel: 'Ok' });
                   return;
               }

               if (response.data.Promotion != null) {
                   calculateBaseCharge();
                   calculatePromotion(response.data.Promotion);
               }

               calculateCheckOut();
           },
           function (error) {
               log(request, error, 'warn');
           });
    };

    $scope.calculateCheckOut = function () {
        CalculateUptoFinalBase();
        CalculateUptoSubTotal();
        CalculateUptoBalance();
        tofixednum();
    };

    $scope.submit = function () {
        $scope.homeNavigator.pushPage('addDamage.html', { animation: defaultTransition, navigateFrom: $scope.navigateFrom });
    };

});
