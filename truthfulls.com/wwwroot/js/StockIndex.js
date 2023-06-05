
/// <reference path="../lib/Plotly/plotly.js" />

var truthfullsApp = {

    //intialize the app
    init: initializeApp,

    config: {
    },
    settings: {

    },

    data: {
        setNewPriceData: onSetNewPriceData,
        loadDataList: onLoadDataList,
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
        tickers: [],

        //cross asset variables data should be the same duration
        dDatesX: [],
        dCloseX: [],
        dHighsX: [],
        dLowsX: [],
        dOpensX: [],

        wDatesX: [],
        wClosesX: [],
        wHighsX: [],
        wLowsX: [],
        wOpensX: [],

        dGainsX: [],
        wGainsX: []
    },
    neededIds: {
        tickerInput: {},
        durationInput: {}
    },
    state: {
        TimeFrame: { Daily: 1, Weekly: 2, Monthly: 3, Quarterly: 4, Yearly: 5 },
        ChartFocus: { Gains: 1, CrossAsset: 2, PriceChart: 3 },
        selectedTicker: {},
        currentChartFocus: {},
        chartTabSelected: {},
        selectedTimeFrame: {},
        selectedDuration: {},
        loadingCrossAsset: false,
        crossAssetTicker: {},
        crossAssetLoaded: false,
        changingDuration: true,
        requestNewCrossAsset: false,
    },

    events:
    {
        //events related to the form
        //___________________________
        //when ticker search button detects no more typing, check for erros
        keyUpTickerSearchTxt: onKeyUpTickerSearchTxt,

        //validate ticker input before the form is submitted
        validateStockSearchFormSubmit: onValidateStockSearchForm,

        //_____________________________End form events

        //chart actions
        zeroData: onZeroData,
        plotData: onPlotData,
        plotPrices: onPlotPriceHistory,
        plotGainsDistribution: onPlotGainsDistribution,
        plotCorrScatterPlot: onPlotCorrScatterPlot,
        requestNewStockData: onRequestNewStockData,


        //chart tab events
        openTab: onOpentab,
        loadStatsTab: onLoadStatsTab,
        loadFundiesTab: onLoadFundiesTab,
        closeCrossAssetForm,
        loadChartTab: onLoadChartTab,

        searchCrossAssetCompare : onSearchCrossAssetCompare,
        //time duration of chart data events
        durationSlct: onDurationSlct,
        setDuration: setSelectedDuration,

        //time type (weekly, daily) events
        timeFrameSelect: onHandleRadioSelect,
        getSelectedTimeFrame: onGetSelectedRadioValue,
        setSelectedTimeFrame: onSetSelectedRadioValue,

        closePopup : onClosePopup
    },
    eventListers:
    {

    }
};

function initializeApp() {

    //set default values for some inputs
    truthfullsApp.events.setSelectedTimeFrame(truthfullsApp.state.selectedTimeFrame);
    truthfullsApp.events.setDuration(truthfullsApp.state.selectedDuration);
    truthfullsApp.events.loadChartTab();
    truthfullsApp.data.loadDataList(); 
}

function onLoadDataList() {
    e = document.querySelector("#tickers-datalist");
    for (let i = 0; i < truthfullsApp.data.tickers.length; i++) {
        var t = truthfullsApp.data.tickers[i];
        e.innerHTML += `<option>${t}</option>`;
    }
}
function onKeyUpTickerSearchTxt(event) {
    /* Only one validation lbl should be in our form controls*/
    let validationlabel = document.getElementById(event.id).parentNode.getElementsByClassName("validation-lbl")[0];

    var tickers = truthfullsApp.data.tickers;
    input = event.value.trim().toUpperCase();

    if (tickers.includes(input)) {
        validationlabel.innerHTML = "";
    }
    else {
       //print validation message on label
        validationlabel.innerHTML = "Ticker is not available";
    } 
}



