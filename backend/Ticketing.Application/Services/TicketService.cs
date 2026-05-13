using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface ITicketService
{
    Task<IEnumerable<TicketDto>> GetByUserIdAsync(Guid userId);
    Task<TicketDto?> GetByIdAsync(Guid id);
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
            @event.ImageUrl
        );
    }
}
