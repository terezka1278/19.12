using System.Collections.Generic;

namespace Neaproject.DataObjects
{
    public class InvoiceCreateRequest
    {
        public string JobID { get; set; } = null!;

        // Itemised supplies (from Supplies table)
        public List<InvoiceItemDto> Items { get; set; } = new();

        // Extra costs entered by business
        public decimal LabourCost { get; set; }
        public decimal ExtraCost { get; set; }
    }

    public class InvoiceItemDto
    {
        public string SupplyID { get; set; } = null!;
        public decimal Quantity { get; set; }
    }
}