function onValidateStockSearchForm(event) {

    let formid = document.getElementById(event.id);
    let input = formid.getElementsByClassName("ticker-input-txt")[0].value.trim().toUpperCase();
    let validationlabel = formid.parentNode.getElementsByClassName("validation-lbl")[0];

    if (event.id == 'form-ticker-search') {
        truthfullsApp.state.currentChartFocus = truthfullsApp.state.ChartFocus;
    }
    else {

    }
    
    if (truthfullsApp.data.tickers.includes(input)) {
        validationlabel.innerHTML = "";

        if (truthfullsApp.state.currentChartFocus == truthfullsApp.state.ChartFocus.CrossAsset) {
            truthfullsApp.state.crossAssetTicker = input;
            truthfullsApp.state.loadingCrossAsset = true;
            onRequestNewStockData();
            truthfullsApp.events.plotData();
            return false; 
        }
        else {
            truthfullsApp.state.selectedTicker = input;
        }

        return true;
    }
    else {
        //print validation message on label
        validationlabel.innerHTML = "Ticker is not available <br>";
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
     let currentFocus = truthfullsApp.state.currentChartFocus;

     if (currentFocus == truthfullsApp.state.ChartFocus.PriceChart) {
         truthfullsApp.events.plotPrices();
    }
     else if (currentFocus == truthfullsApp.state.ChartFocus.Gains) {
         truthfullsApp.events.plotGainsDistribution();
    }
     else if (currentFocus == truthfullsApp.state.ChartFocus.CrossAsset) {
         onPlotCorrScatterPlot();
         closeCrossAssetForm();
    }   
}

function onPlotPriceHistory() {
    let currentState = truthfullsApp.state;
    let selectedTicker = currentState.selectedTicker;
    let isDaily = (currentState.selectedTimeFrame == currentState.TimeFrame.Daily);
    let isWeekly = (truthfullsApp.state.selectedTimeFrame == currentState.TimeFrame.Weekly);

    let datalocation = truthfullsApp.data;
    let data = [];

    if (isWeekly) {

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
                type: 'date',
                rangeslider: { visible: false }
            },
            yaxis: {

                type: 'linear'
            },
            title: `${selectedTicker} -Weekly Prices`
        };
    }

    else if (isDaily) {

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
                rangeslider: { visible: false }
            },
            yaxis: {

                type: 'linear',
                title: 'Prices'
            },
            title: `${selectedTicker} -Daily Prices`,

        };
    }

    var config = { responsive: true, displayModeBar: false }

    Plotly.newPlot('chart-area', data, layout, config);
}


