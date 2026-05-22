using Ticketing.Application.DTOs;
using Ticketing.Application.Helpers;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface ITicketTypeService
{
    Task<OrganizerEventTicketTypeDto> CreateAsync(Guid eventId, Guid organizerId, CreateEventTicketTypeRequest request, CancellationToken cancellationToken = default);
    Task<OrganizerEventTicketTypeDto?> UpdateAsync(Guid eventId, Guid ticketTypeId, Guid organizerId, UpdateEventTicketTypeRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid eventId, Guid ticketTypeId, Guid organizerId, CancellationToken cancellationToken = default);
}

public class TicketTypeService(
    IEventTicketTypeRepository ticketTypeRepository,
    IEventRepository eventRepository) : ITicketTypeService
{
    public async Task<OrganizerEventTicketTypeDto> CreateAsync(Guid eventId, Guid organizerId, CreateEventTicketTypeRequest request, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken)
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

        var created = await ticketTypeRepository.CreateAsync(ticketType, cancellationToken);

        return new OrganizerEventTicketTypeDto(
            created.Id, created.Name, created.Price, created.Description, created.Capacity, 0,
            RowVersionHelper.ToBase64(created.RowVersion)
        );
    }

    public async Task<OrganizerEventTicketTypeDto?> UpdateAsync(Guid eventId, Guid ticketTypeId, Guid organizerId, UpdateEventTicketTypeRequest request, CancellationToken cancellationToken = default)
    {
        var ticketType = await ticketTypeRepository.GetByIdAsync(ticketTypeId, cancellationToken);
        if (ticketType == null) return null;

        if (ticketType.EventId != eventId)
            throw new UnauthorizedAccessException("Ticket type does not belong to this event");

        var @event = await eventRepository.GetByIdAsync(ticketType.EventId, cancellationToken);
        if (@event == null || @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Not your event");

        var sold = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId, cancellationToken);
        if (request.Capacity < sold)
            throw new InvalidOperationException($"Capacity cannot be less than {sold} (tickets already sold)");

        ticketType.RowVersion = RowVersionHelper.FromBase64(request.RowVersion);
        ticketType.Name = request.Name;
        ticketType.Price = request.Price;
        ticketType.Description = request.Description;
        ticketType.Capacity = request.Capacity;

        await ticketTypeRepository.UpdateAsync(ticketType, cancellationToken);

        var soldAfterUpdate = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId, cancellationToken);

        return new OrganizerEventTicketTypeDto(
            ticketType.Id, ticketType.Name, ticketType.Price, ticketType.Description, ticketType.Capacity, soldAfterUpdate,
            RowVersionHelper.ToBase64(ticketType.RowVersion)
        );
    }

    public async Task DeleteAsync(Guid eventId, Guid ticketTypeId, Guid organizerId, CancellationToken cancellationToken = default)
    {
        var ticketType = await ticketTypeRepository.GetByIdAsync(ticketTypeId, cancellationToken)
            ?? throw new InvalidOperationException("Ticket type not found");

        if (ticketType.EventId != eventId)
            throw new UnauthorizedAccessException("Ticket type does not belong to this event");

        var @event = await eventRepository.GetByIdAsync(ticketType.EventId, cancellationToken);
        if (@event == null || @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Not your event");

        var sold = await ticketTypeRepository.GetSoldCountAsync(ticketTypeId, cancellationToken);
        if (sold > 0)
            throw new InvalidOperationException($"Cannot delete ticket type with {sold} sold tickets");

        await ticketTypeRepository.DeleteAsync(ticketTypeId, cancellationToken);
    }
}
