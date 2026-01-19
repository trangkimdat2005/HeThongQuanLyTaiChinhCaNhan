using System;
using System.Collections.Generic;

namespace HeThongQuanLyTaiChinhCaNhan.Models;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? FullName { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? Role { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? LastLogin { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<GoalDeposit> GoalDeposits { get; set; } = new List<GoalDeposit>();

    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    public virtual ICollection<Ticket> TicketRepliedByNavigations { get; set; } = new List<Ticket>();

    public virtual ICollection<Ticket> TicketUsers { get; set; } = new List<Ticket>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual ICollection<Wallet> Wallets { get; set; } = new List<Wallet>();
}
