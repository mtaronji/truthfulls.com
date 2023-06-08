
export class IState{
    isweekly;
    isdaily;
    duration;
    datastore;
    selectedticker;
    crossassetticker;
    CrossAssetLoaded;
    updatepricedata;
    updatepricedatax;
    callback;

    constructor() {

    }
    setState = function (state) {
        this.isweekly = state.isweekly;
        this.isdaily = state.isdaily;
        this.duration = state.duration;
        this.datastore = state.datastore;
        this.selectedticker = state.selectedticker;
        this.CrossAssetLoaded = state.CrossAssetLoaded;
        this.crossassetticker = state.crossassetticker;
    }

    setStore = function (store) {
        this.isweekly = store["isweekly"];
        this.isdaily = store["isdaily"];
        this.duration = store["duration"];
        this.datastore = store;
        this.selectedticker = store["selectedticker"];
        this.CrossAssetLoaded = false;
        this.crossassetticker = store.crossassetticker;
        
    }
}
export class InitialState extends IState{
    constructor(store) {
        super();
        this.setStore(store);
        this.callback = PlotPriceHistory;
    }
};
export class PriceChartState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotPriceHistory;
    }
};
export class GainsDistState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotGainsDistribution;
    }
};

export class LoadTimeFrameState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotPriceHistory;
    }
}
export class LoadCrossAsset extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotCorrScatterPlot;
        this.CrossAssetLoaded = true;
    }
}
export var ChartContext = function (Cstate) {

    let _state = Cstate;
    this.Plot = function () {
        _state.callback(_state);
    }
    this.SetState = function (state) {
        _state = state;
    }
    this.UpdateData = function () {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let temp = JSON.parse(this.responseText);
                _state.datastore["weeklyprices"] = temp["weeklyprices"];
                _state.datastore["dailyprices"] = temp["dailyprices"];
                _state.datastore["dailygains"] = temp["dailygains"];
                _state.datastore["weeklygains"] = temp["weeklygains"];

            }
        };
        xhttp.open("GET", "/ticker/".concat(_state.selectedticker, "/").concat(_state.duration), false);
        xhttp.send();
    }

    this.UpdateDataX = function () {
        if (!_state.CrossAssetLoaded) { return; }
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let temp = JSON.parse(this.responseText);
                _state.datastore["weeklypricesX"] = temp["weeklyprices"];
                _state.datastore["dailypricesX"] = temp["dailyprices"];
                _state.datastore["dailygainsX"] = temp["dailygains"];
                _state.datastore["weeklygainsX"] = temp["weeklygains"];

            }
        };
        xhttp.open("GET", "/ticker/".concat(_state.crossassetticker, "/").concat(_state.duration), false);
        xhttp.send();
    }
    return this;
}

function PlotPriceHistory(state) {

    var layout = {};
    var data = [];
    if (state.isdaily) {
        data = [{
            x: UnpackModelData("date", state.datastore["dailyprices"]),
            close: UnpackModelData("close", state.datastore["dailyprices"]),
            decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
            high: UnpackModelData("high", state.datastore["dailyprices"]),
            inceasing: { line: { color: '#17BECF' } },
            line: { color: 'rgba(31,119,180,1)' },
            open: UnpackModelData("open", state.datastore["dailyprices"]),
            low: UnpackModelData("low", state.datastore["dailyprices"]),
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
            title: "".concat(state.selectedticker, " -Daily Prices")
        };
    }
    else if (state.isweekly) {
        data = [{
            x: UnpackModelData("weekEnd", state.datastore["weeklyprices"]),
            close: UnpackModelData("close", state.datastore["weeklyprices"]),
            decreasing: { line: { color: "rgba(255, 100, 102, 0.7)" } },
            high: UnpackModelData("high", state.datastore["weeklyprices"]),
            inceasing: { line: { color: '#17BECF' } },
            line: { color: 'rgba(31,119,180,1)' },
            open: UnpackModelData("open", state.datastore["weeklyprices"]),
            low: UnpackModelData("low", state.datastore["weeklyprices"]),
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
            title: "".concat(state.selectedticker, " -Weekly Prices")
        };
    }
    var config = { responsive: true, displayModeBar: false };
    Plotly.newPlot("chart-area", data, layout, config);
}
function UnpackModelData(key, arr) {
    let d = [];
    for (var i = 0; i < arr.length; i++) {
        var temp = arr[i][key];
        d.push(temp);
    }
    return d;
}
function PlotCorrScatterPlot(state) {

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
        if (state.isdaily) {
            d = [{
                mode: 'markers',
                type: 'scatter',
                x: UnpackModelData("gain",state.datastore["dailygains"]),
                y: UnpackModelData("gain", state.datastore["dailygainsX"]),
                color: 'rgb(218, 165, 32)',
                marker: {
                    color: 'rgb(218,165,32)',
                    size: 4,
                }
            }]
        }
        else if (state.isweekly) {
            d = [{
                mode: 'markers',
                type: 'scatter',
                x: UnpackModelData("gain", state.datastore["weeklygains"]),
                y: UnpackModelData("gain", state.datastore["weeklygainsX"]),
                marker: {
                    color: 'rgb(218,165,32)',
                    size: 4,
                }
            }]
        }
        var layout = {
            title: `Correlation Data - ${state.selectedticker} vs ${state.crossassetticker}`,
            xaxis: {
                title: {
                    text: "Selected Ticker"
                }
            },
            yaxis: {
                title: {
                    text: "Cross Asset Ticker"
                }
            },
            autosize: true,
            hovermode: 'closest',
            dragmode: 'select'
        }
        Plotly.newPlot('chart-area', d, layout, config);
}

export function PlotGainsDistribution(state) {

    let data = [];
    if (state.isdaily) { data = UnpackModelData("gain", state.datastore["dailygains"]); } else if (state.isweekly) {data = UnpackModelData("gain", state.datastore["weeklygains"]); } else { }
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
        }
    ];
    var layout = {
        title: "Gains Distribution for ".concat(state.selectedticker),
        xaxis: {
            title: "Percent Gains"
        },
        yaxis: {
            title: "Number of Occurences"
        }
    };
    var config = { responsive: true, displayModeBar: false };

    Plotly.newPlot("chart-area", trace, layout, config);
}

//**************************************************************** */
//initial load

