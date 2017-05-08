/* Copyright 2017, Brennedith Garcia */
/* global angular messages */

var app = angular.module('app', []);

app.controller('home', function($scope, $http) {

  // Currency

  var exCAD = 1.3, exchange = 1, currency = "USD";

  /*$http.get("https://api.fixer.io/latest?base=USD")
    .success(function (response) { exCAD = response.rates.CAD; })
    .error(function (err) { console.log("CAD currency error: ", err); });*/

  $scope.changeCurrency = function () {
    currency = currency === "USD" ? "CAD" : "USD";
    exchange = currency === "USD" ? 1 : exCAD;
    $scope.currency = currency;
  };

  // List of sales

  $scope.salesCollection = [];

  $scope.addSale = function() {
    if($scope.saleNumber > 0 && $scope.saleRevenue > 0) {
      $scope.salesCollection.push( { number: $scope.saleNumber, revenue: $scope.saleRevenue/exchange } );
      $scope.saleRevenue = "";
      if(currency === "CAD") { $scope.changeCurrency() };
      updateMetrics();
    }
  };

  $scope.removeSale = function(index) {
    $scope.salesCollection.splice(index,1);
    updateMetrics();
  };

  var updateMetrics = function() {
    var conversion = 0, sales = 0, calls = 0, revenue = 0, bonus = 0, incentivesLength = 0, tenure = 0, nextBonus = 0, nextIndex = 0, nextBracket = 0, maxBonus = 0, maxBracket = 0, salesNumbers = [];

    // Sums the total revenue of sales
    angular.forEach($scope.salesCollection, function(sale, key) { revenue += sale.revenue; });

    // Check the highest sale number
    angular.forEach($scope.salesCollection, function(sale, key) { salesNumbers.push(sale.number); });
    sales = Math.max.apply(Math, salesNumbers);
    sales = salesNumbers.length > sales ? sales : salesNumbers.length;

    // Calculates bonus
    calls = $scope.calls;
    conversion = calls > 0 ? sales / calls : 0;
    conversion = isFinite(conversion) ? conversion : 0;

    tenure = $scope.tenure;
    incentivesLength = incentives[tenure].length;

    bonus = calculateBonus(conversion, revenue, tenure);

    nextIndex = bonus.index === -1 ? (incentivesLength - 1) : bonus.index === 0 ? 0 : bonus.index - 1;
    nextBonus = calculateBonus(conversion, revenue, tenure, nextIndex);
    nextBracket = incentives[tenure][nextIndex][0];

    maxBonus = calculateBonus(conversion, revenue, tenure, 0);
    maxBracket = incentives[tenure][0][0];

    // Changes alert
    var alertClass = calls > 0 ? conversion >= 0.5 ? "success" : conversion >= 0.4 ? "warning" : "danger" : "info",
        randomMessage = Math.floor(Math.random() * messages[alertClass].length);

    $scope.alertClass = alertClass;
    $scope.alertMessage = messages[alertClass][randomMessage];

    // Sends the information back to the view
    $scope.conversion = conversion;
    $scope.sales = isFinite(sales) ? sales : 0;
    $scope.revenue = revenue;

    $scope.saleNumber = isFinite(sales) ? sales + 1 : 1;

    $scope.bonus = bonus.bonus;
    $scope.nextBracket = nextBracket;
    $scope.nextBonus = nextBonus.bonus;
    $scope.maxBracket = maxBracket;
    $scope.maxBonus = maxBonus.bonus;

  };

  // Calculates bonus based on conversion rate, revenue and tenure
  var calculateBonus = function (conversion, revenue, tenure, index) {

    if( !isFinite(conversion) ) { return { bonus: 0, index: -1 }; }

    var structure = incentives[tenure], bonus = 0, idx = -1;

    if(index === undefined) {
      angular.forEach(structure, function(value, key) {
        if(conversion>=value[0] && idx === -1) {
          bonus = revenue * value[1];
          idx = key;
        }
      });
    }
    else {
      bonus = revenue * structure[index][1];
    }

    return { bonus: bonus, index: idx };
  };

  // Watches for changes
  $scope.$watchGroup(['calls', 'tenure'], function(newValues, oldValues, scope) {
    updateMetrics();
  });

  // Initializes data
  $scope.currency = currency;
  $scope.tenure = "above60";
  $scope.calls = 0;

  updateMetrics();

});
