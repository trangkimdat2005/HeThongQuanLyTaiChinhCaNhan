using System;
using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Models;

public partial class GoalDeposit
{
    public int DepositId { get; set; }

    public int GoalId { get; set; }

    public string UserId { get; set; } = null!;

    public int WalletId { get; set; }

    public decimal Amount { get; set; }

    public DateTime? DepositDate { get; set; }

    public string? Note { get; set; }

    public bool? IsDelete { get; set; }

    public virtual Goal Goal { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual Wallet Wallet { get; set; } = null!;
}
