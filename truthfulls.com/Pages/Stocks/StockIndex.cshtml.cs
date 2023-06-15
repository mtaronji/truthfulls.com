using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.Contracts;
using System.Linq;
using truthfulls.com.Data;
using truthfulls.com.Models;
using truthfulls.com.Services;
using truthfulls.com.ViewModel;

namespace truthfulls.com.Pages
{
    public class StockIndexModel : PageModel
    {
        public const string DefaultTicker = "SPY";
        public string? SelectedTicker { get; set; } 
        public List<string> Tickers { get; set; } = null!;
        public string? Duration { get; set; }


        public Timeframe TimeframeType;

        public List<DailyGainsVM> DailyGains { get; set; } = null!; //all Daily gains negative and positive
        public List<decimal> DPostiveGains { get; set; } = null!;
        public List<decimal> DNegativeGains { get; set; } = null!;
        public decimal DailyPercentageUp;
        public decimal DailyPercentageDown;


        //Daily Models
        public List<decimal> DailyCloses { get; set; } = null!; 
        public List<string> DailyDates { get; set; } = null!;
        public List<decimal> DailyHighs { get; set; } = null!;
        public List<decimal> DailyLows { get; set; } = null!;
        public List<decimal> DailyOpens { get; set; } = null!;

        //_______________________
        //weekly models
        public List<string> WeekEnding { get; set; } = null!;
        public List<decimal> WeeklyCloses { get; set; } = null!;
        public List<decimal> WeeklyHighs { get; set; } = null!;
        public List<decimal> WeeklyLows { get; set; } = null!;
        public List<decimal> WeeklyOpens { get; set; } = null!;

        public List<WeeklyGainsVM> WeeklyGains { get; set; } = null!;
        public List<decimal> WPostiveGains { get; set; } = null!;
        public List<decimal> WNegativeGains { get; set; } = null!;
        public decimal WeeklyPercentageUp;
        public decimal WeeklyPercentageDown;


        public bool WeeklyChk { get; set; }
        public bool IsDaily { get; set; }
        public bool IsWeekly { get; set; }
        //_______________
        public List<DailyPriceVM> DailyPrices { get; set; } = null!;

        public List<WeeklyPriceVM> WeeklyPrices { get; set; } = null!;

        public List<CWGainsVM>? CWGains { get; set; }
        public List<CDGainsVM>? CDGains { get; set; }

        public decimal SMA200 { get; set; }
        public decimal EMA20 { get; set; }
      
        //public List<DailyPriceVM> MonthlyPrices { get; set; } 
        //public List<DailyPriceVM> QuarterlyPrices { get; set; } 

        private readonly IStockVMService _StockVMService;

        public StockIndexModel(IStockVMService ps)
        {
            if(ps == null) throw new ArgumentNullException(nameof(ps));

            this._StockVMService = ps;
    
        }


