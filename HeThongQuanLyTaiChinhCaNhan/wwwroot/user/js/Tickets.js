// 1. MOCK DATA (Chỉ vé của User hiện tại)
// MOCK DATA (sẽ được đổ từ API)
var mockMyTickets = [];

var createModal, viewModal;

function formatDate(dateStr) {
    const d = new Date(dateStr);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function loadTicketsFromApi() {
    $.ajax({
        url: '/User/Tickets/GetAll',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            // Map dữ liệu từ TicketDto -> mockMyTickets
            mockMyTickets = data.map(item => ({
                id: item.ticketId,
                type: item.questionType,
                respond: item.respondType,
                desc: item.description,
                status: item.status,
                date: formatDate(item.createdAt)
            }));

            renderTickets();
            calculateStats();
        },
        error: function (err) {
            if (err.status === 401) {
                alert("Bạn chưa đăng nhập hoặc token hết hạn");
            } else {
                console.error("Lỗi load ticket:", err);
            }
        }
    });
}


$(document).ready(function () {
    loadTicketsFromApi();
    //renderTickets();
    //calculateStats();
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
//$('#createTicketForm').on('submit', function (e) {
//    e.preventDefault();
//    createModal.hide();  // Ẩn modal tạo ticket

//    // Lấy dữ liệu từ form
//    var type = $('#ticketType').val();
//    var desc = $('#ticketDesc').val();
//    var respond = $('input[name="respondType"]:checked').val();
//    var now = new Date();
//    var dateStr = `${now.getFullYear()}-0${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

//    // Dữ liệu cần gửi lên server
//    var ticketData = {
//        ticketId: Math.floor(Math.random() * 1000) + 1000,  // Có thể bỏ hoặc dùng API backend tự tạo
//        questionType: type,
//        respondType: respond,
//        description: desc,
//        status: "Open",  // Tình trạng ban đầu
//        createdAt: dateStr,
//        isDelete: false  // Mặc định là không xóa
//    };

//    // Gửi yêu cầu POST tới API backend
//    $.ajax({
//        url: '/User/Tickets/Create',  // Địa chỉ API để lưu ticket
//        type: 'POST',
//        contentType: 'application/json',
//        headers: {
//            'Authorization': 'Bearer ' + localStorage.getItem('token')  // Thêm token nếu có
//        },
//        data: JSON.stringify(ticketData),  // Chuyển đổi dữ liệu thành JSON
//        success: function (data) {
//            // Thành công khi tạo ticket
//            Swal.fire({
//                icon: 'success',
//                title: 'Đã gửi yêu cầu',
//                text: 'Mã hồ sơ của bạn là #' + ticketData.ticketId,
//                confirmButtonText: 'OK'
//            }).then(() => {
//                loadTicketsFromApi();  // Tải lại danh sách ticket mới
//                calculateStats();  // Cập nhật thống kê
//            });
//        },
//        error: function (err) {
//            // Xử lý lỗi nếu có
//            console.error("Lỗi khi gửi ticket:", err);
//            Swal.fire({
//                icon: 'error',
//                title: 'Lỗi gửi yêu cầu',
//                text: 'Có lỗi khi tạo ticket, vui lòng thử lại.',
//                confirmButtonText: 'OK'
//            });
//        }
//    });
//});

$('#createTicketForm').on('submit', function (e) {
    e.preventDefault();
    createModal.hide();

    var type = $('#ticketType').val();
    var desc = $('#ticketDesc').val();
    var respond = $('input[name="respondType"]:checked').val();

    // Validate dữ liệu
    if (!type || !desc || !respond) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Vui lòng điền đầy đủ thông tin trước khi gửi.',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Chỉ gửi những dữ liệu người dùng nhập, các thông số hệ thống (ngày, status...) để Server lo
    var ticketData = {
        questionType: type,
        respondType: respond,
        description: desc
        // Bỏ createdAt, status, isDelete, userId ở đây
    };

    $.ajax({
        url: '/User/Tickets/Create',
        type: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        data: JSON.stringify(ticketData),
        success: function (data) {
            Swal.fire({
                icon: 'success',
                title: 'Đã gửi yêu cầu',
                // Chú ý: Backend đã sửa để trả về TicketId (chữ hoa/thường tùy vào cấu hình JSON của C#)
                text: 'Mã hồ sơ của bạn là #' + data.ticketId,
                confirmButtonText: 'OK'
            }).then(() => {
                // Reset form sau khi gửi thành công để người dùng nhập mới sạch sẽ hơn
                $('#createTicketForm')[0].reset();

                loadTicketsFromApi();
                calculateStats();
            });
        },
        error: function (xhr, status, error) {
            console.error("Lỗi:", xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi gửi yêu cầu',
                text: 'Có lỗi xảy ra: ' + (xhr.responseText || 'Vui lòng thử lại.'),
                confirmButtonText: 'OK'
            });
        }
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


async function GetAll () {
    try {
        const response = await fetch('/User/Tickets/GetAll', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.status === 401) {
            alert("Bạn chưa đăng nhập hoặc token hết hạn");
            return [];
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Lỗi khi lấy danh sách ticket:', error);
        return [];
    }
}