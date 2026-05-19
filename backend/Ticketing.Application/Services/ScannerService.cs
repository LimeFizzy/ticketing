using Ticketing.Application.DTOs;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IScannerService
{
    Task<(ScannerDto Scanner, string? InviteToken)> InviteScannerAsync(Guid organizerId, InviteScannerRequest request);
    Task<IEnumerable<ScannerDto>> GetScannersForEventAsync(Guid organizerId, Guid eventId);
    Task<IEnumerable<ScannerDto>> GetScannersForOrganizerAsync(Guid organizerId);
    Task<IEnumerable<ScannerEventDto>> GetAssignedEventsAsync(Guid scannerUserId);
    Task RemoveScannerAsync(Guid organizerId, Guid assignmentId);
    Task<bool> IsScannerAsync(Guid userId);
}

public class ScannerService(
    IEventScannerRepository eventScannerRepository,
    IUserRepository userRepository,
    IEventRepository eventRepository) : IScannerService
{
    public async Task<(ScannerDto Scanner, string? InviteToken)> InviteScannerAsync(Guid organizerId, InviteScannerRequest request)
    {
        if (request.EventId.HasValue)
        {
            var @event = await eventRepository.GetByIdAsync(request.EventId.Value)
                ?? throw new KeyNotFoundException("Event not found.");

            if (@event.OrganizerId != organizerId)
                throw new UnauthorizedAccessException("You are not the organizer of this event.");
        }

        if (!request.AssignToAllEvents && !request.EventId.HasValue)
            throw new InvalidOperationException("Either EventId or AssignToAllEvents must be specified.");

        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        string? inviteToken = null;
        User scannerUser;

        if (existingUser != null)
        {
            if (existingUser.Role != UserRole.Attendee)
                throw new InvalidOperationException("Cannot assign an organizer or admin as a scanner.");

            if (request.EventId.HasValue)
            {
                var alreadyAssigned = await eventScannerRepository.IsScannerForEventAsync(existingUser.Id, request.EventId.Value);
                if (alreadyAssigned)
                    throw new InvalidOperationException("This user is already a scanner for this event.");
            }

            scannerUser = existingUser;
        }
        else
        {
            inviteToken = Guid.NewGuid().ToString("N");

            scannerUser = new User
            {
                FirstName = request.FirstName ?? request.Email.Split('@')[0],
                LastName = request.LastName ?? "",
                Email = request.Email,
                PasswordHash = "",
                Role = UserRole.Attendee,
                InviteToken = inviteToken,
                InviteTokenExpires = DateTime.UtcNow.AddDays(7)
            };

            await userRepository.AddAsync(scannerUser);
            await userRepository.SaveChangesAsync();
        }

        var assignment = new EventScanner
        {
            EventId = request.AssignToAllEvents ? null : request.EventId,
            OrganizerId = organizerId,
            ScannerUserId = scannerUser.Id,
            AssignToAllEvents = request.AssignToAllEvents
        };

        await eventScannerRepository.AddAsync(assignment);
        await eventScannerRepository.SaveChangesAsync();

        return (MapToDto(assignment, scannerUser), inviteToken);
    }

    public async Task<IEnumerable<ScannerDto>> GetScannersForEventAsync(Guid organizerId, Guid eventId)
    {
        var @event = await eventRepository.GetByIdAsync(eventId)
            ?? throw new KeyNotFoundException("Event not found.");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event.");

        var perEvent = await eventScannerRepository.GetByEventIdAsync(eventId);
        var allOrganizer = await eventScannerRepository.GetByOrganizerIdAsync(organizerId);
        var allEvents = allOrganizer.Where(es => es.AssignToAllEvents);

        var all = perEvent.Concat(allEvents).DistinctBy(es => es.Id);

        return all.Select(es => MapToDto(es, es.ScannerUser));
    }

    public async Task<IEnumerable<ScannerDto>> GetScannersForOrganizerAsync(Guid organizerId)
    {
        var assignments = await eventScannerRepository.GetByOrganizerIdAsync(organizerId);
        return assignments.Select(es => MapToDto(es, es.ScannerUser));
    }

    public async Task<IEnumerable<ScannerEventDto>> GetAssignedEventsAsync(Guid scannerUserId)
    {
        var assignments = await eventScannerRepository.GetByScannerUserIdAsync(scannerUserId);
        var events = new Dictionary<Guid, ScannerEventDto>();

        foreach (var assignment in assignments)
        {
            if (assignment.EventId.HasValue && assignment.Event != null)
            {
                if (!events.ContainsKey(assignment.EventId.Value))
                    events[assignment.EventId.Value] = MapEventToDto(assignment.Event);
            }
            else if (assignment.AssignToAllEvents)
            {
                var (organizerEvents, _) = await eventRepository.GetAllAsync(new EventsQueryDto(
                    Category: null, Featured: null, City: null, Search: null,
                    Date: null, Price: null, OrganizerId: assignment.OrganizerId, Status: null
                ));

                foreach (var evt in organizerEvents)
                {
                    if (!events.ContainsKey(evt.Id))
                        events[evt.Id] = MapEventToDto(evt);
                }
            }
        }

        return events.Values;
    }

    public async Task RemoveScannerAsync(Guid organizerId, Guid assignmentId)
    {
        var assignment = await eventScannerRepository.GetByIdAsync(assignmentId)
            ?? throw new KeyNotFoundException("Scanner assignment not found.");

        if (assignment.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You did not create this scanner assignment.");

        await eventScannerRepository.DeleteAsync(assignment);
        await eventScannerRepository.SaveChangesAsync();
    }

    public async Task<bool> IsScannerAsync(Guid userId)
    {
        var assignments = await eventScannerRepository.GetByScannerUserIdAsync(userId);
        return assignments.Any();
    }

    private static ScannerDto MapToDto(EventScanner assignment, User user) => new(
        assignment.Id,
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        assignment.EventId,
        assignment.Event?.Title,
        assignment.AssignToAllEvents,
        !string.IsNullOrEmpty(user.PasswordHash)
    );

    private static ScannerEventDto MapEventToDto(Event @event) => new(
        @event.Id,
        @event.Title,
        @event.Date,
        @event.Venue,
        @event.ImageUrl
    );
}
