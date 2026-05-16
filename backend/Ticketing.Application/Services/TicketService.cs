using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface ITicketService
{
    Task<IEnumerable<TicketDto>> GetByUserIdAsync(Guid userId);
    Task<TicketDto?> GetByIdAsync(Guid id);
    Task<CheckInResponse> CheckInAsync(Guid organizerId, CheckInRequest request);
}

public class TicketService(ITicketRepository ticketRepository) : ITicketService
{
    public async Task<IEnumerable<TicketDto>> GetByUserIdAsync(Guid userId)
    {
        var tickets = await ticketRepository.GetByUserIdAsync(userId);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(Guid id)
    {
        var ticket = await ticketRepository.GetByIdAsync(id);
        if (ticket == null) return null;
        return MapToDto(ticket);
    }

    public async Task<CheckInResponse> CheckInAsync(Guid organizerId, CheckInRequest request)
    {
        var ticket = await ticketRepository.GetByCodeWithEventAsync(request.TicketCode)
            ?? throw new KeyNotFoundException("Ticket not found.");

        var @event = ticket.Order.Event;

        if (@event.Id != request.EventId)
            throw new InvalidOperationException("Ticket does not belong to this event.");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event.");

        if (ticket.CheckedInAt.HasValue)
            return new CheckInResponse(MapToDto(ticket), WasAlreadyCheckedIn: true);

        ticket.Status = "CheckedIn";
        ticket.CheckedInAt = DateTime.UtcNow;
        await ticketRepository.SaveChangesAsync();

        return new CheckInResponse(MapToDto(ticket), WasAlreadyCheckedIn: false);
    }

    private static TicketDto MapToDto(Ticket ticket)
    {
        var @event = ticket.Order.Event;
        return new TicketDto(
            ticket.Id,
            ticket.TicketCode,
            @event.Id,
            ticket.EventTicketTypeId,
            @event.Title,
            ticket.EventTicketType.Name,
            ticket.PricePaid,
            ticket.Status,
            @event.Date,
            @event.Venue,
            @event.City,
            @event.ImageUrl,
            ticket.CheckedInAt,
            ticket.VenueMapPlaceId,
            ticket.VenueMapPlace?.Label
        );
    }
}
