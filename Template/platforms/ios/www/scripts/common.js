function ConvertJsonDateString(jsonDate, type) {

    var date = null;
    if (jsonDate) {
        var regex = /-?\d+/;
        var matches = regex.exec(jsonDate);
        var dt = new Date(parseInt(matches[0]));
        if (type == 'date') {
            date = dt.toString("dd MMMM yyyy");

        }
        else {
            date = dt.toString("MM.dd.yyyy, hh:mm tt");
        }
    }
    return date;
};

function JsonDateToDate(jsonDate) {

    if (jsonDate) {
        var regex = /-?\d+/;
        var matches = regex.exec(jsonDate);
        var dt = new Date(parseInt(matches[0]));
    }
    return dt;
};

myApp.filter('titleCase', function () {
    return function (input) {
        input = input || '';
        return input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();

        });
    };
});

myApp.filter("as", function ($parse) {
    return function (value, context, path) {
        return $parse(path).assign(context, value);
    };
});

myApp.factory('Enum', function () {

    return {
        Themes: {
            Dark: "lib/onsen/css/onsen-css-components-dark-theme.css",
            Sunshine: "lib/onsen/css/onsen-css-components-sunshine-theme.css",
            Blue: "lib/onsen/css/onsen-css-components-blue-theme.css",
            Purple: "lib/onsen/css/onsen-css-components-purple-theme.css",
            Default: "lib/onsen/css/onsen-css-components-blue-basic-theme.css"
        },

        Url: {

            AddReservation: "Reservation/AddReservation",
            AddLead: "Common/AddLead",
            AddCustomImage: "AgreementData/AddCustomImage",

            CheckinAgreement: "AgreementData/CloseAgreement",
            CheckoutAgreement: "AgreementData/CreateAgreement",
            CreateCustomer: "AgreementData/CreateCustomer",

            DeleteCustomImages: "AgreementData/DeleteCustomImages?clientId=@&imageId=@",

            GetAutoAgreementNo: "AgreementData/GetAutoAgreementNumber?clientId=@",
            GetAutoPromotion: "AgreementData/GetAutoPromotion?ClientId=@&LocationId=@&VehicleTypeId=@&OutDate=@&InDate=@",
            GetAgreementTypes: "AgreementData/GetAllAgreementTypes?clientId=@",
            GetAgreement: "AgreementData/GetAgreementDetailsByID",
            GetCustomerInfo: "AgreementData/GetCustomerInfo?phoneNo=@&clientId=@",
            GetCustomerTypes: "AgreementData/GetAllCustomerTypes?clientId=@",
            GetCustomImages: "AgreementData/GetCustomImages?clientId=@&userId=@&agreementNumber=@",
            GetCountries: "AgreementData/GetAllCountryForClient?clientId=@",
            GetDamages: "AgreementData/GetAllDamagesByVehId?VehicleId=@&clientId=@",
            GetLocations: "AgreementData/GetAllLocationForClient?clientId=@",
            GetMiscCharges: "AgreementData/GetMiscCharges?locationID=@&VehcileTypeID=@&clientId=@",
            GetPromotion: "AgreementData/GetPromotion?PromotionCode=@&VehicleTypeId=@&LocationId=@&ClientId=@&OutDate=@&InDate=@",
            GetReservation: "Reservation/GetReservation",
            GetReservationTypes: "Reservation/GetAllReservationTypes?clientId=@",
            GetRateTypes: "AgreementData/GetRateType?clientId=@&vehicleTypeId=@&LocationId=@",
            GetRateDetail: "AgreementData/GetSeasonRateInforForVehicleType",
            GetTerms: "AgreementData/GetTermsForClient?clientId=@&type=@",
            GetTax: "AgreementData/GetTaxByLocationId?locationID=@&clientId=@",
            GetVehicleInfo: "AgreementData/GetVehicleInfoByPlateNo?plno=@&locationId=@&clientId=@",
            GetVehicleTypes: "AgreementData/GetAllVehicleTypeForClient?clientId=@",
            GetVehicles: "AgreementData/SearchAvailableVehicle?clientId=@&locationID=@&VehicleType=@",
            GetVehicleImages: "AgreementData/LoadvehicleViewImages?clientId=@&AgreementID=@",
            GetVehicleChartData: "AgreementData/GetVehicleStatusData?clientId=@&locationId=@",
            GetStates: "AgreementData/GetAllStateForClient?countryid=@&clientId=@",

            Login: "User/Login",

            PrintAgreement: "AgreementData/PrintAgreementPdf?clientId=@&AgreementID=@&status=@&templateId=@",
            PrintReservation: "Reservation/PrintReservation?clientId=@&reservationId=@&status=@",

            SaveAgreementSign: "AgreementData/SaveAgreementSign",
            SaveDamages: "AgreementData/SaveDamages",
            SaveDamageImage: "AgreementData/SaveVehicleDamageImages",
            SaveDamageSign: "AgreementData/SaveDamageSign",
            SaveLicenceImage: "AgreementData/SaveCustomerLicenceImage",
            SaveVehicleImages: "AgreementData/SaveVehicleViewImages",
            SearchReservations: "Reservation/SearchReservations",
            SearchAgreements: "AgreementData/SearchAgreementsMobile",
            SendAgreementEmail: "AgreementData/SendAgreementEmail?clientId=@&AgreementID=@&status=@",
            SendReservationEmail: "Reservation/SendReservationEmail?clientId=@&reservationId=@&status=@",

            UpdateCustomImage: "AgreementData/UpdateCustomImage",
            UpdateReservationStatus: "Reservation/UpdateReservationStatus?clientId=@&reservationId=@&status=@",
        },

        FeatureType: {
            DATA_PRINTING: 1,
            AUTO_AGREEMENT_NUMBER: 2,
            CUSTOM_AGREEMENT_PDF: 3,
            AGREEMENT_WITH_NEW_STATUS: 4,
            AUTO_SEARCH_VEHICLES_IN_AGREEMENT: 5,
            ADDITIONAL_DAYCHARGE_FOR_DELAY: 6,
            CUSTOM_INVOICE_PDF: 7,
            DRIVER_LICENSE_VERIFICATION: 8,
            EDIT_PENDING_PAYMENT: 9,
            AUTO_CALCULATION: 10,
            FUELLEVEL_EIGHT: 11,
            CANCELLATION_CHARGE: 12,
            CUSTOM_RESERVATION_PDF: 13,
            ADDITIONAL_DAY_HOUR_CHARGE_FOR_DELAY: 14,
            CUSTOM_EMAIL_POLICY: 15,
            DELETE_AGREEMENT: 16,
            ENCRYPT_CREDIT_CARD_NO: 17,
            ADDITIONAL_DRIVER_OPTION: 18,
            ADD_AUTO_EXPENSE: 19,
            CUSTOM_DAY_FOR_MONTH: 20,
            SPECIAL_DAY: 21,
            DELETE_RESERVATION: 22,
            EDIT_CLOSED_AGREEMENT: 23,
            EDIT_CUSTOM_PDF: 24,
            ADVANCED_PAYMENT: 25,
            SUPPORT_METRIC: 26,
            DATE_FORMAT_CHANGE_UK: 31,
            REPLY_TO_CONFIG: 28,
            DOCUMENT_BCC: 29,
            DATE_FORMAT_CHANGE_USA: 30,
            MESSAGE_BODY: 32,
            PHONE_NUMBER_FORMAT: 33,
            PASSWORD_EXPIRY: 34,
            TYPE_BASED_AGREEMENT_NO: 35,
            INSURANCE_MANDATORY: 36,
            DAILY_FOR_HOUR: 37,
            CUSTOM_DATE_SHORT_FORMAT: 38,
            CUSTOM_DATE_LONG_FORMAT: 39,
            CUSTOM_DATETIME_PICKER_FORMAT: 40,
            DRIVING_LICENSE_SCANNING: 41,
            CHANGE_STATUS: 42,
            SECURITY_DEPOSIT: 43,
            EDIT_AGREEMENT_NUMBER: 44,
            ALWAYS_SAME_PICKUP_AND_DROP: 45,
            PAY_WITH_PAYPAL: 46,
            ROMANIA_CUSTOMER_MANDATORY: 47,
            NEW_CALCULATIONS: 48,
            NO_OF_HR_FOR_HALFDAY: 49,
            AFTER_HR_RATE: 50,
            DAY_RATE_CUSTOM_DAYS: 51,
            CUSTOMER_EMAIL_MANDATORY: 53
        },

        AgreementStatus: {
            All: 0,
            Open: 2,
            Close: 3,
            Cancel: 4,
            PendingPayment: 5,
            Void: 6,
            PendingDeposit: 7
        },

        ReservationStatus: {
            All: 0,
            Open: 2,
            CheckOut: 3,
            NoShow: 4,
            Canceled: 5,
            New: 7
        },

        FuelLevel: {
            Empty: 1,
            Quater: 2,
            Half: 3,
            ThreeQuater: 4,
            Full: 5
        },

        NavigateFrom: {
            Agreement: 1,
            Reservation: 2,
            ResToAgr: 3,
            Home: 4,
            Checkin:5,
        },

        TermType: {
            All: 0,
            CheckOut: 1,
            CheckIn: 2,
        }
    };
});

