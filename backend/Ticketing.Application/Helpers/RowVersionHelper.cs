namespace Ticketing.Application.Helpers;

public static class RowVersionHelper
{
    public static string ToBase64(byte[] rowVersion) =>
        Convert.ToBase64String(rowVersion);

    public static byte[] FromBase64(string base64) =>
        Convert.FromBase64String(base64);
}
