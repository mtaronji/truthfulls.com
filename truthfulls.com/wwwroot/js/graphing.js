//clicking a chart puts the charting in stats
var LoadingDurationState = /** @class */ (function () {
    function LoadingDurationState(selected) {
        this.requestNewPriceData = true;
        this.crossAssetHasBeenSelected = selected;
        this.requestCrossAssetData = selected;
    }
    return LoadingDurationState;
}());
var ChartPricesState = /** @class */ (function () {
    function ChartPricesState() {
        this.requestCrossAssetData = false;
        this.requestNewPriceData = true;
        this.crossAssetHasBeenSelected = false;
    }
    return ChartPricesState;
}());
var ChartGainsDistState = /** @class */ (function () {
    function ChartGainsDistState() {
        this.requestCrossAssetData = false;
    }
    return ChartGainsDistState;
}());
var ChartCrossAssetState = /** @class */ (function () {
    function ChartCrossAssetState() {
    }
    return ChartCrossAssetState;
}());
//when a chart button is clicked.
var ChartingContext = /** @class */ (function () {
    function ChartingContext(chartState) {
        this.currentState = chartState;
    }
    ChartingContext.prototype.setChartState = function (newstate) {
        this.currentState = newstate;
    };
    ChartingContext.prototype.clickCrossAssetClicked = function () {
        //do the following after requesting A cross Asset compare
        //request cross asset data based on the ticker
    };
    ChartingContext.prototype.clickGainsDistrCLicked = function () {
        //do the following after gains Dist is clicked
    };
    ChartingContext.prototype.requestPricesClicked = function () {
        //do the following after requested Prices is clicked
    };
    ChartingContext.prototype.DurationSwitched = function () {
        //do the following after a duration switch
    };
    ChartingContext.prototype.CoVarianceClicked = function () {
        //do the following after requesting a
    };
    ChartingContext.prototype.turnOffCrossAssetModal = function () {
        //turn off the popup
    };
    ChartingContext.prototype.turnOnCrossAssetPopup = function () {
    };
    return ChartingContext;
}());
//# sourceMappingURL=graphing.js.map