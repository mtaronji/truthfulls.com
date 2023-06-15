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
        StockController _API;

        List<DailyPriceVM> dailyprices;
        List<WeeklyPriceVM> weeklyprices;
        List<CDGainsVM> cdGains;
        List<CWGainsVM> CWGains;
        decimal _SMA;
        decimal _EMA;

        [SetUp]
        public async Task Setup()
        {
            //_stockVMService = new StockVMService("Server=(local);Database=Truthfulls;Trusted_Connection=True;Encrypt=false;");

            //set datasource to the correct location:

            _stockVMService = new StockVMService("Data Source=UnitTest.db;");
            _API = new StockController(_stockVMService);

            //test state of the properties on get
            StockIndexModelOnGet = new(_stockVMService);
            await StockIndexModelOnGet.OnGet();

            dailyprices = await _stockVMService.GetDPricesAsync("AMD", 3);
            weeklyprices = await _stockVMService.GetWeeklyPricesAsync("nvda", 3);
            cdGains = await _stockVMService.GetDailyConsecutivePGainsAsync("qqq", 7);
            CWGains = await _stockVMService.GetWeeklyConsecutivePGainsAsync("qqq", 2);

            _SMA = await _stockVMService.GetSMAAsync("qQq", 50);
            _EMA = await _stockVMService.GetSMAAsync("spY", 200);


        }

        [Test]
        public void DBRetrieval()
        {

            Assert.That(dailyprices, Has.Count.GreaterThan(0));
            Assert.That(weeklyprices, Has.Count.GreaterThan(0));
            Assert.That(CWGains, Has.Count.GreaterThan(0));
            Assert.That(cdGains, Has.Count.GreaterThan(0));
            Assert.That(_SMA, Is.GreaterThan(0));
            Assert.That(_EMA, Is.GreaterThan(0));

        }
        [Test]
        public void StockVMserviceTests()
        {

            var Dailycloses = dailyprices.Select(c => c.Close).ToList<decimal>();
            Assert.That(Dailycloses, Has.Count.GreaterThan(0));

            var DailyDates = dailyprices.Select(d => d.Date).ToList<string>();
            Assert.That(DailyDates, Has.Count.GreaterThan(0));

            var DailyLows = dailyprices.Select(d => d.Low).ToList<decimal>();
            Assert.That(DailyLows, Has.Count.GreaterThan(0));

            var Dailyhighs = dailyprices.Select(d => d.High).ToList<decimal>();
            Assert.That(Dailyhighs, Has.Count.GreaterThan(0));

            var Dailyopens = dailyprices.Select(d => d.Open).ToList<decimal>();
            Assert.That(Dailyopens, Has.Count.GreaterThan(0));

            var Dailyvolume = dailyprices.Select(d => d.Volume).ToList<Int64>();
            Assert.That(Dailyvolume, Has.Count.GreaterThan(0));

            var WeekEnding = weeklyprices.Select(x => x.WeekEnd).ToList<string>();
            Assert.That(WeekEnding, Has.Count.GreaterThan(0));

            var WeeklyCloses = weeklyprices.Select(x => x.Close).ToList<decimal>();
            Assert.That(WeeklyCloses, Has.Count.GreaterThan(0));

            var WeeklyLows = weeklyprices.Select(x => x.Low).ToList<decimal>();
            Assert.That(WeeklyLows, Has.Count.GreaterThan(0));

            var WeeklyHighs = weeklyprices.Select(x => x.High).ToList<decimal>();
            Assert.That(WeeklyHighs, Has.Count.GreaterThan(0));

            var WeeklyOpens = weeklyprices.Select(x => x.Open).ToList<decimal>();
            Assert.That(WeeklyOpens, Has.Count.GreaterThan(0));

            //assert no price data is an integer. Decimal data can be a whole number

            Assert.Pass();
        }

  
        //When page is requested you should init
        [Test]
        public void StockOnGetTests()
        {

        }

        [Test]
        public void TickerAPITests()
        {
            //API tests will be done in javascript testing
        }

    }
}