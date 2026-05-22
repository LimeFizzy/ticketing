using System.Security.Cryptography;
using System.Text;
using Ticketing.Application.DTOs;
using Ticketing.Application.Helpers;
using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IScannerService
{
    Task<(ScannerDto Scanner, string? InviteToken)> InviteScannerAsync(Guid organizerId, InviteScannerRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<ScannerDto>> GetScannersForEventAsync(Guid organizerId, Guid eventId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ScannerDto>> GetScannersForOrganizerAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ScannerEventDto>> GetAssignedEventsAsync(Guid scannerUserId, CancellationToken cancellationToken = default);
    Task RemoveScannerAsync(Guid organizerId, Guid assignmentId, CancellationToken cancellationToken = default);
    Task<bool> IsScannerAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class ScannerService(
    IEventScannerRepository eventScannerRepository,
    IUserRepository userRepository,
    IEventRepository eventRepository) : IScannerService
{
    public async Task<(ScannerDto Scanner, string? InviteToken)> InviteScannerAsync(Guid organizerId, InviteScannerRequest request, CancellationToken cancellationToken = default)
    {
        if (request.EventId.HasValue)
        {
            var @event = await eventRepository.GetByIdAsync(request.EventId.Value, cancellationToken)
                ?? throw new KeyNotFoundException("Event not found.");

            if (@event.OrganizerId != organizerId)
                throw new UnauthorizedAccessException("You are not the organizer of this event.");
        }

        if (!request.AssignToAllEvents && !request.EventId.HasValue)
            throw new InvalidOperationException("Either EventId or AssignToAllEvents must be specified.");

        var normalizedEmail = request.Email.ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        string? inviteToken = null;
        User scannerUser;

        if (existingUser != null)
        {
            if (existingUser.Role != UserRole.Attendee)
                throw new InvalidOperationException("Cannot assign an organizer or admin as a scanner.");

            if (request.EventId.HasValue)
            {
                var alreadyAssigned = await eventScannerRepository.IsScannerForEventAsync(existingUser.Id, request.EventId.Value, cancellationToken);
                if (alreadyAssigned)
                    throw new InvalidOperationException("This user is already a scanner for this event.");
            }

            scannerUser = existingUser;
        }
        else
        {
            inviteToken = Guid.NewGuid().ToString("N");
            var hashedToken = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(inviteToken))).ToLowerInvariant();

            scannerUser = new User
            {
                FirstName = request.FirstName ?? GetFirstNameFromEmail(request.Email),
                LastName = request.LastName ?? "",
                Email = normalizedEmail,
                PasswordHash = "",
                Role = UserRole.Attendee,
                InviteToken = hashedToken,
                InviteTokenExpires = DateTime.UtcNow.AddDays(7)
            };

            await userRepository.AddAsync(scannerUser, cancellationToken);
            await userRepository.SaveChangesAsync(cancellationToken);
        }

        var assignment = new EventScanner
        {
            EventId = request.AssignToAllEvents ? null : request.EventId,
            OrganizerId = organizerId,
            ScannerUserId = scannerUser.Id,
            AssignToAllEvents = request.AssignToAllEvents
        };

        await eventScannerRepository.AddAsync(assignment, cancellationToken);
        await eventScannerRepository.SaveChangesAsync(cancellationToken);

        return (MapToDto(assignment, scannerUser), inviteToken);
    }

    public async Task<IEnumerable<ScannerDto>> GetScannersForEventAsync(Guid organizerId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken)
            ?? throw new KeyNotFoundException("Event not found.");

        if (@event.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You are not the organizer of this event.");

        var perEvent = await eventScannerRepository.GetByEventIdAsync(eventId, cancellationToken);
        var allOrganizer = await eventScannerRepository.GetByOrganizerIdAsync(organizerId, cancellationToken);
        var allEvents = allOrganizer.Where(es => es.AssignToAllEvents);

        var all = perEvent.Concat(allEvents).DistinctBy(es => es.Id);

        return all.Select(es => MapToDto(es, es.ScannerUser));
    }

    public async Task<IEnumerable<ScannerDto>> GetScannersForOrganizerAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        var assignments = await eventScannerRepository.GetByOrganizerIdAsync(organizerId, cancellationToken);
        return assignments.Select(es => MapToDto(es, es.ScannerUser));
    }

    public async Task<IEnumerable<ScannerEventDto>> GetAssignedEventsAsync(Guid scannerUserId, CancellationToken cancellationToken = default)
    {
        var assignments = await eventScannerRepository.GetByScannerUserIdAsync(scannerUserId, cancellationToken);
        var events = new Dictionary<Guid, ScannerEventDto>();

        var allOrganizerIds = assignments
            .Where(a => a.AssignToAllEvents)
            .Select(a => a.OrganizerId)
            .Distinct()
            .ToList();

        Dictionary<Guid, Event> allOrganizerEvents = [];
        if (allOrganizerIds.Count > 0)
        {
            var allEventIds = new List<Guid>();
            foreach (var oid in allOrganizerIds)
            {
                var (evts, _) = await eventRepository.GetAllAsync(new EventsQueryDto(
                    Category: null, Featured: null, City: null, Search: null,
                    Date: null, Price: null, OrganizerId: oid, Status: null
                ), cancellationToken);
                allEventIds.AddRange(evts.Select(e => e.Id));
            }

            allOrganizerEvents = await eventRepository.GetByIdsAsync(allEventIds.Distinct(), cancellationToken);
        }

        foreach (var assignment in assignments)
        {
            if (assignment.EventId.HasValue && assignment.Event != null)
            {
                if (!events.ContainsKey(assignment.EventId.Value))
                    events[assignment.EventId.Value] = MapEventToDto(assignment.Event);
            }
            else if (assignment.AssignToAllEvents)
            {
                foreach (var evt in allOrganizerEvents.Values)
                {
                    if (!events.ContainsKey(evt.Id))
                        events[evt.Id] = MapEventToDto(evt);
                }
            }
        }

        return events.Values;
    }

    public async Task RemoveScannerAsync(Guid organizerId, Guid assignmentId, CancellationToken cancellationToken = default)
    {
        var assignment = await eventScannerRepository.GetByIdAsync(assignmentId, cancellationToken)
            ?? throw new KeyNotFoundException("Scanner assignment not found.");

        if (assignment.OrganizerId != organizerId)
            throw new UnauthorizedAccessException("You did not create this scanner assignment.");

        await eventScannerRepository.DeleteAsync(assignment, cancellationToken);
        await eventScannerRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> IsScannerAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var assignments = await eventScannerRepository.GetByScannerUserIdAsync(userId, cancellationToken);
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
        !string.IsNullOrEmpty(user.PasswordHash),
        RowVersionHelper.ToBase64(assignment.RowVersion)
    );

    private static ScannerEventDto MapEventToDto(Event @event) => new(
        @event.Id,
        @event.Title,
        @event.Date,
        @event.Venue,
        @event.ImageUrl
    );

    private static string GetFirstNameFromEmail(string email)
    {
        var atIndex = email.IndexOf('@');
        return atIndex > 0 ? email[..atIndex] : email;
    }
}
