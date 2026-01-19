var table;

$(document).ready(function () {
    // 1. Khởi tạo DataTable (Không cần data source giả nữa vì HTML đã có dữ liệu)
    table = $('#tableTicket').DataTable({
        language: {
            search: "Tìm kiếm:",
            lengthMenu: "Hiện _MENU_ dòng",
            info: "Trang _PAGE_ / _PAGES_",
            paginate: { first: "«", last: "»", next: "›", previous: "‹" },
            zeroRecords: "Không tìm thấy yêu cầu nào"
        },
        order: [[5, 'desc']], // Sắp xếp theo ngày (Cột thứ 6 - index 5)
        columnDefs: [
            { orderable: false, targets: -1 } // Không sort cột nút bấm
        ]
    });

    // 2. Xử lý Bộ lọc (Filter)
    $('#filterStatus').on('change', function () {
        // Tìm text tương ứng để search trong cột Status (Cột index 4)
        // Lưu ý: Text hiển thị trong bảng là "Chưa xử lý", "Đã xong"...
        var val = $(this).val();
        var searchText = "";
        if (val === 'Open') searchText = "Chưa xử lý";
        else if (val === 'Pending') searchText = "Đang chờ";
        else if (val === 'Resolved') searchText = "Đã xong";

        table.column(4).search(searchText).draw();
    });

    $('#filterType').on('change', function () {
        table.column(2).search($(this).val()).draw(); // Cột Type (index 2)
    });

    // 3. Xử lý sự kiện click nút "Chi tiết"
    // Dùng delegate event (on click) để hoạt động cả khi chuyển trang trong DataTable
    $('#tableTicket').on('click', '.btn-detail', function () {
        var btn = $(this);

        // Lấy dữ liệu từ data attributes
        var id = btn.data('id');
        var username = btn.data('username');
        var email = btn.data('email');
        var avatar = btn.data('avatar');
        var type = btn.data('type');
        var date = btn.data('date');
        var desc = btn.data('desc');
        var respondType = btn.data('respondtype');
        var status = btn.data('status');
        var response = btn.data('response'); // Nội dung admin đã trả lời (nếu có)

        // Đổ vào Modal
        $('#hiddenTicketId').val(id);
        $('#modalTicketID').text(id);
        $('#modalUserName').text(username);
        $('#modalUserEmail').text(email);
        $('#modalAvatar').attr('src', avatar);
        $('#modalType').text(type);
        $('#modalDate').text(date);
        $('#modalDesc').text(desc);
        $('#modalRespondType').text(respondType);
        $('#modalStatusSelect').val(status);
        $('#adminResponse').val(response || ""); // Nếu chưa có thì để trống

        // Mở Modal
        var myModal = new bootstrap.Modal(document.getElementById('ticketModal'));
        myModal.show();
    });
});

// --- HÀM GỬI PHẢN HỒI (AJAX) ---
function submitReply() {
    var id = $('#hiddenTicketId').val();
    var responseText = $('#adminResponse').val();
    var status = $('#modalStatusSelect').val();
    var token = $('input[name="__RequestVerificationToken"]').val();

    if (!responseText.trim()) {
        Swal.fire('Chưa nhập nội dung', 'Vui lòng nhập nội dung phản hồi.', 'warning');
        return;
    }

    // Đóng Modal
    // bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();

    Swal.fire({
        title: 'Đang gửi phản hồi...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
    });

    $.ajax({
        url: '/Admin/Support/Reply',
        type: 'POST',
        data: {
            id: id,
            adminResponse: responseText,
            status: status
        },
        headers: { "RequestVerificationToken": token },
        success: function (res) {
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: res.message
                }).then(() => {
                    location.reload(); // Load lại trang để cập nhật dữ liệu mới
                });
            } else {
                Swal.fire('Lỗi', res.message, 'error');
            }
        },
        error: function () {
            Swal.fire('Lỗi', 'Không thể kết nối đến server.', 'error');
        }
    });
}