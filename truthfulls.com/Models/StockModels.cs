using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace truthfulls.com.Models
{

    [Table("Stock", Schema = "Stock")]
    public class Stock
    {
        [Key]
        public string Ticker { get; set; } = null!;
        public string? CompanyName { get; set; }

        public string? Country { get; set; }

    }

    [Table("Sector", Schema = "Stock")]
    public class Sector
    {
        [ForeignKey("Ticker")]
        public Stock Stock { get; set; } = null!;
        public string Ticker { get; set; } = null!;

        public string SectorName { get; set; } = null!;


        public string? Description { get; set; }

    }

    [Table("Price", Schema ="Stock")]
    public class Price
    {
        [ForeignKey("Ticker")]
        public Stock stock { get; set; } = null!;

        public string Ticker { get; set; } = null!;


        [ForeignKey("Date")]
        public FinancialDate FinancialDate { get; set; } = null!;
        [DataType(DataType.Date)]
        [Column(TypeName = "Date")]
        public DateTime Date { get; set; }

        [Column(TypeName = "money")]
        public decimal Open { get; set; }

        [Column(TypeName = "money")]
        public decimal Close { get; set; }

        [Column(TypeName = "money")]
        public decimal AdjClose { get; set; }

        [Column(TypeName = "money")]
        public decimal Low { get; set; }

        [Column(TypeName = "money")]
        public decimal High { get; set; }

        [Column(TypeName = "bigint")]
        public decimal Volume { get; set; }
    }

    [Table("FinancialDate", Schema = "Stock")]
    public class FinancialDate
    {
        [Key]
        [DataType(DataType.Date)]
        [Column(TypeName = "Date")]
        [Required]
        public DateTime Date { get; set; }

    }

}
