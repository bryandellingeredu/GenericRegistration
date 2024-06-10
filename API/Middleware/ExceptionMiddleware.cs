using Application;
using Application.Core;
using System.Net;
using System.Text;
using System.Text.Json;

namespace API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<Exception>  _logger;
        private readonly IHostEnvironment _env;
        readonly IConfiguration _config;
        public ExceptionMiddleware(RequestDelegate next, ILogger<Exception> logger, IHostEnvironment env, IConfiguration config)
        {
            _next = next;
            _logger = logger;
            _env = env;
            _config = config;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Enable buffering so the request body can be read multiple times
                context.Request.EnableBuffering();

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                try
                {
                    Settings s = new Settings();
                    var settings = s.LoadSettings(_config);
                    GraphHelper.InitializeGraph(settings, (info, cancel) => Task.FromResult(0));

                    var headers = string.Join("\n", context.Request.Headers.Select(h => $"{h.Key}: {h.Value}"));
                    var requestBody = await ReadRequestBodyAsync(context);

                    string body = $"User: {context.User.Identity.Name ?? "Anonymous"}\n" +
                                  $"Time: {DateTime.Now}\n" +
                                  $"Error Message: {ex.Message}\n" +
                                  $"Stack Trace:\n{ex.StackTrace}\n" +
                                  $"Request Method: {context.Request.Method}\n" +
                                  $"Request URL: {context.Request.Path}{context.Request.QueryString}\n" +
                                  $"Request Headers:\n{headers}\n" +
                                  $"Request Body:\n{requestBody}\n";

                    if (ex.InnerException != null)
                    {
                        body += $"\nInner Exception Message: {ex.InnerException.Message}" +
                                $"\nInner Exception Stack Trace:\n{ex.InnerException.StackTrace}";
                    }

                    await GraphHelper.SendEmail(new[] { "bryan.d.dellinger.civ@army.mil", "bryan.dellinger.civ@armywarcollege.edu" }, "A Registration Error Occurred", body);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send error email.");
                }

                var response = _env.IsDevelopment()
                    ? new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString())
                    : new AppException(context.Response.StatusCode, "Internal Server Error");

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }

        private async Task<string> ReadRequestBodyAsync(HttpContext context)
        {
            context.Request.Body.Position = 0;

            if (context.Request.ContentLength == null || context.Request.ContentLength == 0)
            {
                return string.Empty;
            }

            using (var reader = new StreamReader(context.Request.Body, encoding: Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 4096, leaveOpen: true))
            {
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;
                return body;
            }
        }
    }
}
