using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class ClientBooking
    {
        public string JobID { get; set; } = "";
        public string ServiceName { get; set; } = "";
        public DateTime ScheduledDate { get; set; }
        public bool TimeSlotPm { get; set; }  // matches Appointments.TimeSlot (BOOL)
        public string Status { get; set; } = ""; // Jobs.Status (Not started / In progress / Completed)
        public float? EstPrice { get; set; }  // from Quotes.EstPrice if exists
    
    }

    public class NextBooking
    {
        public bool HasBooking { get; set; }
        public string JobID { get; set; } = "";
        public string ServiceName { get; set; } = "";
        public DateTime? ScheduledDate { get; set; }
        public bool? TimeSlotPm { get; set; }
        public string Status { get; set; } = "";
    }
    public class ClientQuote
    {
        public string QuoteID { get; set; } = "";
        public string JobID { get; set; } = "";
        public string ServiceName { get; set; } = "";
        public float EstPrice { get; set; }
        public float EstDuration { get; set; }
        public int Accepted { get; set; }   // 0/1 from DB
    }

    public class ClientInvoice
    {
        public string InvoiceID { get; set; } = "";
        public string JobID { get; set; } = "";
        public string ServiceName { get; set; } = "";
        public float FinalPrice { get; set; }
        public string PaymentStatus { get; set; } = "";
        public float DepositPaid { get; set; }
    }
}

