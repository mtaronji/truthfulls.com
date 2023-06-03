
/// <reference path="../lib/Plotly/plotly.js" />

truthfullsApp = {

    StockInfoPage:
    {
        //intialize the app
        init: initializeApp,
        TimeFrame: { Daily: 1, Weekly: 2, Monthly: 3, Quarterly: 4, Yearly: 5 },
        ChartFocus: { Gains: 1, CrossAsset: 2, PriceChart: 3 },
        config: {

        },
        settings: {

        },

        events: {

        },

        data: {
            setNewPriceData: onSetNewPriceData,
            dDates: [],
            dClose: [],
            dHighs: [],
            dLows: [],
            dOpens: [],

            wDates: [],
            wCloses: [],
            wHighs: [],
            wLows: [],
            wOpens: [],

            dGains: [],
            wGains: [],
            tickers:[]
        },
        neededIds: {
            tickerInput: {},
            durationInput: {}
        },
        state: {
            selectedTicker : {},
            currentChartFocus :{},
            chartTabSelected : {},
            selectedTimeFrame : {},
            selectedDuration : {}
        },

        events:
        {
            //events related to the form
            //___________________________
            //when ticker search button detects no more typing, check for erros
            keyUpTickerSearchTxt: onKeyUpTickerSearchTxt,

            //validate input before the form is submitted
            validateStockSearchFormSubmit: onValidateStockSearchForm,

            //_____________________________End form events

            //chart events
            zeroData: onZeroData,
            plotData : onPlotData,
            plotPrices : onPlotPriceHistory,
            plotGainsDistribution : onPlotGainsDistribution,
            

            //chart tab events
            openTab : onOpentab,
            loadStatsTab : onLoadStatsTab, 
            loadFundiesTab : onLoadFundiesTab,
            loadChartTab : onLoadChartTab,

            //time duration of chart data events
            durationSlct: onDurationSlct,
            setDuration: setSelectedDuration,
       
            //time type (weekly, daily) events
            timeFrameSelect : onHandleRadioSelect,
            getSelectedTimeFrame : onGetSelectedRadioValue,
            setSelectedTimeFrame: onSetSelectedRadioValue
        },
        eventListers:
        {

        }
    }
}

//make sure the page is ready for javascript.
//supposed to replicate jquery ready
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function initializeApp() {
    //set default values for some inputs
    truthfullsApp.StockInfoPage.events.setSelectedTimeFrame(truthfullsApp.StockInfoPage.state.selectedTimeFrame);
    truthfullsApp.StockInfoPage.events.setDuration(truthfullsApp.StockInfoPage.state.selectedDuration);

    for (let i = 0; i < truthfullsApp.StockInfoPage.data.tickers.length; i++) {
        var t = truthfullsApp.StockInfoPage.data.tickers[i];
        document.querySelector("#tickers-datalist").innerHTML += `<option>${t}</option>`
    }
    //insert into datalist
}
function onKeyUpTickerSearchTxt(event) {
    //check that input is good when user is done typing
    var tickers = truthfullsApp.StockInfoPage.data.tickers;
    var input = document.querySelector("#ticker-search-txt-input").value;
    input = input.trim().toUpperCase();
   
    if (tickers.includes(input)) {
        ticker = input;
        document.querySelector("#ticker-search-val-lbl").innerHTML = "";
        if(event.keyCode === 13) {
            document.querySelector("#ticker-search-btn").click();
        }
        
    }
    else {
       //print validation message on label
        document.querySelector("#ticker-search-val-lbl").innerHTML = "Ticker is not available";
    } 
}



function onValidateStockSearchForm(event){
    var tickers = truthfullsApp.StockInfoPage.data.tickers;
    //valid form input
    var input = document.querySelector("#ticker-search-txt-input").value;
    input = input.trim().toUpperCase();

    if (tickers.includes(input)) {
        truthfullsApp.StockInfoPage.st = input;
        document.querySelector("#ticker-search-val-lbl").innerHTML = "";
        return true;
    }
    else {
        //print validation message on label
        document.querySelector("#ticker-search-val-lbl").innerHTML = "Ticker is not available";
    }

    return false;
}
function onValidateTicker() {
    var tickers = truthfullsApp.StockInfoPage.data.tickers;
    //valid form input
    var input = document.querySelector("#ticker-search-txt-input").value;
    input = input.trim(); 

    if (tickers.includes(input)) {
        truthfullsApp.StockInfoPage.st = input;
        document.querySelector("#ticker-search-val-lbl").innerHTML = "";
        return true;
    }
    else {
        //print validation message on label
        document.querySelector("#ticker-search-val-lbl").innerHTML = "Ticker is not available";
    } 

    return false;  
}

