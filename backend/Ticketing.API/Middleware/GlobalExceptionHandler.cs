using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ticketing.API.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env) : IMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            OperationCanceledException => (499, "Request was cancelled"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not found"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "Conflict"),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Bad request"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            logger.LogWarning(exception, "Handled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

        var detail = env.IsDevelopment() ? exception.Message : title;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = $"{context.Request.Method} {context.Request.Path}",
            Extensions = { ["traceId"] = context.TraceIdentifier }
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, JsonOptions));
    }
}
