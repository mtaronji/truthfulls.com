//list of all states where you cause a plotting event in the interface.
//callback function is the instructions you do when being asked to plot.

import * as Plotly from "plotly.js"


    interface IChartState {
        requestCrossAssetData: boolean;
        requestNewPriceData: boolean;
        crossAssetHasBeenSelected: boolean;
        crossAssetTicker: string;
        selectedTicker: string;
        selectedDuration: number;
        callBackPlot: (state: IChartState) => void;
        chartAreaID: {};
        isWeekly: boolean;
        isDaily: boolean;
    }

    class LoadingDurationState implements IChartState {
        constructor(selected: boolean) {
            this.crossAssetHasBeenSelected = selected;
            this.requestCrossAssetData = selected;
        }
        crossAssetHasBeenSelected: boolean;
        requestCrossAssetData: boolean;
        requestNewPriceData: boolean = true;
        crossAssetTicker: string;
        selectedTicker: string;
        selectedDuration: number;
        callBackPlot = loadingDurationCallback;
        chartAreaID: {};
        isWeekly: boolean;
        isDaily: boolean;
    }

    class ChartPricesState implements IChartState {
        onLoad: boolean = false;
        requestCrossAssetData: boolean = false;
        requestNewPriceData: boolean = true;
        crossAssetHasBeenSelected: boolean = false;
        crossAssetTicker: string;
        selectedTicker: string;
        selectedDuration: number;
        callBackPlot = chartPriceCallback;
        chartAreaID: {};
        isWeekly: boolean;
        isDaily: boolean;
    }

    class ChartGainsDistState implements IChartState {
        requestCrossAssetData: boolean = false;
        requestNewPriceData: boolean;
        crossAssetHasBeenSelected: boolean;
        crossAssetTicker: string;
        selectedTicker: string;
        selectedDuration: number;
        callBackPlot = chartgainsDistCallback;
        chartAreaID: {};
        isWeekly: boolean;
        isDaily: boolean;
    }
    class ChartCrossAssetState implements IChartState {
        requestCrossAssetData: boolean;
        requestNewPriceData: boolean;
        crossAssetHasBeenSelected: boolean;
        crossAssetTicker: string;
        selectedTicker: string;
        selectedDuration: number;
        callBackPlot = chartCrossAssetCallback;
        chartAreaID: {};
        isWeekly: boolean;
        isDaily: boolean;
    }
    //when a chart button is clicked.
    class ChartingContext {
        ids: { 'form-ticker-search', "crossasset-form" }

        currentState: IChartState;
        crossAssetData: {};
        priceData: {};

        static _instance: ChartingContext;
        constructor(chartState: IChartState) {
            this.currentState = chartState;
        }

        setChartState(newstate: IChartState) {
            this.currentState = newstate;
        }

        plot() {
            this.currentState.callBackPlot;
        }
    }


    //callback instructions for plot event given the state

    function chartPriceCallback(state: ChartPricesState) {

        //request data
        //input new data
        //plotchart
        //shift control back to the interface
        let data = RequestNewStockData(state.selectedTicker, state.selectedDuration);
        PlotPriceHistory(data, state);
    }

    function chartgainsDistCallback(state: IChartState) {

    }

    function loadingDurationCallback(state: IChartState) {

    }

    function chartCrossAssetCallback(state: IChartState) {

    }
    //--------------------------------------------------------------
    //helper functions
    //pull data from our web api
    function RequestNewStockData(ticker: string, duration: number) {

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                return JSON.parse(this.responseText);
            }
        };
        xhttp.open("GET", `/ticker/${ticker}/${duration}`, false);
        xhttp.send();
    }

    function PlotPriceHistory(data, state: ChartPricesState) {
        //config chart settings here
        let layout = {};
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
                title: `${state.selectedTicker} -Weekly Prices`
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
                title: `${state.selectedTicker} -Daily Prices`,

            };
        }

        var config = { responsive: true, displayModeBar: false }

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


  