//ticker is the stock selected. d is if daily time frame selected. w is if weekly timeframe selected. focus is the tab in the chart we are focused on. Default is chart tab
 function onPlotData() {
     Plotly.purge('chart-area');
     let currentFocus = truthfullsApp.StockInfoPage.state.currentChartFocus;
     let currentTicker = truthfullsApp.StockInfoPage.state.selectedTicker;
     let isDaily = (truthfullsApp.StockInfoPage.state.selectedTimeFrame == truthfullsApp.StockInfoPage.TimeFrame.Daily);
     let isWeekly = (truthfullsApp.StockInfoPage.state.selectedTimeFrame == truthfullsApp.StockInfoPage.TimeFrame.Weekly);

     if (currentFocus == truthfullsApp.StockInfoPage.ChartFocus.PriceChart) {
         truthfullsApp.StockInfoPage.events.plotPrices(currentTicker, isDaily, isWeekly);
    }
     else if (currentFocus == truthfullsApp.StockInfoPage.ChartFocus.Gains) {
         truthfullsApp.StockInfoPage.events.plotGainsDistribution(currentTicker, isDaily, isWeekly);
    }
     else if (currentFocus == truthfullsApp.StockInfoPage.ChartFocus.CrossAsset) {

    }   
}

function onPlotPriceHistory(ticker, d, w) {
    let datalocation = truthfullsApp.StockInfoPage.data;
    let data = [];

    if (w) {

        data = [{
            x: datalocation.wDates,
            close: datalocation.wCloses,
            decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
            high: datalocation.wHighs,
            inceasing: { line: { color: '#17BECF' } },
            line: { color: 'rgba(31,119,180,1)' },
            open: datalocation.wOpens,
            low: datalocation.wLows,

            type: 'ohlc',
            xaxis: 'x',
            yaxis: 'y'
        }];

        // Define Layout
        var layout =
        {
            showlegend: false,
            xaxis: {

                title: 'Dates',
                type: 'date'
            },
            yaxis: {

                type: 'linear'
            },
            title: `${ticker} -Weekly Prices`
        };
    }

    else if (d) {

        data = [{
            x: datalocation.dDates,
            close: datalocation.dClose,
            decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
            high: datalocation.dHighs,
            inceasing: { line: { color: '#17BECF' } },
            line: { color: 'rgba(31,119,180,1)' },
            open: datalocation.dOpens,
            low: datalocation.dLows,

            type: 'ohlc',
            xaxis: 'x',
            yaxis: 'y'
        }];
        var layout =
        {
            showlegend: false,
            xaxis: {

                title: 'Dates',
                type: 'date',
                rangeslider: {visible:false}
            },
            yaxis: {

                type: 'linear',
                title: 'Prices'
            },
            title: `${ticker} -Daily Prices`,
 
        };
    }
   
    var config = { responsive: true}

    Plotly.newPlot('chart-area', data, layout, config);
}

function onPlotGainsDistribution(ticker, d, w) {

    //plot a bellcurve for Gain data
    //it will be based on duration data
    let data = []
    let title
    var datalocation = truthfullsApp.StockInfoPage.data;
    if (d) {
        for (let i = 0; i < datalocation.dGains.length; i++) {
            data[i] = datalocation.dGains[i] * 100.00;
        }
        title = `${ticker} -Daily Gains Distribution`;
    }
    else if (w) {
        for (let i = 0; i < datalocation.wGains.length; i++) {
            data[i] = datalocation.wGains[i] * 100.00;
            title = `${ticker} -Weekly Gains Distribution`;
        }
    }

    var trace = [
        {
            x: data,
            type: 'histogram',
            histnorm: 'count',
            marker: {
                color: "rgba(255, 100, 102, 0.7)",
                line: {
                    color: "rgba(255, 100, 102, 1)",
                    width: 1
                }
            }
        }]

    var layout =
    {
        title: title,
        xaxis:
        {
            title: "Percent Gains"
        },
        yaxis:
        {
            title: "Number of Occurences"
        }
    };
    
    var config = { responsive: true, displayModeBar: false };
    Plotly.newPlot('chart-area', trace, layout, config);
}
function onOpentab(tabname) {
    //tab logic. Handle the switches between tabs here

    switch (tabname.id) {
        case "btn-stats":
            truthfullsApp.StockInfoPage.events.loadStatsTab();
            break;
        case "btn-fundies":
            truthfullsApp.StockInfoPage.events.loadFundiesTab();
            break;
        case "btn-chart":
            truthfullsApp.StockInfoPage.events.loadChartTab();
            break;
    }
}

function onLoadStatsTab() {
    truthfullsApp.StockInfoPage.state.currentChartFocus = truthfullsApp.StockInfoPage.ChartFocus.Gains;

    document.querySelector("#btn-stats").style.color = "silver";
    document.querySelector("#btn-fundies").style.color = "black";
    document.querySelector("#btn-chart").style.color = "black";

    truthfullsApp.StockInfoPage.events.plotData();
    window.dispatchEvent(new Event('resize'));
}

function onLoadFundiesTab() {
    truthfullsApp.StockInfoPage.state.currentChartFocus = truthfullsApp.StockInfoPage.ChartFocus.CrossAsset;

    document.querySelector("#btn-fundies").style.color = "silver";
    document.querySelector("#btn-chart").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";

    truthfullsApp.StockInfoPage.events.plotData();
    window.dispatchEvent(new Event('resize'));
}