function onPlotGainsDistribution() {

    let currentState = truthfullsApp.state;
    let selectedTicker = currentState.selectedTicker;
    let isDaily = (currentState.selectedTimeFrame == currentState.TimeFrame.Daily);
    let isWeekly = (truthfullsApp.state.selectedTimeFrame == currentState.TimeFrame.Weekly);

    let data = []
    let title = {};
    var datalocation = truthfullsApp.data;
    if (isDaily) {
        for (let i = 0; i < datalocation.dGains.length; i++) {
            data[i] = datalocation.dGains[i] * 100.00;
        }
        title = `${selectedTicker} -Daily Gains Distribution`;
    }
    else if (isWeekly) {
        for (let i = 0; i < datalocation.wGains.length; i++) {
            data[i] = datalocation.wGains[i] * 100.00;
            title = `${selectedTicker} -Weekly Gains Distribution`;
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

function onPlotCorrScatterPlot() {      
   
    let dataspace = truthfullsApp.data;
    let timeframe = truthfullsApp.state.selectedTimeFrame;
    let tracet1 = [];
    let tracet2 = [];
    let d = [];

    var pl_colorscale = [
        [0.0, '#19d3f3'],
        [0.333, '#19d3f3'],
        [0.333, '#e763fa'],
        [0.666, '#e763fa'],
        [0.666, '#636efa'],
        [1, '#636efa']
    ]

  
    var config = { responsive: true, displayModeBar: false };

    if (timeframe == truthfullsApp.state.TimeFrame.Daily) {

        d = [{
            
            mode: 'markers',
            type: 'scatter',
            x: dataspace.dGains,
            y: dataspace.dGainsX,
            color: 'rgb(218, 165, 32)',
            marker: {
                color: 'rgb(218,165,32)',
                size: 4,
            }
        }]


    }

    else if (timeframe == truthfullsApp.state.TimeFrame.Weekly) {
        d = [{

            mode: 'markers',
            type: 'scatter',
            x:dataspace.dGains, 
            y: dataspace.dGainsX,
            marker: {
                color: 'rgb(218,165,32)',
                size: 4,
            }
        }]
    }

    var layout = {
        title: `Correlation Data - ${truthfullsApp.state.selectedTicker} vs ${truthfullsApp.state.crossAssetTicker}`,
        xaxis: {
            title: {
                text:`${truthfullsApp.state.selectedTicker}`
            }
        },
        yaxis: {
            title: {
                text: `${truthfullsApp.state.crossAssetTicker}`
            }
        },
        autosize: true,
        hovermode: 'closest',
        dragmode: 'select'
    }
    Plotly.newPlot('chart-area', d, layout, config);
}

function closeCrossAssetForm() {

    truthfullsApp.state.loadingCrossAsset = false;
    truthfullsApp.state.crossAssetLoaded = true;
    e = document.getElementById("crossasset-form");
    e.style.display = "none"; e.style.visibility = 'hidden';
}

function onOpentab(tabname) {
    //tab logic. Handle the switches between tabs here

    switch (tabname.id) {
        case "btn-stats":
            truthfullsApp.events.loadStatsTab();
            break;
        case "btn-fundies":
            truthfullsApp.events.loadFundiesTab();
            break;
        case "btn-chart":
            truthfullsApp.events.loadChartTab();
            break;
    }

    //return false to prevent the pop up screen from showing if cross asset is loaded and the cross asset tab is in focus
}

function onLoadStatsTab() {
    truthfullsApp.state.currentChartFocus = truthfullsApp.state.ChartFocus.Gains;

    document.querySelector("#btn-stats").style.color = "silver";
    document.querySelector("#btn-fundies").style.color = "black";
    document.querySelector("#btn-chart").style.color = "black";

    truthfullsApp.events.plotData();
    window.dispatchEvent(new Event('resize'));
}

function onLoadFundiesTab() {
    truthfullsApp.state.currentChartFocus = truthfullsApp.state.ChartFocus.CrossAsset;

    document.querySelector("#btn-fundies").style.color = "silver";
    document.querySelector("#btn-chart").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";

    if (truthfullsApp.state.crossAssetLoaded == true) {
        document.getElementById("crossasset-form")
        truthfullsApp.events.plotData();
    }

    window.dispatchEvent(new Event('resize'));
}

function onLoadChartTab() {
    truthfullsApp.state.currentChartFocus = truthfullsApp.state.ChartFocus.PriceChart;

    document.querySelector("#btn-chart").style.color = "silver";
    document.querySelector("#btn-fundies").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";

    truthfullsApp.events.plotData();

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

    //configure state
    truthfullsApp.state.changingDuration = true;
    truthfullsApp.state.currentChartFocus = truthfullsApp.state.ChartFocus.PriceChart;
    truthfullsApp.state.selectedDuration = duration;

    if (truthfullsApp.data.tickers.includes(truthfullsApp.state.crossAssetTicker)) {
        truthfullsApp.state.loadingCrossAsset = true;
    }

    //if we have cross asset data selected load new time range for the cross asset
    if (truthfullsApp.state.loadingCrossAsset == true) {
        truthfullsApp.events.requestNewStockData();
        truthfullsApp.state.loadingCrossAsset = false;
    }
    truthfullsApp.events.requestNewStockData();
    truthfullsApp.events.plotData();

    truthfullsApp.events.loadChartTab();

}

function onRequestNewStockData() {
    let ticker;
    if (truthfullsApp.state.loadingCrossAsset == true) {
        ticker = truthfullsApp.state.crossAssetTicker;
    }
    else {
        ticker = truthfullsApp.state.selectedTicker;
    }

    let duration = truthfullsApp.state.selectedDuration;
    focus = truthfullsApp.state.currentChartFocus;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            truthfullsApp.data.setNewPriceData(JSON.parse(this.responseText));
        }
    };

    xhttp.open("GET", `/ticker/${ticker}/${duration}/${focus}`, false);
    xhttp.send();  

}
function setSelectedDuration() {
    truthfullsApp.state.changingDuration = true;
    var duration = truthfullsApp.state.selectedDuration;
    document.querySelector("#ticker-search-duration-slct").value = duration;
    let e = document.getElementById("btn-chart"); e.click();
}

//ACCEPTS JSON data
function onSetNewPriceData(jsondata) {


    //zero data then repopulate
    truthfullsApp.events.zeroData();

    let dailyData = jsondata["dailyprices"];
    let weeklyData = jsondata["weeklyprices"];
    let dailyGData = jsondata["dailygains"];
    let WeeklyGData = jsondata["weeklygains"];
    let focus = jsondata["selectedchart"];

    //if we are here to fill the cross asset data, fit it and then leave
    if (truthfullsApp.state.loadingCrossAsset == true) {

        for (let i = 0; i < dailyData.length; i++) {
            truthfullsApp.data.dDatesX.push(dailyData[i]["date"]);
            truthfullsApp.data.dCloseX.push(dailyData[i]["close"]);
            truthfullsApp.data.dHighsX.push(dailyData[i]["high"]);
            truthfullsApp.data.dLowsX.push(dailyData[i]["low"]);
            truthfullsApp.data.dOpensX.push(dailyData[i]["open"]);
        }

        //relead the weekly data

        for (let i = 0; i < weeklyData.length; i++) {
            truthfullsApp.data.wDatesX.push(weeklyData[i]["weekEnd"]);
            truthfullsApp.data.wClosesX.push(weeklyData[i]["close"]);
            truthfullsApp.data.wHighsX.push(weeklyData[i]["high"]);
            truthfullsApp.data.wLowsX.push(weeklyData[i]["low"]);
            truthfullsApp.data.wOpensX.push(weeklyData[i]["open"]);
        }

        //reload the daily gain data
        for (let i = 0; i < dailyGData.length; i++) {
            truthfullsApp.data.dGainsX.push(dailyGData[i]["gain"]);
        }

        //reload the weekly gain data
        for (let i = 0; i < WeeklyGData.length; i++) {
            truthfullsApp.data.wGainsX.push(WeeklyGData[i]["gain"]);
        }

        return;
    }
    else {
        for (let i = 0; i < dailyData.length; i++) {
            truthfullsApp.data.dDates.push(dailyData[i]["date"]);
            truthfullsApp.data.dClose.push(dailyData[i]["close"]);
            truthfullsApp.data.dHighs.push(dailyData[i]["high"]);
            truthfullsApp.data.dLows.push(dailyData[i]["low"]);
            truthfullsApp.data.dOpens.push(dailyData[i]["open"]);
        }

        //relead the weekly data

        for (let i = 0; i < weeklyData.length; i++) {
            truthfullsApp.data.wDates.push(weeklyData[i]["weekEnd"]);
            truthfullsApp.data.wCloses.push(weeklyData[i]["close"]);
            truthfullsApp.data.wHighs.push(weeklyData[i]["high"]);
            truthfullsApp.data.wLows.push(weeklyData[i]["low"]);
            truthfullsApp.data.wOpens.push(weeklyData[i]["open"]);
        }

        //reload the daily gain data
        for (let i = 0; i < dailyGData.length; i++) {
            truthfullsApp.data.dGains.push(dailyGData[i]["gain"]);
        }

        //reload the weekly gain data
        for (let i = 0; i < WeeklyGData.length; i++) {
            truthfullsApp.data.wGains.push(WeeklyGData[i]["gain"]);
        }
    }
    //readload the daily data
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
    truthfullsApp.state.selectedTimeFrame = truthfullsApp.events.getSelectedTimeFrame(event.value);
    truthfullsApp.events.plotData();
}

function onZeroData() {
    //if we are loading cross asset, leave the values in d the same as we will compare them.
    //otherwise delete all data as usual
    if (truthfullsApp.state.loadingCrossAsset == true) {
        truthfullsApp.data.dCloseX.length = 0; truthfullsApp.data.dDatesX.length = 0;
        truthfullsApp.data.dHighsX.length = 0; truthfullsApp.data.dLowsX.length = 0;
        truthfullsApp.data.dOpensX.length = 0; truthfullsApp.data.dGainsX.length = 0;


        truthfullsApp.data.wClosesX.length = 0; truthfullsApp.data.wDatesX.length = 0;
        truthfullsApp.data.wHighsX.length = 0; truthfullsApp.data.wLowsX.length = 0;
        truthfullsApp.data.wOpensX.length = 0; truthfullsApp.data.wGainsX.length = 0;
        return;
    }
    //if we are changing duration and have data loaded into the cross asset. keep it there. It's time range will not change as the primary ticker will.
    else if (truthfullsApp.state.changingDuration == true && truthfullsApp.data.dCloseX.length > 0) {
        truthfullsApp.data.dClose.length = 0; truthfullsApp.data.dDates.length = 0;
        truthfullsApp.data.dHighs.length = 0; truthfullsApp.data.dLows.length = 0;
        truthfullsApp.data.dOpens.length = 0; truthfullsApp.data.dGains.length = 0;


        truthfullsApp.data.wCloses.length = 0; truthfullsApp.data.wDates.length = 0;
        truthfullsApp.data.wHighs.length = 0; truthfullsApp.data.wLows.length = 0;
        truthfullsApp.data.wOpens.length = 0; truthfullsApp.data.wGains.length = 0;
    }
    else {
        truthfullsApp.data.dClose.length = 0; truthfullsApp.data.dDates.length = 0;
        truthfullsApp.data.dHighs.length = 0; truthfullsApp.data.dLows.length = 0;
        truthfullsApp.data.dOpens.length = 0; truthfullsApp.data.dGains.length = 0;


        truthfullsApp.data.wCloses.length = 0; truthfullsApp.data.wDates.length = 0;
        truthfullsApp.data.wHighs.length = 0; truthfullsApp.data.wLows.length = 0;
        truthfullsApp.data.wOpens.length = 0; truthfullsApp.data.wGains.length = 0;

        truthfullsApp.data.dCloseX.length = 0; truthfullsApp.data.dDatesX.length = 0;
        truthfullsApp.data.dHighsX.length = 0; truthfullsApp.data.dLowsX.length = 0;
        truthfullsApp.data.dOpensX.length = 0; truthfullsApp.data.dGainsX.length = 0;


        truthfullsApp.data.wClosesX.length = 0; truthfullsApp.data.wDatesX.length = 0;
        truthfullsApp.data.wHighsX.length = 0; truthfullsApp.data.wLowsX.length = 0;
        truthfullsApp.data.wOpensX.length = 0; truthfullsApp.data.wGainsX.length = 0;
    }
}

function onSearchCrossAssetCompare(event) {
    //disable the search button. we don't want to really submit to the server. We want to get the data async
    event.preventDefault();
}

function onClosePopup() {
    //click chart tag
    let e = document.getElementById("btn-chart");
    e.click();
}

