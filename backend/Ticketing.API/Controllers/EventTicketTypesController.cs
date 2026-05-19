using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ticketing.Application.DTOs;
using Ticketing.Application.Services;

namespace Ticketing.API.Controllers;

[ApiController]
[Route("api/events/{eventId}/ticket-types")]
[Authorize]
public class EventTicketTypesController(ITicketTypeService ticketTypeService) : ControllerBase
{
    [HttpPost(Name = "createTicketType")]
    [ProducesResponseType(typeof(OrganizerEventTicketTypeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(Guid eventId, [FromBody] CreateEventTicketTypeRequest request)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            var result = await ticketTypeService.CreateAsync(eventId, organizerId, request);
            return CreatedAtRoute("getEventById", new { id = eventId }, result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Not your event" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }

    [HttpPut("{ticketTypeId}", Name = "updateTicketType")]
    [ProducesResponseType(typeof(OrganizerEventTicketTypeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid eventId, Guid ticketTypeId, [FromBody] UpdateEventTicketTypeRequest request)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            var result = await ticketTypeService.UpdateAsync(eventId, ticketTypeId, organizerId, request);
            if (result == null) return NotFound(new ProblemDetails { Title = "Ticket type not found" });
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Not your event" });
        }
    }

    [HttpDelete("{ticketTypeId}", Name = "deleteTicketType")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid eventId, Guid ticketTypeId)
    {
        var organizerId = this.GetUserIdFromClaims();
        try
        {
            await ticketTypeService.DeleteAsync(eventId, ticketTypeId, organizerId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new ProblemDetails { Title = "Not your event" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message });
        }
    }
}
