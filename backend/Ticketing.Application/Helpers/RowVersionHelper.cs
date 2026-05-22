namespace Ticketing.Application.Helpers;

public static class RowVersionHelper
{
    public static string? ToBase64(byte[]? rowVersion) =>
        rowVersion == null ? null : Convert.ToBase64String(rowVersion);

    public static byte[]? FromBase64(string? base64) =>
        string.IsNullOrEmpty(base64) ? null : Convert.FromBase64String(base64);
}