        public async Task<IActionResult> OnPostGetPrices(string ticker, int timeframe, string durationSlct)
        {
            if (timeframe != (int) Timeframe.Daily  && timeframe != (int)Timeframe.Weekly) throw new ArgumentException("Timeframe is out of range");
            if (ticker.IsNullOrEmpty()) throw new ArgumentException("Ticker must have a Value");

            this.TimeframeType = (Timeframe) timeframe;
            this.IsWeekly = (this.TimeframeType == Timeframe.Weekly);
            this.IsDaily = (this.TimeframeType == Timeframe.Daily);

            //try casting the string from the select input, if it can't be cast correctly, set the duration for 1
            int castDuration = 1;
            if (durationSlct == "Max") { castDuration = 500; this.Duration = "Max"; } else if (int.TryParse(durationSlct, out castDuration)) { this.Duration = castDuration.ToString(); } 
            else { this.Duration = "1"; castDuration = 1; }

            this.SelectedTicker = ticker.ToUpper();
 
            this.Tickers = await this._StockVMService.GetTickersAsync();
            this.DailyPrices = await this._StockVMService.GetDPricesAsync(this.SelectedTicker, castDuration);
            this.WeeklyPrices = await this._StockVMService.GetWeeklyPricesAsync(this.SelectedTicker, castDuration);
            this.DailyGains = await this._StockVMService.GetDailyGainsAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.WeeklyGains = await this._StockVMService.GetWeeklyGainsAsync(this.SelectedTicker, int.Parse(this.Duration));

            this.DailyCloses = DailyPrices.Select(c => c.Close).ToList<decimal>();
            this.DailyDates = DailyPrices.Select(d => d.Date).ToList<string>();
            this.DailyLows = DailyPrices.Select(d => d.Low).ToList<decimal>();
            this.DailyHighs = DailyPrices.Select(d => d.High).ToList<decimal>();
            this.DailyOpens = DailyPrices.Select(d => d.Open).ToList<decimal>();


            this.DPostiveGains = this.DailyGains.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.DNegativeGains = this.DailyGains.Where(g => g.Gain < 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.DailyPercentageUp = (decimal)this.DPostiveGains.Count / (this.DPostiveGains.Count + this.DNegativeGains.Count);
            this.DailyPercentageDown = (decimal)this.DNegativeGains.Count / (this.DPostiveGains.Count + this.DNegativeGains.Count);


            this.WeekEnding = WeeklyPrices.Select(x => x.WeekEnd).ToList<string>();
            this.WeeklyCloses = WeeklyPrices.Select(x => x.Close).ToList<decimal>();
            this.WeeklyHighs = WeeklyPrices.Select(x => x.High).ToList<decimal>();
            this.WeeklyLows = WeeklyPrices.Select(x => x.Low).ToList<decimal>();
            this.WeeklyOpens = WeeklyPrices.Select(x => x.Open).ToList<decimal>();

            this.WPostiveGains = this.WeeklyGains.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.WNegativeGains = this.WeeklyGains.Where(g => g.Gain < 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.WeeklyPercentageUp = (decimal)this.WPostiveGains.Count / (this.WPostiveGains.Count + this.WNegativeGains.Count);
            this.WeeklyPercentageDown = (decimal)this.WNegativeGains.Count / (this.WPostiveGains.Count + this.WNegativeGains.Count);

            this.CDGains = await this._StockVMService.GetDailyConsecutivePGainsAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.CWGains = await this._StockVMService.GetWeeklyConsecutivePGainsAsync(this.SelectedTicker, int.Parse(this.Duration));

            this.SMA200 = await this._StockVMService.GetSMAAsync(this.SelectedTicker, 200);


            return Page();
        }

        public async Task OnGet()
        {
            //default values on page
            this.SelectedTicker = DefaultTicker;
            this.Duration = "5";
            this.TimeframeType = Timeframe.Daily;
            this.IsWeekly = (this.TimeframeType == Timeframe.Weekly);
            this.IsDaily = (this.TimeframeType == Timeframe.Daily);

            this.Tickers = await this._StockVMService.GetTickersAsync();

            this.DailyPrices = await this._StockVMService.GetDPricesAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.WeeklyPrices = await this._StockVMService.GetWeeklyPricesAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.DailyGains = await this._StockVMService.GetDailyGainsAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.WeeklyGains = await this._StockVMService.GetWeeklyGainsAsync(this.SelectedTicker, int.Parse(this.Duration));

            this.DailyCloses = DailyPrices.Select(c => c.Close).ToList<decimal>();
            this.DailyDates = DailyPrices.Select(d => d.Date).ToList<string>();
            this.DailyLows = DailyPrices.Select(d => d.Low).ToList<decimal>();
            this.DailyHighs = DailyPrices.Select(d => d.High).ToList<decimal>();
            this.DailyOpens = DailyPrices.Select(d => d.Open).ToList<decimal>();

            this.DPostiveGains = this.DailyGains.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.DNegativeGains = this.DailyGains.Where(g => g.Gain < 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.DailyPercentageUp = (decimal)this.DPostiveGains.Count / (this.DPostiveGains.Count + this.DNegativeGains.Count);
            this.DailyPercentageDown = (decimal)this.DNegativeGains.Count / (this.DPostiveGains.Count + this.DNegativeGains.Count);


            this.WeekEnding = WeeklyPrices.Select(x => x.WeekEnd).ToList<string>();
            this.WeeklyHighs = WeeklyPrices.Select(x => x.High).ToList<decimal>();
            this.WeeklyLows = WeeklyPrices.Select(x => x.Low).ToList<decimal>();
            this.WeeklyCloses = WeeklyPrices.Select(x => x.Close).ToList<decimal>();
            this.WeeklyOpens = WeeklyPrices.Select(x => x.Open).ToList<decimal>();

            this.WPostiveGains = this.WeeklyGains.Where(g => g.Gain > 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.WNegativeGains = this.WeeklyGains.Where(g => g.Gain < 0.0M).Select(g => g.Gain).ToList<decimal>();
            this.WeeklyPercentageUp = (decimal)this.WPostiveGains.Count / (this.WPostiveGains.Count + this.WNegativeGains.Count);
            this.WeeklyPercentageDown = (decimal)this.WNegativeGains.Count / (this.WPostiveGains.Count + this.WNegativeGains.Count);

            this.CDGains = await this._StockVMService.GetDailyConsecutivePGainsAsync(this.SelectedTicker, int.Parse(this.Duration));
            this.CWGains = await this._StockVMService.GetWeeklyConsecutivePGainsAsync(this.SelectedTicker, int.Parse(this.Duration));

            this.SMA200 = await this._StockVMService.GetSMAAsync(this.SelectedTicker, 200);
            this.EMA20 = await this._StockVMService.GetEMAAsync(this.SelectedTicker, 20);

        }
    }
}
