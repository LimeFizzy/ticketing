using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IEventService
{
    Task<EventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PaginatedResult<EventDto>> GetAllAsync(EventsQueryDto? filter = null, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<EventDto> CreateAsync(Guid organizerId, CreateEventRequest request, CancellationToken cancellationToken = default);
    Task<EventDto?> UpdateAsync(Guid eventId, Guid organizerId, UpdateEventRequest request, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid eventId, Guid organizerId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<EventDto?> SetFeaturedAsync(Guid eventId, bool featured, uint rowVersion, CancellationToken cancellationToken = default);
}

public class EventService(
    IEventRepository eventRepository,
    IEventTicketTypeRepository ticketTypeRepository,
    IReviewRepository reviewRepository) : IEventService
{
    public async Task<EventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(id, cancellationToken);
        if (@event == null) return null;

        return await MapToDtoAsync(@event, cancellationToken);
    }

    public async Task<PaginatedResult<EventDto>> GetAllAsync(EventsQueryDto? filter = null, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var (events, totalCount) = await eventRepository.GetAllAsync(filter, isAdmin, cancellationToken);
        var eventList = events.ToList();

        var page = Math.Max(filter?.Page ?? 1, 1);
        var pageSize = Math.Clamp(filter?.PageSize ?? 20, 1, 100);

        var allTypeIds = eventList.SelectMany(e => e.TicketTypes.Select(t => t.Id)).ToList();
        var soldCounts = allTypeIds.Count > 0
            ? await ticketTypeRepository.GetSoldCountsBatchAsync(allTypeIds, cancellationToken)
            : [];

        var eventIds = eventList.Select(e => e.Id).ToList();
        var ratings = eventIds.Count > 0
            ? await reviewRepository.GetRatingsBatchAsync(eventIds, cancellationToken)
            : [];

        var dtos = eventList.Select(e => MapToDto(e, soldCounts, ratings)).ToList();

        return new PaginatedResult<EventDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<EventDto> CreateAsync(Guid organizerId, CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Date <= DateTime.UtcNow)
            throw new InvalidOperationException("Event date must be in the future");

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

        var created = await eventRepository.CreateAsync(@event, cancellationToken);
        return await MapToDtoAsync(created, cancellationToken);
    }

    public async Task<EventDto?> UpdateAsync(Guid eventId, Guid organizerId, UpdateEventRequest request, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (@event == null) return null;

        if (!isAdmin && @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Event not found or not owned by you");

        if (request.Date <= DateTime.UtcNow)
            throw new InvalidOperationException("Event date must be in the future");

        @event.RowVersion = request.RowVersion;
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

        await eventRepository.UpdateAsync(@event, cancellationToken);

        return await MapToDtoAsync(@event, cancellationToken);
    }

    public async Task SoftDeleteAsync(Guid eventId, Guid organizerId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken) ?? throw new KeyNotFoundException("Event not found");
        if (!isAdmin && @event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("Event not found or not owned by you");

        await eventRepository.SoftDeleteAsync(eventId, cancellationToken);
    }

    public async Task<EventDto?> SetFeaturedAsync(Guid eventId, bool featured, uint rowVersion, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (@event == null) return null;

        @event.RowVersion = rowVersion;
        @event.Featured = featured;
        await eventRepository.UpdateAsync(@event, cancellationToken);

        return await MapToDtoAsync(@event, cancellationToken);
    }

    private async Task<EventDto> MapToDtoAsync(Event @event, CancellationToken cancellationToken)
    {
        var disclaimers = string.IsNullOrEmpty(@event.Disclaimers)
            ? []
            : @event.Disclaimers.Split('|', StringSplitOptions.RemoveEmptyEntries);

        var types = @event.TicketTypes.OrderBy(t => t.Price).ToList();
        var soldCounts = await ticketTypeRepository.GetSoldCountsBatchAsync(types.Select(t => t.Id), cancellationToken);

        var ticketTypes = types.Select(t =>
        {
            var sold = soldCounts.GetValueOrDefault(t.Id);
            return new EventTicketTypeDto(t.Id, t.Name, t.Price, t.Description, t.Capacity, sold, t.RowVersion);
        }).ToArray();

        var availableTickets = ticketTypes.Sum(t => t.Capacity - t.Sold);
        var availableTypes = ticketTypes.Where(t => t.Capacity > t.Sold).ToList();
        var priceFrom = availableTypes.Count > 0 ? availableTypes.Min(t => t.Price) : 0;

        var (avgRating, reviewCount) = await reviewRepository.GetRatingStatsAsync(@event.Id, cancellationToken);

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
            @event.RowVersion,
            disclaimers,
            @event.VenueMapId,
            @event.Status,
            @event.TimeZone,
            reviewCount > 0 ? Math.Round(avgRating, 1) : null,
            reviewCount
        );
    }

    private static EventDto MapToDto(Event @event, Dictionary<Guid, int> soldCounts, Dictionary<Guid, (double AvgRating, int Count)> ratings)
    {
        var disclaimers = string.IsNullOrEmpty(@event.Disclaimers)
            ? []
            : @event.Disclaimers.Split('|', StringSplitOptions.RemoveEmptyEntries);

        var types = @event.TicketTypes.OrderBy(t => t.Price).ToList();

        var ticketTypes = types.Select(t =>
        {
            var sold = soldCounts.GetValueOrDefault(t.Id);
            return new EventTicketTypeDto(t.Id, t.Name, t.Price, t.Description, t.Capacity, sold, t.RowVersion);
        }).ToArray();

        var availableTickets = ticketTypes.Sum(t => t.Capacity - t.Sold);
        var availableTypes = ticketTypes.Where(t => t.Capacity > t.Sold).ToList();
        var priceFrom = availableTypes.Count > 0 ? availableTypes.Min(t => t.Price) : 0;

        var rating = ratings.GetValueOrDefault(@event.Id);
        var avgRating = rating.AvgRating;
        var reviewCount = rating.Count;

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
            @event.RowVersion,
            disclaimers,
            @event.VenueMapId,
            @event.Status,
            @event.TimeZone,
            reviewCount > 0 ? Math.Round(avgRating, 1) : null,
            reviewCount
        );
    }
}
