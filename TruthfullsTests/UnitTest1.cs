using Microsoft.AspNetCore.Mvc;
using truthfulls.com.Pages;
using truthfulls.com.Services;
using truthfulls.com.ViewModel;
using truthfulls.com.Controllers;

namespace TruthfullsTests
{
    public class Tests
    {
  
        StockIndexModel StockIndexModelOnGet;
        IStockVMService _stockVMService;

        List<DailyPriceVM> dailyprices;
        List<WeeklyPriceVM> WeeklyPrices;
        List<DailyPriceVM> dailypricesUpperCase;
        List<DailyPriceVM> dailypricesLowerCase;
        List<WeeklyPriceVM> weeklyPricesUpperCase;
        List<WeeklyPriceVM> weeklyPricesLowerCase;


        [SetUp]
        public async Task Setup()
        {
            //_stockVMService = new StockVMService("Server=(local);Database=Truthfulls;Trusted_Connection=True;Encrypt=false;");

            //set datasource to the correct location:

            _stockVMService = new StockVMService("Data Source=UnitTest.db;");

            //test state of the properties on get
            StockIndexModelOnGet = new(_stockVMService);
            StockIndexModelOnGet.OnGet();

            dailypricesUpperCase = await this._stockVMService.GetDPricesAsync("tsla", 5);
            dailypricesLowerCase = await this._stockVMService.GetDPricesAsync("TSLA", 5);
            weeklyPricesUpperCase = await this._stockVMService.GetWeeklyPricesAsync("SPY", 5);
            weeklyPricesLowerCase = await this._stockVMService.GetWeeklyPricesAsync("spy", 5);

            dailyprices = dailypricesLowerCase;
            WeeklyPrices = weeklyPricesUpperCase;
        }

        [Test]
        public void DBRetrieval()
        {

            Assert.That(dailyprices.Count, Is.GreaterThan(0));
            Assert.That(WeeklyPrices.Count, Is.GreaterThan(0));
            Assert.That(dailyprices.Count, Is.GreaterThan(0));
            Assert.That(WeeklyPrices.Count, Is.GreaterThan(0));
        }
        [Test]
        public void StockVMserviceTests()
        {

            Assert.That(dailyprices.Count, Is.GreaterThan(0));

            var Dailycloses = dailyprices.Select(c => c.Close).ToList<decimal>();
            Assert.That(Dailycloses.Count, Is.GreaterThan(0));

            var DailyDates = dailyprices.Select(d => d.Date).ToList<string>();
            Assert.That(DailyDates.Count, Is.GreaterThan(0));

            var DailyLows = dailyprices.Select(d => d.Low).ToList<decimal>();
            Assert.That(DailyLows.Count, Is.GreaterThan(0));

            var Dailyhighs = dailyprices.Select(d => d.High).ToList<decimal>();
            Assert.That(Dailyhighs.Count, Is.GreaterThan(0));

            var Dailyopens = dailyprices.Select(d => d.Open).ToList<decimal>();
            Assert.That(Dailyopens.Count, Is.GreaterThan(0));

            var Dailyvolume = dailyprices.Select(d => d.Volume).ToList<Int64>();
            Assert.That(Dailyvolume.Count, Is.GreaterThan(0));

            var WeekEnding = WeeklyPrices.Select(x => x.WeekEnd).ToList<string>();
            Assert.That(WeekEnding.Count, Is.GreaterThan(0));

            var WeeklyCloses = WeeklyPrices.Select(x => x.Close).ToList<decimal>();
            Assert.That(WeeklyCloses.Count, Is.GreaterThan(0));

            var WeeklyLows = WeeklyPrices.Select(x => x.Low).ToList<decimal>();
            Assert.That(WeeklyLows.Count, Is.GreaterThan(0));

            var WeeklyHighs = WeeklyPrices.Select(x => x.High).ToList<decimal>();
            Assert.That(WeeklyHighs.Count, Is.GreaterThan(0));

            var WeeklyOpens = WeeklyPrices.Select(x => x.Open).ToList<decimal>();
            Assert.That(WeeklyOpens.Count, Is.GreaterThan(0));

            //assert no price data is an integer. Decimal data can be a whole number

            Assert.Pass();
        }

  
        //When page is requested you should init
        [Test]
        public void StockOnGetTests()
        {

            Assert.That(StockIndexModelOnGet.SelectedTicker, Is.Not.Empty);
            Assert.That(StockIndexModelOnGet.Duration, Is.EqualTo("5"));
            Assert.That(StockIndexModelOnGet.Tickers.Count, Is.GreaterThan(0));

            Assert.That(StockIndexModelOnGet.DailyPrices.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.DailyCloses.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.DailyDates.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.DailyHighs.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.DailyLows.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.DailyOpens.Count, Is.GreaterThan(0));



            Assert.That(StockIndexModelOnGet.WeeklyPrices.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.WeekEnding.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.WeeklyHighs.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.WeeklyLows.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.WeeklyOpens.Count, Is.GreaterThan(0));
            Assert.That(StockIndexModelOnGet.WeeklyCloses.Count, Is.GreaterThan(0));

            Assert.Pass();
        }

        [Test]
        public void TickerAPITests()
        {

        }

    }
}