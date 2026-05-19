using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IEventService
{
    Task<EventDto?> GetByIdAsync(Guid id);
    Task<PaginatedResult<EventDto>> GetAllAsync(EventsQueryDto? filter = null);
    Task<EventDto> CreateAsync(Guid organizerId, CreateEventRequest request);
    Task<EventDto?> UpdateAsync(Guid eventId, Guid organizerId, UpdateEventRequest request);
    Task SoftDeleteAsync(Guid eventId, Guid organizerId);
}

public class EventService(
    IEventRepository eventRepository,
    IEventTicketTypeRepository ticketTypeRepository,
    IReviewRepository reviewRepository) : IEventService
{
    public async Task<EventDto?> GetByIdAsync(Guid id)
    {
        var @event = await eventRepository.GetByIdAsync(id);
        if (@event == null) return null;

        return await MapToDtoAsync(@event);
    }

    public async Task<PaginatedResult<EventDto>> GetAllAsync(EventsQueryDto? filter = null)
    {
        var (events, totalCount) = await eventRepository.GetAllAsync(filter);
        var dtos = new List<EventDto>();
        foreach (var e in events)
            dtos.Add(await MapToDtoAsync(e));

        var page = Math.Max(filter?.Page ?? 1, 1);
        var pageSize = Math.Clamp(filter?.PageSize ?? 20, 1, 100);

        return new PaginatedResult<EventDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<EventDto> CreateAsync(Guid organizerId, CreateEventRequest request)
    {
        var @event = new Event
        {
            Title = request.Title,
            Category = request.Category,
            Date = request.Date,
            Venue = request.Venue,
            City = request.City,
            ImageUrl = request.ImageUrl ?? "https://placehold.co/600x400/1e3a5f/ffffff?text=Event",
            Description = request.Description ?? "",
            Status = request.Status == default ? EventStatus.Draft : request.Status,
            OrganizerId = organizerId,
            TimeZone = request.TimeZone,
            PriceFrom = request.TicketTypes?.Length > 0
                ? request.TicketTypes.Min(t => t.Price)
                : 0,
            AvailableTickets = request.TicketTypes?.Sum(t => t.Capacity) ?? 0,
            TicketTypes = request.TicketTypes?.Select(t => new EventTicketType
            {
                Name = t.Name,
                Price = t.Price,
                Description = t.Description,
                Capacity = t.Capacity
            }).ToList() ?? []
        };

        var created = await eventRepository.CreateAsync(@event);
        return await MapToDtoAsync(created);
    }

    public async Task<EventDto?> UpdateAsync(Guid eventId, Guid organizerId, UpdateEventRequest request)
    {
        var @event = await eventRepository.GetByIdAsync(eventId);
        if (@event == null || @event.OrganizerId != organizerId) return null;

        @event.Title = request.Title;
        @event.Category = request.Category;
        @event.Date = request.Date;
        @event.Venue = request.Venue;
        @event.City = request.City;
        @event.ImageUrl = request.ImageUrl ?? @event.ImageUrl;
        @event.Description = request.Description ?? @event.Description;
        @event.Featured = request.Featured;
        @event.Disclaimers = request.Disclaimers;
        @event.VenueMapId = request.VenueMapId;
        @event.Status = request.Status;
        @event.TimeZone = request.TimeZone;

        await eventRepository.UpdateAsync(@event);
        return await MapToDtoAsync(@event);
    }

    public async Task SoftDeleteAsync(Guid eventId, Guid organizerId)
    {
        var @event = await eventRepository.GetByIdAsync(eventId);
        if (@event == null || @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Event not found or not owned by you");

        await eventRepository.SoftDeleteAsync(eventId);
    }

    private async Task<EventDto> MapToDtoAsync(Event @event)
    {
        var disclaimers = string.IsNullOrEmpty(@event.Disclaimers)
            ? []
            : @event.Disclaimers.Split('|', StringSplitOptions.RemoveEmptyEntries);

        var types = @event.TicketTypes.OrderBy(t => t.Price).ToList();
        var soldCounts = await ticketTypeRepository.GetSoldCountsBatchAsync(types.Select(t => t.Id));

        var ticketTypes = types.Select(t =>
        {
            var sold = soldCounts.GetValueOrDefault(t.Id);
            return new EventTicketTypeDto(t.Id, t.Name, t.Price, t.Description, t.Capacity, sold);
        }).ToArray();

        var availableTickets = ticketTypes.Sum(t => t.Capacity - t.Sold);
        var availableTypes = ticketTypes.Where(t => t.Capacity > t.Sold).ToList();
        var priceFrom = availableTypes.Count > 0 ? availableTypes.Min(t => t.Price) : 0;

        var avgRating = await reviewRepository.GetAverageRatingAsync(@event.Id);
        var reviewCount = await reviewRepository.GetReviewCountAsync(@event.Id);

        return new EventDto(
            @event.Id,
            @event.Title,
            @event.Category,
            @event.Date,
            @event.Venue,
            @event.City,
            priceFrom,
            ticketTypes,
            @event.ImageUrl,
            @event.Description,
            availableTickets,
            @event.Featured,
            disclaimers,
            @event.VenueMapId,
            @event.Status,
            @event.OrganizerId,
            @event.TimeZone,
            reviewCount > 0 ? Math.Round(avgRating, 1) : null,
            reviewCount
        );
    }
}
