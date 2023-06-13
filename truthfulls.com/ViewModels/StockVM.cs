using System.Diagnostics.CodeAnalysis;

namespace truthfulls.com.ViewModel
{

    public class DailyPriceVM
    {
        [NotNull]
        public string Date { get; set; } = null!;
        public decimal Low { get; set; }
        public decimal High { get; set; }
        public decimal Open { get; set; }
        public decimal Close { get; set; }
        public decimal AdjClose { get; set; }

        public long Volume { get; set; }

    }

    public class WeeklyPriceVM
    {
        public string WeekStart { get; set; } = null!;
        public string WeekEnd { get; set; } = null!;
        public decimal Close { get; set; }
        public decimal Open { get; set; }
        public decimal Low { get; set; }
        public decimal High { get; set; }
        public long Volume { get; set; }

    }

    public class DailyGainsVM
    {
        public string Date { get; set; } = null!;
        public decimal Gain { get; set; }
    }

    public class WeeklyGainsVM
    {
        public string Weekstart { get; set; } = null!; //first date of week
        public string Weekend { get; set; } = null!; //last date of week
        public decimal Gain { get; set; }
    }
    public enum Timeframe
    {
        Daily = 1,
        Weekly = 2, 
        Monthy = 3,
        Quarterly = 4,
        Yearly = 5
    }
    //consecutive daily gains
    public class CDGainsVM
    {
        public string GainDate { get; set; } = null!;
        public long Gaincount { get; set; }
    }
    
    //consecutive weekly gains
    public class CWGainsVM
    {
    public string Weekending { get; set; } = null!;
    public long Gaincount { get; set; }
    }

    
}
