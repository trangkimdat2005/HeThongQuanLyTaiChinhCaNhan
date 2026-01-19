using System;
using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string UserId { get; set; } = null!;

    public string CategoryName { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string? Icon { get; set; }

    public string? Color { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual User User { get; set; } = null!;
}
