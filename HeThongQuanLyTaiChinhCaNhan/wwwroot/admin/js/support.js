// Dữ liệu giả (Mock Tickets)
var mockTickets = [
    {
        TicketID: 101,
        UserID: "user-01",
        UserName: "Nguyễn Văn A",
        UserEmail: "nguyenvana@test.com",
        Avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random",
        QuestionType: "Technical Issue",
        RespondType: "Email",
        Description: "Tôi không thể thay đổi icon của ví tiền, hệ thống báo lỗi 500 khi bấm nút lưu.",
        Status: "Open",
        CreatedAt: "2026-01-10 09:30"
    },
    {
        TicketID: 102,
        UserID: "user-02",
        UserName: "Trần Thị B",
        UserEmail: "tranthib@test.com",
        Avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=random",
        QuestionType: "Account",
        RespondType: "Phone",
        Description: "Tôi muốn đổi email đăng nhập do email cũ bị mất mật khẩu.",
        Status: "Pending",
        CreatedAt: "2026-01-09 14:15"
    },
    {
        TicketID: 103,
        UserID: "user-01",
        UserName: "Nguyễn Văn A",
        UserEmail: "nguyenvana@test.com",
        Avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random",
        QuestionType: "Payment",
        RespondType: "Email",
        Description: "Tôi đã nạp VIP nhưng chưa thấy kích hoạt.",
        Status: "Resolved",
        CreatedAt: "2026-01-08 10:00"
    }
];

var table;
var currentTicketId = null;

$(document).ready(function () {

    // 1. Khởi tạo DataTable
    table = $('#tableTicket').DataTable({
        data: mockTickets,
        columns: [
            {
                data: 'TicketID',
                render: function (data) { return `<span class="fw-bold text-muted">#${data}</span>`; }
            },
            {
                data: 'UserName', // Hiển thị User + Email
                render: function (data, type, row) {
                    return `
                        <div class="d-flex align-items-center">
                            <img src="${row.Avatar}" class="rounded-circle me-2" width="30">
                            <div>
                                <div class="fw-bold text-dark" style="font-size: 0.9rem;">${data}</div>
                                <div class="text-muted small" style="font-size: 0.75rem;">${row.UserEmail}</div>
                            </div>
                        </div>
                    `;
                }
            },
            {
                data: 'QuestionType',
                render: function (data) { return `<span class="badge bg-light text-dark border">${data}</span>`; }
            },
            {
                data: 'Description',
                render: function (data) {
                    // Cắt ngắn nội dung nếu dài quá 50 ký tự
                    return data.length > 50 ? data.substr(0, 50) + '...' : data;
                }
            },
            {
                data: 'Status',
                render: function (data) {
                    // Map class CSS theo status
                    return `<span class="badge badge-status-${data} px-3 py-1 rounded-pill">${getStatusVN(data)}</span>`;
                }
            },
            { data: 'CreatedAt', render: function (data) { return `<span class="small text-muted">${data}</span>`; } },
            {
                data: null,
                className: "text-end",
                render: function (data, type, row) {
                    return `<button class="btn btn-sm btn-outline-primary fw-bold" onclick="openTicketModal(${row.TicketID})">Chi tiết</button>`;
                }
            }
        ],
        order: [[5, 'desc']], // Sắp xếp ngày mới nhất lên đầu
        language: { search: "Tìm kiếm:", lengthMenu: "Hiện _MENU_", info: "Trang _PAGE_ / _PAGES_", paginate: { first: "«", last: "»", next: "›", previous: "‹" } }
    });

    // 2. Xử lý Bộ lọc
    $('#filterStatus').on('change', function () {
        table.column(4).search($(this).val()).draw(); // Cột 4 là Status
    });

    $('#filterType').on('change', function () {
        table.column(2).search($(this).val()).draw(); // Cột 2 là Type
    });
});

// --- CÁC HÀM XỬ LÝ ---

// Helper: Dịch Status sang tiếng Việt
function getStatusVN(status) {
    if (status === 'Open') return 'Chưa xử lý';
    if (status === 'Pending') return 'Đang chờ';
    if (status === 'Resolved') return 'Đã xong';
    return status;
}

// 1. Mở Modal Chi tiết
function openTicketModal(id) {
    var ticket = mockTickets.find(x => x.TicketID === id);
    if (!ticket) return;

    currentTicketId = id;

    // Đổ dữ liệu vào Modal
    $('#modalTicketID').text(ticket.TicketID);
    $('#modalUserName').text(ticket.UserName);
    $('#modalUserEmail').text(ticket.UserEmail);
    $('#modalAvatar').attr('src', ticket.Avatar);
    $('#modalType').text(ticket.QuestionType);
    $('#modalDate').text(ticket.CreatedAt);
    $('#modalDesc').text(ticket.Description);
    $('#modalRespondType').text(ticket.RespondType);
    $('#modalStatusSelect').val(ticket.Status);

    var myModal = new bootstrap.Modal(document.getElementById('ticketModal'));
    myModal.show();
}

// 2. Gửi phản hồi (Update Status)
function submitReply() {
    var newStatus = $('#modalStatusSelect').val();

    // Đóng Modal
    bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();

    // Loading & Success
    Swal.fire({
        title: 'Đang gửi phản hồi...',
        timer: 1500,
        didOpen: () => { Swal.showLoading() }
    }).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Đã cập nhật!',
            text: `Ticket #${currentTicketId} đã chuyển sang trạng thái: ${getStatusVN(newStatus)}`,
        }).then(() => {
            // Cập nhật lại dữ liệu trong bảng (Giả lập)
            var ticketIndex = mockTickets.findIndex(x => x.TicketID === currentTicketId);
            if (ticketIndex !== -1) {
                mockTickets[ticketIndex].Status = newStatus;
                table.clear().rows.add(mockTickets).draw(); // Redraw table
            }
        });
    });
}

function refreshTable() {
    table.search('').columns().search('').draw();
    $('#filterStatus').val('');
    $('#filterType').val('');
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Đã làm mới dữ liệu', showConfirmButton: false, timer: 1500 });
}