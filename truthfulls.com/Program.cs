using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using truthfulls.com.Data;
using truthfulls.com.Services;
using static System.Net.Mime.MediaTypeNames;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var lite = builder.Configuration.GetConnectionString("develop");
var ss = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddRazorPages();
builder.Services.AddControllers();
//builder.Services.AddDbContext<StockContext>(o => o.UseSqlite(lite));
builder.Services.AddScoped<IStockVMService, StockVMService>();
builder.Services.AddMemoryCache();
ConfigurationManager configuration = builder.Configuration;


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios,see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


app.UseStaticFiles();

app.UseRouting();
                 
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();



app.Run();
