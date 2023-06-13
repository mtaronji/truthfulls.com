using Microsoft.EntityFrameworkCore;
using truthfulls.com.Data;
using System.Data;
using Microsoft.Data.SqlClient; 
using truthfulls.com.Models;
using truthfulls.com.ViewModel;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Runtime.InteropServices;
using Microsoft.Data.Sqlite;
using System.Runtime.Caching;
using Microsoft.Extensions.Caching.Memory;

namespace truthfulls.com.Services
{
    public interface IStockVMService
    {
        public Task<List<DailyPriceVM>> GetDPricesAsync(string ticker, int duration);
        public Task<List<string>> GetTickersAsync();
        public Task<List<DailyGainsVM>> GetDailyGainsAsync(string ticker, int duration);
        public Task<List<WeeklyGainsVM>> GetWeeklyGainsAsync(string ticker, int duration);
        public Task<List<WeeklyPriceVM>> GetWeeklyPricesAsync(string ticker, int duration);
        public Task<List<CWGainsVM>> GetWeeklyConsecutivePGainsAsync(string ticker, int duration);
        public Task<List<CDGainsVM>> GetDailyConsecutivePGainsAsync(string ticker, int duration);

    }

    public class StockVMService : IStockVMService
    {
        readonly SqlConnectionStringBuilder builder;
        readonly IMemoryCache _cache;

        public StockVMService(IConfiguration config, IMemoryCache cache)
        {
            /*this uses windows integrated security so no creditials are exposed. 
             * Use App settings Json to store the connection string for best practices*/
            builder = new();
            this._cache = cache;
            //this.builder.ConnectionString = c.GetConnectionString("DefaultConnection");   //sql server test string
            this.builder.ConnectionString = config.GetConnectionString("develop");
        }

        public StockVMService(string testconnectionstring)
        {
            //for unit tests
            builder = new();
            this.builder.ConnectionString = testconnectionstring;
        }

        public async Task<List<string>> GetTickersAsync()
        {

            List<string>? tickers;
            tickers = _cache.Get<List<string>>(key: "Tickers");

            //if nothing in cache set it.
            if (tickers == null)
            {
                tickers = new List<string>();
                string queryString = $"select s.[ticker] from [Stock] s";

                try
                {
                    using (var connection = new SqliteConnection(this.builder.ConnectionString))
                    {
                        connection.Open();

                        var command = connection.CreateCommand();
                        command.CommandText = queryString;

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                var ticker = reader.GetString(0);
                                tickers.Add(ticker);
                            }
                            reader.Close();
                            if (tickers.Count > 0) { _cache.Set(key: "Tickers", tickers, TimeSpan.FromDays(1)); }
                                                      
                        }
                    }
                }
                catch (SqliteException ex) 
                { 
                    Console.WriteLine(ex.Message); 
                }
            }
            
            if (tickers == null)
                throw new ArgumentNullException("tickers are null. Fatal Error");         

