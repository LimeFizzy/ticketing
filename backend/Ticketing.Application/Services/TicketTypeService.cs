using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface ITicketTypeService
{
    Task<OrganizerEventTicketTypeDto> CreateAsync(Guid eventId, Guid organizerId, CreateEventTicketTypeRequest request);
    Task<OrganizerEventTicketTypeDto?> UpdateAsync(Guid ticketTypeId, Guid organizerId, UpdateEventTicketTypeRequest request);
    Task DeleteAsync(Guid ticketTypeId, Guid organizerId);
}

public class TicketTypeService(
    IEventTicketTypeRepository ticketTypeRepository,
    IEventRepository eventRepository) : ITicketTypeService
{
    public async Task<OrganizerEventTicketTypeDto> CreateAsync(Guid eventId, Guid organizerId, CreateEventTicketTypeRequest request)
    {
        var @event = await eventRepository.GetByIdAsync(eventId)
            ?? throw new InvalidOperationException("Event not found");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Not your event");

        var ticketType = new EventTicketType
        {
            Name = request.Name,
            Price = request.Price,
            Description = request.Description,
            Capacity = request.Capacity,
            EventId = eventId
        };

        var created = await ticketTypeRepository.CreateAsync(ticketType);

        return new OrganizerEventTicketTypeDto(
            created.Id, created.Name, created.Price, created.Description, created.Capacity, 0
        );
    }

    public async Task<OrganizerEventTicketTypeDto?> UpdateAsync(Guid ticketTypeId, Guid organizerId, UpdateEventTicketTypeRequest request)
    {
        var ticketType = await ticketTypeRepository.GetByIdAsync(ticketTypeId);
        if (ticketType == null) return null;

        var @event = await eventRepository.GetByIdAsync(ticketType.EventId);
        if (@event == null || @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Not your event");

        var sold = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId);
        if (request.Capacity < sold)
            throw new InvalidOperationException($"Capacity cannot be less than {sold} (tickets already sold)");

        ticketType.Name = request.Name;
        ticketType.Price = request.Price;
        ticketType.Description = request.Description;
        ticketType.Capacity = request.Capacity;

        await ticketTypeRepository.UpdateAsync(ticketType);

        var soldAfterUpdate = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId);

        return new OrganizerEventTicketTypeDto(
            ticketType.Id, ticketType.Name, ticketType.Price, ticketType.Description, ticketType.Capacity, soldAfterUpdate
        );
    }

    public async Task DeleteAsync(Guid ticketTypeId, Guid organizerId)
    {
        var ticketType = await ticketTypeRepository.GetByIdAsync(ticketTypeId)
            ?? throw new InvalidOperationException("Ticket type not found");

        var @event = await eventRepository.GetByIdAsync(ticketType.EventId);
        if (@event == null || @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Not your event");

        var sold = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId);
        if (sold > 0)
            throw new InvalidOperationException($"Cannot delete ticket type with {sold} sold tickets");

        await ticketTypeRepository.DeleteAsync(ticketTypeId);
    }
}
