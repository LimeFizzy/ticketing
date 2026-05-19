using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController(ITicketService ticketService, IEmailService emailService) : ControllerBase
{
    [HttpGet(Name = "getMyTickets")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TicketDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTickets()
    {
        var userId = this.GetUserIdFromClaims();
        var tickets = await ticketService.GetByUserIdAsync(userId);
        return Ok(tickets);
    }

    [HttpGet("{id}", Name = "getTicketById")]
    [Authorize]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var ticket = await ticketService.GetByIdAsync(id, userId);
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
    [ProducesResponseType(typeof(CheckInResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        var userId = this.GetUserIdFromClaims();
        try
        {
            var result = await ticketService.CheckInAsync(userId, request);
            if (!result.WasAlreadyCheckedIn)
                BackgroundJob.Enqueue(() => emailService.SendCheckInConfirmationAsync(result.Ticket.Id));
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Not authorized to check in tickets for this event" });
        }
    }
}