function onLoadChartTab() {
    truthfullsApp.StockInfoPage.state.currentChartFocus = truthfullsApp.StockInfoPage.ChartFocus.PriceChart;

    document.querySelector("#btn-chart").style.Color = "silver";
    document.querySelector("#btn-fundies").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";

    truthfullsApp.StockInfoPage.events.plotData();

    //if window was resized while tab wasn't focused on the graph, the graph didn't resize. Manually trigger resize event to reddraw python graph
    window.dispatchEvent(new Event('resize'));
}

function onDurationSlct(event) {
    //send async request for the new data based on the duration check.
    //Update all page data dependent on the time duration
    //check for Max selected by parsing the event value into int. If it's not a value, return duration of 500'

    let duration = 2;
    const parsed = parseInt(event.value);
    if (isNaN(parsed)) { duration = 500; } else { duration = parsed; }
    truthfullsApp.StockInfoPage.state.selectedDuration = duration;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            //reload the new data and plot the chart again
            truthfullsApp.StockInfoPage.data.setNewPriceData(JSON.parse(this.responseText));
            truthfullsApp.StockInfoPage.events.plotData();
        }
        
    };
    let ticker = truthfullsApp.StockInfoPage.state.selectedTicker;
    xhttp.open("GET", `/ticker/${ticker}/${duration}`, true);
    xhttp.send();  
}

function setSelectedDuration() {
    var duration = truthfullsApp.StockInfoPage.state.selectedDuration;
    document.querySelector("#ticker-search-duration-slct").value = duration;
}

//ACCEPTS JSON data
function onSetNewPriceData(data) {

    //zero data then repopulate
    truthfullsApp.StockInfoPage.events.zeroData();

    let dailyData = data["dailyprices"];
    let weeklyData = data["weeklyprices"];
    let dailyGData = data["dailygains"];
    let WeeklyGData = data["weeklygains"];


    //readload the daily data

    for (let i = 0; i < dailyData.length; i++) {
        truthfullsApp.StockInfoPage.data.dDates.push(dailyData[i]["date"]); 
        truthfullsApp.StockInfoPage.data.dClose.push(dailyData[i]["close"]);
        truthfullsApp.StockInfoPage.data.dHighs.push(dailyData[i]["high"]);
        truthfullsApp.StockInfoPage.data.dLows.push(dailyData[i]["low"]);
        truthfullsApp.StockInfoPage.data.dOpens.push(dailyData[i]["open"]);
    }

    //relead the weekly data

    for (let i = 0; i < weeklyData.length; i++) {
        truthfullsApp.StockInfoPage.data.wDates.push(weeklyData[i]["weekEnd"]);
        truthfullsApp.StockInfoPage.data.wCloses.push(weeklyData[i]["close"]);
        truthfullsApp.StockInfoPage.data.wHighs.push(weeklyData[i]["high"]);
        truthfullsApp.StockInfoPage.data.wLows.push(weeklyData[i]["low"]);
        truthfullsApp.StockInfoPage.data.wOpens.push(weeklyData[i]["open"]);
    }

    //reload the daily gain data
    for (let i = 0; i < dailyGData.length; i++) {
        truthfullsApp.StockInfoPage.data.dGains.push(dailyGData[i]["gain"]);
    }

    //reload the weekly gain data
    for (let i = 0; i < WeeklyGData.length; i++) {
        truthfullsApp.StockInfoPage.data.wGains.push(WeeklyGData[i]["gain"]);
    }
}

function onGetSelectedRadioValue() {
    var radios = document.getElementsByName('timeframe');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;

            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

function onSetSelectedRadioValue(timeframe) {
    var radios = document.getElementsByName('timeframe');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].value == timeframe) {
            radios[i].checked = true;

            break;
        }       
    }
}

function onHandleRadioSelect(event) {
    truthfullsApp.StockInfoPage.state.selectedTimeFrame = truthfullsApp.StockInfoPage.events.getSelectedTimeFrame(event.value);
    truthfullsApp.StockInfoPage.events.plotData();
}

function onZeroData() {
    truthfullsApp.StockInfoPage.data.dClose.length = 0; truthfullsApp.StockInfoPage.data.dDates.length = 0;
    truthfullsApp.StockInfoPage.data.dHighs.length = 0; truthfullsApp.StockInfoPage.data.dLows.length = 0;
    truthfullsApp.StockInfoPage.data.dOpens.length = 0; truthfullsApp.StockInfoPage.data.dGains.length = 0;


    truthfullsApp.StockInfoPage.data.wCloses.length = 0; truthfullsApp.StockInfoPage.data.wDates.length = 0;
    truthfullsApp.StockInfoPage.data.wHighs.length = 0; truthfullsApp.StockInfoPage.data.wLows.length = 0;
    truthfullsApp.StockInfoPage.data.wOpens.length = 0; truthfullsApp.StockInfoPage.data.wGains.length = 0;
}

