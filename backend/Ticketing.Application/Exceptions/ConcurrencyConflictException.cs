namespace Ticketing.Application.Exceptions;

public class ConcurrencyConflictException(string entityName) : InvalidOperationException(
    $"The {entityName} was modified by another user. Please refresh and try again.")
{
    public string EntityName { get; } = entityName;
}
