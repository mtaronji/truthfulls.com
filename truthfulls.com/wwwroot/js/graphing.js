//*Istate represents all the possible states of the application interface. When events happen, this state changes. 

//Depending on the chart button clicked, we will initiate a plot that might be different.
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
//initial state represents the state of the application when the page is loaded. In this case, we are plotting price history.
export class InitialState extends IState{
    constructor(store) {
        super();
        this.setStore(store);
        this.callback = PlotPriceHistory;
    }
};
//when the chart button is clicked, we will plot the price history
export class PriceChartState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotPriceHistory;
    }
};
//if gains distribution is clicked, the state of the application changes and we plot the gains distribution.
export class GainsDistState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotGainsDistribution;
    }
};

export class GammaDistState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotGammaDistribution;
    }
}

export class LoadTimeFrameState extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotPriceHistory;
    }
};
export class LoadCrossAsset extends IState {
    constructor(state) {
        super();
        this.setState(state);
        this.callback = PlotCorrScatterPlot;
        this.CrossAssetLoaded = true;
    }
};

//this is the object that will do the plotting based on the input of state. This object also updates the data when necessary(as an example when the duration changes)
export class ChartContext{

    _state;
    constructor(Cstate){
        this._state = Cstate;
    }
    Plot() {
        this._state.callback(this._state);
    }
    SetState(state) {
        this._state = state;
    }

    UpdateSelectedTickerDataAsync = async function () {
        let r1 = await getDailyPriceDataAsync(this._state.selectedticker, this._state.duration);
        let r2 = await getWeeklyPriceDataAsync(this._state.selectedticker, this._state.duration); 
        let r3 = await getDGainDataAsync(this._state.selectedticker, this._state.duration);
        let r4 = await getWGainDataAsync(this._state.selectedticker, this._state.duration);

        this._state.datastore['dailyprices'] = r1['dailyprices'];
        this._state.datastore['weeklyprices'] = r2['weeklyprices'];
        this._state.datastore['dailygains'] = r3['dailygains'];
        this._state.datastore['percentupD'] = r3['percentupD'];
        this._state.datastore['weeklygains'] = r4['weeklygains'];
        this._state.datastore['percentupW'] = r4['percentupW'];       
    }

    UpdateCrossAssetDataAsync = async function () {
        if (!this._state.CrossAssetLoaded) { return; }

        let r1 = await getDGainDataAsync(this._state.crossassetticker, this._state.duration);
        let r2 = await getWGainDataAsync(this._state.crossassetticker, this._state.duration);

        this._state.datastore['dailygainsX'] = r1['dailygains'];
        this._state.datastore['weeklygainsX'] = r2['weeklygains'];
    }
}

//async data requests
async function getDailyPriceDataAsync(stock,duration) {
    const response = await fetch('/stock/'.concat(stock, "/d/").concat(duration));
    const data = await response.json();
    return data;
}

async function getWeeklyPriceDataAsync(stock, duration) {
    const response = await fetch('/stock/'.concat(stock, "/w/").concat(duration));
    const data = await response.json();
    return data;
}

async function getDGainDataAsync(stock,duration) {
    const response = await fetch('/stock/'.concat(stock, "/d/gains/").concat(duration));

    const data = await response.json();
    return data;
}
async function getWGainDataAsync(stock,duration) {
    const response = await fetch('/stock/'.concat(stock, "/w/gains/").concat(duration));
    const data = await response.json();
    return data;
}

async function getEMADataAsync(stock, duration) {
    const response = await fetch('/ticker/'.concat(stock, "/ema/").concat(duration));
    const data = await response.json();
    return data;
}
async function getSMADataAsync(stock, duration) {
    const response = await fetch('/ticker/'.concat(stock, "/sma/").concat(duration));
    const data = await response.json();
    return data;
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

function PlotGainsDistribution(state) {

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

//
function PlotGammaDistribution(state) {
    let timeframestring;
    let rate;
    if (state.isdaily) {
        timeframestring = "Daily";
        rate = state.datastore["percentupD"];
    }
    else if (state.isweekly) {
        timeframestring = "Weekly";
        rate = state.datastore["percentupW"];
    }
    //let alpha(a) represent here the amount of gains expected.
    //let4 gfa represent the output from the gamma function
    let alphas = [];
    alphas.push(1,2, 3, 5, 10);

    let startX = 0.0; let dx = 0.2;

    let alltracex = [];
    let alltracey = [];

    for (let i = 0; i < alphas.length; i++) {
        let tx = [];
        let ty = [];
        for (let x = 0.0; x <= 40;) {
            ty.push(GammaPDF(rate, alphas[i], x));
            tx.push(x);
            x = x + 0.25;
        }
        alltracex.push(tx);
        alltracey.push(ty);
    }

    let traces = [];

    for (let i = 0; i < alltracex.length; i++) {
        let t = {
            x: alltracex[i],
            y: alltracey[i],
            type: 'spline',
            name: "Alpha = " + alphas[i]  
        };
        traces.push(t);
    }
    let layout;
    layout = {
        title: timeframestring + " Arrival times of a gain.",
        xaxis: {
            title: 'Arrival Time -' + timeframestring,
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: 'Probability by arrival Time',
            showline: false
        }
    };

    Plotly.newPlot('chart-area', traces, layout); 
}

//numeric calculation of the gamma function
function GammaFunction(z, dt,iter) {
    if (z <= 0) {
        //validation error. Return on print
        alert("incorrect gamma function input");
    }
    let area = 0.0;
    let t = 0.0;
    for (let i = 0; i < iter; i++) {
        area = area + Math.pow(t, z - 1) * Math.pow(Math.E, -t) * dt;
        t = t + dt;
    }
    return area;
}

function GammaPDF(rate, alpha, x) {
    let gf = GammaFunction(alpha, 0.001, 15000);
    return Math.pow(rate, alpha) / (gf) * Math.pow(x, alpha - 1) * Math.pow(Math.E, -rate * x);
}