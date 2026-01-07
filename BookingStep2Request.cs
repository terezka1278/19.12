using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class BookingStep2Request
    {
        public string JobId { get; set; } = string.Empty;
        public List<string> Days { get; set; } = new List<string>();
    }

    public class BookingStep2ConfirmRequest
    {
        public string JobId { get; set; } = string.Empty;
        public string SelectedDate { get; set; } = string.Empty;
        public string SelectedSlot { get; set; } = string.Empty;
    }
}