myApp.directive('scrollOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, $elm, attrs) {
            var idToScroll = attrs.loc;
            $elm.on('click', function () {
                var $target;
                if (idToScroll) {
                    $target = $(idToScroll);
                } else {
                    $target = $elm;
                }
                $("body").animate({ scrollTop: $target.offset().top }, "slow");
            });
        }
    }
});

function logInfo(request, error, type) {

    var msg = request.url + " : " + error.status + ' ' + error.statusText + '( ' + error.data.code + ' )';

    switch (type) {
        case 'info':
            console.log(msg); break;
        case 'warn':
            console.warn(msg); break;
        case 'error':
            console.error(msg); break;
        default:
            break;
    }
}

var english_dictionary = {
    All: "All"
};

var french_dictionary = {
    All: "Tout"
};

var russian_dictionary = {
    All: "???"
};

myApp.config(function ($stateProvider, $urlRouterProvider, $translateProvider) {

    $translateProvider.translations('en', english_dictionary);

    $translateProvider.translations('fr', french_dictionary);

    $translateProvider.translations('ru', russian_dictionary);

    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
});

document.addEventListener("offline", function () {
    ons.notification.alert({ message: 'No internet connectivity detected. Please reconnect and try again.', title: 'No internet connection', animation: 'slide', buttonLabel: 'Ok' });

}, false);

//document.addEventListener("online", function () {
//    alert("online");
//}, false);



