using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IEventService
{
    Task<EventDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<EventDto>> GetAllAsync(EventsQueryDto? filter = null);
}

public class EventService(IEventRepository eventRepository) : IEventService
{
    public async Task<EventDto?> GetByIdAsync(Guid id)
    {
        var @event = await eventRepository.GetByIdAsync(id);
        if (@event == null) return null;

        return MapToDto(@event);
    }

    public async Task<IEnumerable<EventDto>> GetAllAsync(EventsQueryDto? filter = null)
    {
        var events = await eventRepository.GetAllAsync(filter);
        return events.Select(MapToDto);
    }

    private static EventDto MapToDto(Event @event)
    {
        var disclaimers = string.IsNullOrEmpty(@event.Disclaimers)
            ? []
            : @event.Disclaimers.Split('|', StringSplitOptions.RemoveEmptyEntries);

        var ticketTypes = @event.TicketTypes
            .OrderBy(t => t.Price)
            .Select(t => new EventTicketTypeDto(t.Id, t.Name, t.Price, t.Description))
            .ToArray();

        return new EventDto(
            @event.Id,
            @event.Title,
            @event.Category,
            @event.Date,
            @event.Venue,
            @event.City,
            @event.PriceFrom,
            ticketTypes,
            @event.ImageUrl,
            @event.Description,
            @event.AvailableTickets,
            @event.Featured,
            disclaimers,
            @event.VenueMapId
        );
    }
}
