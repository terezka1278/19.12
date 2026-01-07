namespace Neaproject.Models
{
    public class Job
    {
        public string JobID { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Postcode { get; set; } = string.Empty;
    }
}
