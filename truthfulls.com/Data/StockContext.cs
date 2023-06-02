using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.EntityFrameworkCore;
using truthfulls.com.Models;

namespace truthfulls.com.Data
{
    public class StockContext:DbContext
    {
        public StockContext(DbContextOptions<StockContext> options) : base(options)
        {

        }

        public StockContext()
        {
        }

        public DbSet<truthfulls.com.Models.Stock> Stocks { get; set; }
        public DbSet<truthfulls.com.Models.Sector> Sectors { get; set; }
        public DbSet<truthfulls.com.Models.Price> Prices { get; set; }
        //public DbSet<truthfulls.com.Models.FinanciaDate> FinancialDates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<truthfulls.com.Models.Stock>().ToTable("Stock");
            modelBuilder.Entity<truthfulls.com.Models.Sector>().ToTable("Sector").HasNoKey();
            modelBuilder.Entity<truthfulls.com.Models.Price>().ToTable("Price").HasNoKey();
            modelBuilder.Entity<truthfulls.com.Models.FinancialDate>().ToTable("FinancialDate");

            //modelBuilder.HasDefaultSchema("Stock");
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

    }
}
