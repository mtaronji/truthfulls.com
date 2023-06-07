using Microsoft.AspNetCore.Mvc;
using truthfulls.com.Services;
using System.Text.Json;

namespace truthfulls.com.Controllers
{

    //return all the daily price data for the ticker
    [ApiController]
    public class TickerController : Controller
    {
        private IStockVMService stockVMService { get; } = null!;
        public TickerController(IStockVMService s) 
        {
            this.stockVMService = s;
            
        }

        //needs input of the ticker, timeframe as well as the duration of the data
        [HttpGet]
        [Route("[controller]/{name:alpha}/{duration}/{focus?}")]
        public async Task<JsonResult> GetAsync(string name, int duration, int focus)
        {
            //check if the ticker is in the database

            //_________________________________
            if (duration == 0) { duration = 1; }

            var result1 =  await stockVMService.GetDPricesAsync(name, duration);
            var result2 = await stockVMService.GetWeeklyPricesAsync(name, duration);
            var result3 = await stockVMService.GetDailyGainsAsync(name, duration);
            var result4 = await stockVMService.GetWeeklyGainsAsync(name, duration);
            var j = Json(new {dailyprices = result1, weeklyprices = result2, dailygains = result3, weeklygains = result4, selectedchart = focus });
            //var j = Json(new {selectedchart = focus });

            return j;
        }
    }

}
