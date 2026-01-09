using System;
using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Models;

public partial class Goal
{
    public int GoalId { get; set; }

    public string UserId { get; set; } = null!;

    public string GoalName { get; set; } = null!;

    public decimal TargetAmount { get; set; }

    public decimal? CurrentAmount { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<GoalDeposit> GoalDeposits { get; set; } = new List<GoalDeposit>();

    public virtual User User { get; set; } = null!;
}
