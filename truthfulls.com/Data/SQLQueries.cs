using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Runtime.InteropServices;
using truthfulls.com.Models;

namespace truthfulls.com.Data
{
    //list of sql queries for sqllite
    public class SQLiteQueries
    {
        public static string WeeklyData(string ticker, int duration)
        {
            return $@"select t1.*, sp1.[open], sp2.[Close] from
                    (
                    select min(p.[Date]) as weekstart, max(p.[date]) as weekend, max(p.[High]) as [High], min(p.[Low]) as [Low], sum(p.Volume) as Volume
                    from
                    (
                        select p.*, strftime('%Y', p.[date]) as yearnum,  strftime('%W', p.[date]) as weeknum from[Price] p
                        where p.[Ticker] = '{ticker}'
	                    ) p
                        group by p.yearnum, p.[weeknum]
                    ) t1
                    inner join
                    [Price] sp1 on
                    (sp1.[Date] = t1.weekstart and sp1.Ticker = '{ticker}')
                    inner join
                    [Price] sp2 on
                    (sp2.[Date] = t1.[weekend] and sp2.Ticker = '{ticker}')
                    where t1.weekend > DATE(DATE('NOW'), '{-duration} YEAR')";
        }

        public static string DailyData(string ticker, int duration)
        {
            return $@"select t.[Date], t.[Low], t.[High], t.[Open], t.[Close], t.[Adjclose], t.[volume]
                    from[Price] t where t.[Ticker] = '{ticker}' and t.[date] > DATE(DATE('NOW'), '{-duration} YEAR')";
        }

        public static string DailyGains(string ticker, int duration)
        {
            return $@"select t.* from
                    (select p.[Date], p.[close] * 1.0 /( lag(p.[Close], 1, 0) over(order by p.[date])*1.0)-1 as previous
                    from [price] p where p.Ticker = '{ticker}') t
                    where t.previous is not null
                    and t.[Date] > DATE('NOW', '{-duration} YEAR')";
        }

        public static string WeeklyGains(string ticker, int duration)
        {
            return

                    $@"
                     with weeklydata as 
                     (
                        select t1.*, sp1.[open], sp2.[Close] from
                        (
                            select min(p.[Date]) as weekstart, max(p.[date]) as weekend, max(p.[High]) as [High], min(p.[Low]) as [Low], sum(p.Volume) as Volume
                            from
                            (
                            select p.*, strftime('%Y', p.[date]) as yearnum,  strftime('%W', p.[date]) as weeknum from [Price] p
                            where p.[Ticker] = '{ticker}') p
                            group by p.yearnum, p.[weeknum]
                        ) t1
                        inner join
                        [Price] sp1 on
                        (sp1.[Date] = t1.[weekstart] and sp1.Ticker = '{ticker}')
                        inner join
                        [Price] sp2 on
                        (sp2.[Date] = t1.[weekend] and sp2.Ticker = '{ticker}')
                        where t1.weekend > DATE(DATE('NOW'), '{-duration} YEAR')
                    )

                    SELECT T.[weekstart], T.[weekend], T.Gain
                        from
                        (select wd.[weekstart], wd.[weekend], wd.[close] * 1.0 / (lag(wd.[close], 1, 0) over (order by wd.[weekstart]) * 1.0) - 1 as Gain 
                        from weeklydata wd) T
                    where T.Gain is not null";
        }







    }
}
