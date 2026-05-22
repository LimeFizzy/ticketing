using Ticketing.Application.DTOs;
using Ticketing.Application.Helpers;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface ITicketService
{
    Task<IEnumerable<TicketDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<TicketDto?> GetByIdAsync(Guid id, Guid requestingUserId, CancellationToken cancellationToken = default);
    Task<CheckInResponse> CheckInAsync(Guid userId, CheckInRequest request, CancellationToken cancellationToken = default);
}

public class TicketService(ITicketRepository ticketRepository, IEventScannerRepository eventScannerRepository) : ITicketService
{
    public async Task<IEnumerable<TicketDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tickets = await ticketRepository.GetByUserIdAsync(userId, cancellationToken);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(Guid id, Guid requestingUserId, CancellationToken cancellationToken = default)
    {
        var ticket = await ticketRepository.GetByIdAsync(id, cancellationToken);
        if (ticket == null) return null;

        if (ticket.UserId != requestingUserId)
            throw new UnauthorizedAccessException("You do not have access to this ticket.");

        return MapToDto(ticket);
    }

    public async Task<CheckInResponse> CheckInAsync(Guid userId, CheckInRequest request, CancellationToken cancellationToken = default)
    {
        var ticket = await ticketRepository.GetByCodeForCheckInAsync(request.TicketCode, cancellationToken)
            ?? throw new KeyNotFoundException("Ticket not found.");

        var @event = ticket.Order.Event;

        if (@event.Id != request.EventId)
            throw new InvalidOperationException("Ticket does not belong to this event.");

        var isOrganizer = @event.OrganizerId == userId;
        var isScanner = await eventScannerRepository.IsScannerForEventAsync(userId, @event.Id, cancellationToken);
        if (!isOrganizer && !isScanner)
            throw new UnauthorizedAccessException("You are not authorized to check in tickets for this event.");

        if (ticket.CheckedInAt.HasValue)
            return new CheckInResponse(MapToDto(ticket), WasAlreadyCheckedIn: true);

        ticket.Status = TicketStatus.CheckedIn;
        ticket.CheckedInAt = DateTime.UtcNow;
        await ticketRepository.SaveChangesAsync(cancellationToken);

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
            RowVersionHelper.ToBase64(ticket.RowVersion),
            ticket.CheckedInAt,
            ticket.VenueMapPlaceId,
            ticket.VenueMapPlace?.Label
        );
    }
}
