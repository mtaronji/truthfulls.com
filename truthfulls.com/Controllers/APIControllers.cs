using Microsoft.AspNetCore.Mvc;
using truthfulls.com.Services;
using System.Text.Json;

namespace truthfulls.com.Controllers
{

    //return various stock data
    [ApiController]
    public class StockController : Controller
    {
        private IStockVMService stockVMService { get; } = null!;
        public StockController(IStockVMService s)
        {
            this.stockVMService = s;

        }

        //needs input of the ticker and the duration. Will pull both weekly and daily price gain data.
        [HttpGet]
        [Route("[controller]/{name:alpha}/d/{duration}")]
        public async Task<JsonResult> GetDailyPrices(string name, int duration)
        {
            //check if the ticker is in the database      

            var result1 = await stockVMService.GetDPricesAsync(name.ToUpper(), duration);
            var j = Json(new { dailyprices = result1 });

            return j;
        }

        [HttpGet]
        [Route("[controller]/{name:alpha}/w/{duration}")]
        public async Task<JsonResult> GetWeeklyPrices(string name, int duration)
        {
            var result1 = await stockVMService.GetWeeklyPricesAsync(name.ToUpper(), duration);
            var j = Json(new { weeklyprices = result1 });
            return j;
        }
        
        [HttpGet]
        [Route("[controller]/{name:alpha}/d/gains/{duration}")]
        public async Task<JsonResult> GetDailyGains(string name, int duration)
        {
            var result1 = await stockVMService.GetDailyGainsAsync(name.ToUpper(), duration);
            var result2 = (decimal)result1.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>().Count / result1.Count;

            return Json(new { dailygains = result1, percentupD = result2});
        }

        [HttpGet]
        [Route("[controller]/{name:alpha}/w/gains/{duration}")]
        public async Task<JsonResult> GetWeeklyGains(string name, int duration)
        {
            var result1 = await stockVMService.GetWeeklyGainsAsync(name.ToUpper(), duration);
            var result2 = (decimal)result1.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>().Count / result1.Count;
            return Json(new { weeklygains = result1, percentupW = result2 });
        }

        //return the simple moving average of the duration
        [HttpGet]
        [Route("[controller]/{name:alpha}/sma/{duration}")]
        public async Task<JsonResult> GetSMA(string name, int duration)
        {
            var result1 = await stockVMService.GetSMAAsync(name.ToUpper(), duration);
            return Json(new { sma = result1});
        }


        //return the exponential moving average of the date specified
        [HttpGet]
        [Route("[controller]/{name:alpha}/ema/{duration}")]
        public async Task<JsonResult> GetEMA(string name, int duration)
        {
            var result1 = await stockVMService.GetEMAAsync(name.ToUpper(), duration);
            return Json(new { ema = result1 });

        }

    }
}
