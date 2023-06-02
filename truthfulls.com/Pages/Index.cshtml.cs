using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;


namespace truthfulls.com.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
          
 
        } 
        
        
        public void OnGet()
        {
            //redirecting to the landing URL
            
            Response.Redirect("/Stocks/StockIndex");
        }
    }
}