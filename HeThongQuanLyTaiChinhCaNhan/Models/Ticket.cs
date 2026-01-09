using System;
using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Models;

public partial class Ticket
{
    public int TicketId { get; set; }

    public string UserId { get; set; } = null!;

    public string QuestionType { get; set; } = null!;

    public string RespondType { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
