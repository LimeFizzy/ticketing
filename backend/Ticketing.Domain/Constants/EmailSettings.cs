namespace Ticketing.Domain.Constants;

public class EmailSettings
{
    public string FromAddress { get; set; } = "";
    public string FromName { get; set; } = "";
    public string SmtpHost { get; set; } = "";
    public int SmtpPort { get; set; } = 465;
    public string SmtpUser { get; set; } = "";
    public string SmtpPass { get; set; } = "";
    public string BaseUrl { get; set; } = "https://www.zzzz.lt";
}