            return tickers;
        }
        public async Task<List<DailyPriceVM>> GetDPricesAsync(string ticker, int duration) 
        {
            ticker.ToUpper();
            var prices = new List<DailyPriceVM>();

            string queryString = SQLiteQueries.DailyData(ticker, duration);  //sqllite
            // Provide the query string with a parameter placeholder.
            //string queryString = $"select t.[Date], t.[Low], t.[High], t.[Open], t.[Close], t.[Adjclose], t.[volume]  from Stock.[Price] t where t.[Ticker] = '{ticker}' and t.[date] > DATEADD(year, -{duration}, GETDATE()) order by t.[date]";  //sql server

            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            var price = new DailyPriceVM()
                            {
                                Date = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                Low = reader.GetDecimal(1),
                                High = reader.GetDecimal(2),
                                Open = reader.GetDecimal(3),
                                Close = reader.GetDecimal(4),
                                AdjClose = reader.GetDecimal(5),
                                Volume = reader.GetInt64(6)
                            };
                            prices.Add(price);
                        }
                        reader.Close();
                    }
                }
            }
            catch (SqlException ex) { Console.Write(ex.Message); }
            return prices;
        }

        //return all daily dates where the stock was above a certain percent
        public async Task<List<DailyGainsVM>> GetDailyGainsAsync(string ticker, int duration)
        {
            ticker.ToUpper();
            var gains = new List<DailyGainsVM>();
            string queryString = SQLiteQueries.DailyGains(ticker, duration);
            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            var g = new DailyGainsVM()
                            {
                                Date = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                Gain = reader.GetDecimal(1)
                            };
                            gains.Add(g);
                        }
                        reader.Close();
                    }
                }
            }
            catch (SqlException ex) { Console.WriteLine(ex.Message); }
            return gains;
        }

        public async Task<List<WeeklyGainsVM>> GetWeeklyGainsAsync(string ticker, int duration)
        {
            ticker.ToUpper();
            var weeklygains = new List<WeeklyGainsVM>();
            string queryString = SQLiteQueries.WeeklyGains(ticker, duration);
            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            var g = new WeeklyGainsVM()
                            {
                                Weekstart = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                Weekend = reader.GetDateTime(1).ToString("yyyy-MM-dd"),
                                Gain = reader.GetDecimal(2)
                            };
                            weeklygains.Add(g);
                        }
                        reader.Close();
                    }
                }
            }
            catch (SqlException ex) { Console.WriteLine(ex.Message); }
            return weeklygains;
        }

        public async Task<List<WeeklyPriceVM>> GetWeeklyPricesAsync(string ticker, int duration)
        {
            ticker.ToUpper();
            //forsqllite 
            string queryString = SQLiteQueries.WeeklyData(ticker, duration);

            var weeklyPrices = new List<WeeklyPriceVM>();

            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            //multiplying my 2 decimal places to ensure no multiplication errors. Some numbers can get cast to int if they aren't supplied decimals
                            var wp = new WeeklyPriceVM()
                            {
                                WeekStart = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                WeekEnd = reader.GetDateTime(1).ToString("yyyy-MM-dd"),
                                High = reader.GetDecimal(2),
                                Low = reader.GetDecimal(3),
                                Volume = reader.GetInt64(4),
                                Open = reader.GetDecimal(5),
                                Close = reader.GetDecimal(6)
                            };

                            weeklyPrices.Add(wp);

                        }
                        reader.Close();
                    }
                }
            }
            catch(SqlException ex) { Console.WriteLine(ex.Message); }
            return weeklyPrices;
        }

        public async Task<List<CDGainsVM>> GetDailyConsecutivePGainsAsync(string ticker, int duration)
        {
            ticker.ToUpper();
            var cgains = new List<CDGainsVM>();
            string queryString = SQLiteQueries.DailyConsecutivePGains(ticker, duration);
            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            //multiplying my 2 decimal places to ensure no multiplication errors. Some numbers can get cast to int if they aren't supplied decimals
                            var cdg = new CDGainsVM()
                            {
                                GainDate = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                Gaincount = reader.GetInt64(1)
                            };

                            cgains.Add(cdg);

                        }
                        reader.Close();
                    }
                }
            }
            catch (SqlException ex) { Console.WriteLine(ex.Message); }


            
            return cgains;
        }
        public async Task<List<CWGainsVM>> GetWeeklyConsecutivePGainsAsync(string ticker, int duration)
        {
            ticker.ToUpper();
            var cgains = new List<CWGainsVM>();
            string queryString = SQLiteQueries.WeeklyConsecutivePGains(ticker, duration);
            try
            {
                using (var connection = new SqliteConnection(this.builder.ConnectionString))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = queryString;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (reader.Read())
                        {
                            var cwg = new CWGainsVM()
                            {
                               Weekending = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                               Gaincount = reader.GetInt64(1)
                            };

                            cgains.Add(cwg);

                        }
                        reader.Close();
                    }
                }
            }
            catch (SqlException ex) { Console.WriteLine(ex.Message); }
            return cgains;
        }


    }
}
