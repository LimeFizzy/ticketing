using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController(ITicketService ticketService, IEmailService emailService, ILogger<TicketsController> logger) : ControllerBase
{
    [HttpGet(Name = "getMyTickets")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TicketDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTickets(CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        var tickets = await ticketService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(tickets);
    }

    [HttpGet("{id}", Name = "getTicketById")]
    [Authorize]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var ticket = await ticketService.GetByIdAsync(id, userId, cancellationToken);
            if (ticket == null) return NotFound(new ProblemDetails { Title = "Ticket not found" });
            return Ok(ticket);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "You do not have access to this ticket" });
        }
    }

    [HttpPost("check-in", Name = "checkInTicket")]
    [Authorize]
    [EnableRateLimiting("check-in")]
    [ProducesResponseType(typeof(CheckInResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken cancellationToken = default)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var result = await ticketService.CheckInAsync(userId, request, cancellationToken);
            if (!result.WasAlreadyCheckedIn)
            {
                try
                {
                    BackgroundJob.Enqueue(() => emailService.SendCheckInConfirmationAsync(result.Ticket.Id));
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to enqueue check-in confirmation email for ticket {TicketId}", result.Ticket.Id);
                }
            }
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Not authorized to check in tickets for this event" });
        }
    }
}
