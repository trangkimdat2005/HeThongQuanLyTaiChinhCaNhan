// 1. MOCK DATA (Chỉ vé của User hiện tại)
var mockMyTickets = [
    {
        id: 101,
        type: "Technical Issue",
        respond: "Email",
        desc: "Tôi không thể thay đổi icon của ví tiền, hệ thống báo lỗi 500 khi bấm nút lưu.",
        status: "Open",
        date: "2026-01-10 09:30"
    },
    {
        id: 103,
        type: "Payment",
        respond: "Email",
        desc: "Tôi đã nạp VIP nhưng chưa thấy kích hoạt. Mã giao dịch #MOMO123456.",
        status: "Resolved",
        date: "2026-01-08 10:00"
    }
];

var createModal, viewModal;

$(document).ready(function () {
    renderTickets();
    calculateStats();
});

// 2. RENDER TABLE
function renderTickets() {
    var html = '';
    if (mockMyTickets.length === 0) {
        html = `<tr><td colspan="6" class="text-center py-4 text-muted">Bạn chưa gửi yêu cầu hỗ trợ nào.</td></tr>`;
    } else {
        mockMyTickets.forEach(t => {
            // Xác định class màu cho status
            var badgeClass = 'badge-soft-primary'; // Open
            var statusText = 'Đã tiếp nhận';

            if (t.status === 'Pending') {
                badgeClass = 'badge-soft-warning';
                statusText = 'Đang xử lý';
            } else if (t.status === 'Resolved') {
                badgeClass = 'badge-soft-success';
                statusText = 'Đã xong';
            }

            // Cắt ngắn mô tả
            var shortDesc = t.desc.length > 50 ? t.desc.substring(0, 50) + '...' : t.desc;

            html += `
            <tr onclick="openViewModal(${t.id})">
                <td class="ps-4 fw-bold text-muted">#${t.id}</td>
                <td><span class="badge bg-light text-dark border">${t.type}</span></td>
                <td>${shortDesc}</td>
                <td class="small text-secondary">${t.date}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light text-primary"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
            `;
        });
    }
    $('#ticketListBody').html(html);
}

// 3. TÍNH TOÁN THỐNG KÊ
function calculateStats() {
    var total = mockMyTickets.length;
    var resolved = mockMyTickets.filter(t => t.status === 'Resolved').length;
    var pending = total - resolved; // Open + Pending

    $('#statTotal').text(total);
    $('#statPending').text(pending);
    $('#statResolved').text(resolved);
}

// 4. MỞ MODAL TẠO MỚI
function openCreateTicketModal() {
    var el = document.getElementById('createTicketModal');
    createModal = new bootstrap.Modal(el);
    $('#createTicketForm')[0].reset();
    createModal.show();
}

// 5. XỬ LÝ GỬI FORM
$('#createTicketForm').on('submit', function (e) {
    e.preventDefault();
    createModal.hide();

    // Lấy dữ liệu form
    var type = $('#ticketType').val();
    var desc = $('#ticketDesc').val();
    var respond = $('input[name="respondType"]:checked').val();
    var now = new Date();
    var dateStr = `${now.getFullYear()}-0${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

    // Giả lập thêm vào DB
    var newTicket = {
        id: Math.floor(Math.random() * 1000) + 1000,
        type: type,
        respond: respond,
        desc: desc,
        status: "Open",
        date: dateStr
    };

    mockMyTickets.unshift(newTicket); // Thêm lên đầu danh sách

    Swal.fire({
        icon: 'success',
        title: 'Đã gửi yêu cầu',
        text: 'Mã hồ sơ của bạn là #' + newTicket.id,
        confirmButtonText: 'OK'
    }).then(() => {
        renderTickets();
        calculateStats();
    });
});

// 6. XEM CHI TIẾT
function openViewModal(id) {
    var t = mockMyTickets.find(x => x.id === id);
    if (!t) return;

    var el = document.getElementById('viewTicketModal');
    viewModal = new bootstrap.Modal(el);

    $('#viewID').text(t.id);
    $('#viewType').text(t.type);
    $('#viewDate').text(t.date);
    $('#viewDesc').text(t.desc);

    // Badge trong modal view
    var badgeClass = 'bg-primary';
    if (t.status === 'Pending') badgeClass = 'bg-warning text-dark';
    if (t.status === 'Resolved') badgeClass = 'bg-success';

    $('#viewStatusBadge').attr('class', 'badge ' + badgeClass).text(t.status);

    viewModal.show();
}