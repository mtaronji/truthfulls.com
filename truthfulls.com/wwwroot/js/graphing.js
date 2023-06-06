"use strict";
//list of all states where you cause a plotting event in the interface.
//callback function is the instructions you do when being asked to plot.
Object.defineProperty(exports, "__esModule", { value: true });
var Plotly = require("plotly.js");
var LoadingDurationState = /** @class */ (function () {
    function LoadingDurationState(selected) {
        this.requestNewPriceData = true;
        this.callBackPlot = loadingDurationCallback;
        this.crossAssetHasBeenSelected = selected;
        this.requestCrossAssetData = selected;
    }
    return LoadingDurationState;
}());
var ChartPricesState = /** @class */ (function () {
    function ChartPricesState() {
        this.onLoad = false;
        this.requestCrossAssetData = false;
        this.requestNewPriceData = true;
        this.crossAssetHasBeenSelected = false;
        this.callBackPlot = chartPriceCallback;
    }
    return ChartPricesState;
}());
var ChartGainsDistState = /** @class */ (function () {
    function ChartGainsDistState() {
        this.requestCrossAssetData = false;
        this.callBackPlot = chartgainsDistCallback;
    }
    return ChartGainsDistState;
}());
var ChartCrossAssetState = /** @class */ (function () {
    function ChartCrossAssetState() {
        this.callBackPlot = chartCrossAssetCallback;
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
    ChartingContext.prototype.plot = function () {
        this.currentState.callBackPlot;
    };
    return ChartingContext;
}());
//callback instructions for plot event given the state
function chartPriceCallback(state) {
    //request data
    //input new data
    //plotchart
    //shift control back to the interface
    var data = RequestNewStockData(state.selectedTicker, state.selectedDuration);
    PlotPriceHistory(data, state);
}
function chartgainsDistCallback(state) {
}
function loadingDurationCallback(state) {
}
function chartCrossAssetCallback(state) {
}
//--------------------------------------------------------------
//helper functions
//pull data from our web api
function RequestNewStockData(ticker, duration) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            return JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", "/ticker/".concat(ticker, "/").concat(duration), false);
    xhttp.send();
}
function PlotPriceHistory(data, state) {
    //config chart settings here
    var layout = {};
    if (state.isWeekly) {
        data = [{
                x: data["dailyprices"]["date"],
                close: data["dailyprices"]["close"],
                decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
                high: data["dailyprices"]["high"],
                inceasing: { line: { color: '#17BECF' } },
                line: { color: 'rgba(31,119,180,1)' },
                open: data["dailyprices"]["open"],
                low: data["dailyprices"]["low"],
                type: 'ohlc',
                xaxis: 'x',
                yaxis: 'y'
            }];
        // Define Layout
        layout =
            {
                showlegend: false,
                xaxis: {
                    title: 'Dates',
                    type: 'date',
                    rangeslider: { visible: false }
                },
                yaxis: {
                    type: 'linear'
                },
                title: "".concat(state.selectedTicker, " -Weekly Prices")
            };
    }
    else if (state.isDaily) {
        data = [{
                x: data["weeklyData"]["date"],
                close: data["weeklyData"]["close"],
                decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
                high: data["weeklyData"]["high"],
                inceasing: { line: { color: '#17BECF' } },
                line: { color: 'rgba(31,119,180,1)' },
                open: data["weeklyData"]["open"],
                low: data["weeklyData"]["low"],
                type: 'ohlc',
                xaxis: 'x',
                yaxis: 'y'
            }];
        layout =
            {
                showlegend: false,
                xaxis: {
                    title: 'Dates',
                    type: 'date',
                    rangeslider: { visible: false }
                },
                yaxis: {
                    type: 'linear',
                    title: 'Prices'
                },
                title: "".concat(state.selectedTicker, " -Daily Prices"),
            };
    }
    var config = { responsive: true, displayModeBar: false };
    Plotly.newPlot(state.chartAreaID, data, layout, config);
}
function SetNewPriceData(jsondata) {
    ////zero data then repopulate
    //truthfullsApp.events.zeroData();
    //let dailyData = jsondata["dailyprices"];
    //let weeklyData = jsondata["weeklyprices"];
    //let dailyGData = jsondata["dailygains"];
    //let WeeklyGData = jsondata["weeklygains"];
    //let focus = jsondata["selectedchart"];
    ////if we are here to fill the cross asset data, fit it and then leave
    //if (truthfullsApp.state.loadingCrossAsset == true) {
    //    for (let i = 0; i < dailyData.length; i++) {
    //        truthfullsApp.data.dDatesX.push(dailyData[i]["date"]);
    //        truthfullsApp.data.dCloseX.push(dailyData[i]["close"]);
    //        truthfullsApp.data.dHighsX.push(dailyData[i]["high"]);
    //        truthfullsApp.data.dLowsX.push(dailyData[i]["low"]);
    //        truthfullsApp.data.dOpensX.push(dailyData[i]["open"]);
    //    }
    //    //relead the weekly data
    //    for (let i = 0; i < weeklyData.length; i++) {
    //        truthfullsApp.data.wDatesX.push(weeklyData[i]["weekEnd"]);
    //        truthfullsApp.data.wClosesX.push(weeklyData[i]["close"]);
    //        truthfullsApp.data.wHighsX.push(weeklyData[i]["high"]);
    //        truthfullsApp.data.wLowsX.push(weeklyData[i]["low"]);
    //        truthfullsApp.data.wOpensX.push(weeklyData[i]["open"]);
    //    }
    //    //reload the daily gain data
    //    for (let i = 0; i < dailyGData.length; i++) {
    //        truthfullsApp.data.dGainsX.push(dailyGData[i]["gain"]);
    //    }
    //    //reload the weekly gain data
    //    for (let i = 0; i < WeeklyGData.length; i++) {
    //        truthfullsApp.data.wGainsX.push(WeeklyGData[i]["gain"]);
    //    }
    //    return;
    //}
    //else {
    //    for (let i = 0; i < dailyData.length; i++) {
    //        truthfullsApp.data.dDates.push(dailyData[i]["date"]);
    //        truthfullsApp.data.dClose.push(dailyData[i]["close"]);
    //        truthfullsApp.data.dHighs.push(dailyData[i]["high"]);
    //        truthfullsApp.data.dLows.push(dailyData[i]["low"]);
    //        truthfullsApp.data.dOpens.push(dailyData[i]["open"]);
    //    }
    //    //relead the weekly data
    //    for (let i = 0; i < weeklyData.length; i++) {
    //        truthfullsApp.data.wDates.push(weeklyData[i]["weekEnd"]);
    //        truthfullsApp.data.wCloses.push(weeklyData[i]["close"]);
    //        truthfullsApp.data.wHighs.push(weeklyData[i]["high"]);
    //        truthfullsApp.data.wLows.push(weeklyData[i]["low"]);
    //        truthfullsApp.data.wOpens.push(weeklyData[i]["open"]);
    //    }
    //    //reload the daily gain data
    //    for (let i = 0; i < dailyGData.length; i++) {
    //        truthfullsApp.data.dGains.push(dailyGData[i]["gain"]);
    //    }
    //    //reload the weekly gain data
    //    for (let i = 0; i < WeeklyGData.length; i++) {
    //        truthfullsApp.data.wGains.push(WeeklyGData[i]["gain"]);
    //    }
    //}
    //readload the daily data
}
//# sourceMappingURL=graphing.js.map