/// <reference path="plotly.js" />

import * as Graph from "./graphing.js"

var context;
var currentState = new Graph.InitialState(ModelData0);

//INIT
docReady(function () {
    LoadEventListeners();
    LoadDataList();
    SetSelectedDuration(ModelData0["duration"]);
    SetSelectedRadioValue(ModelData0["timeframe"]);
    
    context = new Graph.ChartContext(currentState);
    context.Plot();
});
function LoadDataList() {
    let e = document.querySelector("#tickers-datalist");

    for (let i = 0; i < ModelData0["tickers"].length; i++) {
        var t = ModelData0["tickers"][i];
        e.innerHTML += `<option>${t}</option>`;
    }
}
function LoadEventListeners() {
    document.querySelector("#form-ticker-search").addEventListener('submit', ValidateStockSearchForm);
    document.querySelector("#form-ticker-search-cross-asset-compare").addEventListener("submit", ValidateStockSearchForm);
    document.querySelector("#ticker-search-txt-input").addEventListener('keyup', KeyUpTickerSearchTxt);
    document.querySelector("#ticker-search-radio-daily").addEventListener('change', TimeFrameSelect);
    document.querySelector("#ticker-search-radio-weekly").addEventListener('change', TimeFrameSelect);
    document.querySelector("#ticker-search-duration-slct").addEventListener('change', DurationSlct);
    document.querySelector("#ticker-searchca-txt-input").addEventListener("keyup", KeyUpTickerSearchTxt);
    document.querySelector("#btn-fundies").addEventListener("click", ShowCrossAssetForm);
    document.querySelector("#crossassetexit").addEventListener("click", CloseCrossAssetForm);
    
    let nodes = document.getElementsByClassName("chart-tab-btn");
    for (let i = 0; i < nodes.length; i++) { nodes[i].addEventListener('click', OpenTab); }

}

function ShowCrossAssetForm() {
    let e = document.getElementById("crossasset-form-container");
    e.style.display = 'block';
    e.style.visibility = 'visible';
}
function CloseCrossAssetForm(event) {

    let e = document.getElementById("crossasset-form-container");
    e.style.display = "none"; e.style.visibility = 'hidden';
}
function SetSelectedDuration(value) {

    document.querySelector("#ticker-search-duration-slct").value = value;
}

function KeyUpTickerSearchTxt(event) {
    /* Only one validation lbl should be in our form controls*/
    let validationlabel = document.getElementById(event.currentTarget.id).parentNode.getElementsByClassName("validation-lbl")[0];
    let input = event.currentTarget.value.trim().toUpperCase();

    if (ModelData0["tickers"].includes(input)) {
        validationlabel.innerHTML = "";
    }
    else {
       //print validation message on label
        validationlabel.innerHTML = "Ticker is not available";
    } 
  
}

function ValidateStockSearchForm(event) {
    //this validate can come from 2 forms. One on cross asset search, one on the primary ticker
    let formid = document.getElementById(event.currentTarget.id);
    let input = formid.getElementsByClassName("ticker-input-txt")[0].value.trim().toUpperCase();
    let validationlabel = formid.parentNode.getElementsByClassName("validation-lbl")[0];
    let isCrossAsset = (event.currentTarget.id == 'form-ticker-search-cross-asset-compare');

    //validation logic
    if (ModelData0["tickers"].includes(input)) {
        validationlabel.innerHTML = "";
    }
    else {
        //print validation message on label
        validationlabel.innerHTML = "Ticker is not available <br>"
        validationPassed = false;
        return false;
    }

    //we don't want cross assset form being posted.
    //we handle in the search button click
    //
    if (isCrossAsset) {
        currentState.crossassetticker = input;
        let id = { currentTarget: { id: "btn-fundies-validated" } };
        OpenTab(id);
        event.preventDefault();
    }
    return true;
}
function ValidateTicker() {
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

function OpenTab(event) {
    //tab logic. Handle the switches between tabs here
    //just plot because state shouldn't change on a tab click
    //cross asset config happens in the form validation not in the HTML

    switch (event.currentTarget.id) {
        case "btn-stats":
            var newState = new Graph.GainsDistState(currentState);
            currentState = newState;
            context.SetState(currentState);
            context.Plot();
            LoadStatsTab();
            break;
        case "btn-fundies-validated":
            CloseCrossAssetForm();
            var newState = new Graph.LoadCrossAsset(currentState);
            currentState = newState;
            context.SetState(currentState);
            context.UpdateData();
            context.UpdateDataX();
            context.Plot();
            LoadFundiesTab();

            break;
        case "btn-chart":
            var newState = new Graph.PriceChartState(currentState);
            currentState = newState;
            context.SetState(currentState);
            context.Plot();
            LoadChartTab();
            break;
    }  

    if (event.currentTarget.id == "btn-fundies" && currentState.CrossAssetLoaded) {
        //if we click the button and we have a cross asset loaded. show it. No update neccessary
        var newState = new Graph.LoadCrossAsset(currentState);
        currentState = newState;
        context.SetState(currentState);
        context.Plot();
        LoadFundiesTab();
    }
    

    //leave the plots in the swtich statement. Don't bring themn down
}

function LoadStatsTab() {
    document.querySelector("#btn-stats").style.color = "silver";
    document.querySelector("#btn-chart").style.color = "black";
    document.querySelector("#btn-fundies").style.color = "black";
  
}

function LoadFundiesTab() {

    document.querySelector("#btn-fundies").style.color = "silver";
    document.querySelector("#btn-chart").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";
 

    window.dispatchEvent(new Event('resize'));
}

function LoadChartTab() {

    document.querySelector("#btn-chart").style.color = "silver";
    document.querySelector("#btn-fundies").style.color = "black";
    document.querySelector("#btn-stats").style.color = "black";

}

function DurationSlct(event) {
    //send async request for the new data based on the duration amount
    //Update all page data dependent on the time duration
    //check for Max selected by parsing the event value into int. If it's not a value, return duration of 500'

    let duration = 2;
    const parsed = parseInt(event.currentTarget.value);
    if (isNaN(parsed)) { duration = 500; } else { duration = parsed; }

    currentState.duration = duration;
    context.SetState(currentState);
    context.UpdateData();
    context.UpdateDataX();
    context.Plot();

}


function GetSelectedRadioValue() {
    var radios = document.getElementsByName('timeframe');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;

            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

function SetSelectedRadioValue(timeframe) {
    var radios = document.getElementsByName('timeframe');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].value == timeframe) {
            radios[i].checked = true;

            break;
        }       
    }
}

function TimeFrameSelect(event) {
   //switch the graphs to weekly
    currentState.isweekly = (event.currentTarget.value == 2);
    currentState.isdaily = (event.currentTarget.value == 1);
    context.SetState(currentState);
    context.Plot();
}

function SearchCrossAssetCompare(event) {
    //disable the search button. we don't want to really submit to the server. We want to get the data async
    event.preventDefault();
}

function ClosePopup() {
    //click chart tag
    let e = document.getElementById("btn-chart");
    e.click();
}


/*



*/