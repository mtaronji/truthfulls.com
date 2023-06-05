//clicking a chart puts the charting in stats

interface ChartState {
    requestCrossAssetData: boolean;
    requestNewPriceData: boolean;
    crossAssetHasBeenSelected: boolean;
    crossAssetTicker: string;
    selectedTicker: string;
}

class LoadingDurationState implements ChartState {
    constructor(selected: boolean) {
        this.crossAssetHasBeenSelected = selected;
        this.requestCrossAssetData = selected;
    }
    crossAssetHasBeenSelected: boolean;
    requestCrossAssetData: boolean;
    requestNewPriceData: boolean = true;
    crossAssetTicker: string;
    selectedTicker: string;
}

class ChartPricesState implements ChartState{
    requestCrossAssetData: boolean = false;
    requestNewPriceData: boolean = true;
    crossAssetHasBeenSelected: boolean = false;
    crossAssetTicker: string;
    selectedTicker: string;
}

class ChartGainsDistState implements ChartState {
    requestCrossAssetData: boolean = false;
    requestNewPriceData: boolean;
    crossAssetHasBeenSelected: boolean;
    crossAssetTicker: string;
    selectedTicker: string;
}
class ChartCrossAssetState implements ChartState {
    requestCrossAssetData: boolean;
    requestNewPriceData: boolean;
    crossAssetHasBeenSelected: boolean;
    crossAssetTicker: string;
    selectedTicker: string;
}
//when a chart button is clicked.
class ChartingContext {

    currentState: ChartState;
    crossAssetData: {};
    priceData: {};
    constructor(chartState:ChartState) {
        this.currentState = chartState;
    }

    setChartState(newstate:ChartState) {
        this.currentState = newstate;
    }

    clickCrossAssetClicked() {
        //do the following after requesting A cross Asset compare
        //request cross asset data based on the ticker
    }
    clickGainsDistrCLicked() {
        //do the following after gains Dist is clicked
    }
    requestPricesClicked() {
        //do the following after requested Prices is clicked
    }
    DurationSwitched() {
        //do the following after a duration switch
    }

    CoVarianceClicked() {
        //do the following after requesting a
    }

    turnOffCrossAssetModal() {
        //turn off the popup
    }

    turnOnCrossAssetPopup() {

    }
}

