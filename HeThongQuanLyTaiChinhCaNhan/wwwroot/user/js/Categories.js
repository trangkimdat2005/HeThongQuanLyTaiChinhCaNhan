// 1. BIẾN LƯU TRỮ DỮ LIỆU (Ban đầu để trống hoặc chứa data mặc định)
var mockCategories = [];
var filterType = 'Expense';

$(document).ready(async function () {
    // Gọi API lấy dữ liệu ngay khi trang tải xong
    await refreshData();
});

// Hàm này dùng để đồng bộ dữ liệu từ Server về biến mockCategories
async function refreshData() {
    const data = await GetAll();
    if (data) {
        // Map dữ liệu từ C# (CategoryId, CategoryName...) sang định dạng đồng nhất
        mockCategories = data.map(c => ({
            id: c.categoryId || c.CategoryId,
            name: c.categoryName || c.CategoryName,
            type: c.type || c.Type,
            icon: c.icon || c.Icon,
            color: c.color || c.Color
        }));
        renderCategories(); // Sau khi có data thì vẽ ra giao diện
    }
}

// 2. RENDER (Sử dụng dữ liệu từ biến mockCategories)
function renderCategories() {
    // Lọc data từ biến mockCategories dựa trên filterType
    var filtered = mockCategories.filter(c => c.type === filterType);

    var html = '';
    if (filtered.length === 0) {
        html = `<div class="col-12 text-center py-5 text-muted">Chưa có danh mục nào thuộc nhóm ${filterType}.</div>`;
    } else {
        filtered.forEach(c => {
            html += `
            <div class="col-xl-3 col-md-4 col-sm-6 mb-3">
                <div class="card category-card shadow-sm h-100">
                    <div class="card-body d-flex align-items-center justify-content-between p-3">
                        <div class="d-flex align-items-center">
                            <div class="cat-icon-md me-3 shadow-sm" style="background-color: ${c.color}">
                                <i class="fas ${c.icon}"></i>
                            </div>
                            <div class="fw-bold text-dark text-truncate" style="max-width: 110px;">
                                ${c.name}
                            </div>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                <li><a class="dropdown-item" href="#" onclick="openCategoryModal('edit', ${c.id})">Sửa</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteCategory(${c.id})">Xóa</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    $('#categoryList').html(html);
}

// 3. MODAL & PREVIEW
function openCategoryModal(mode, id = null) {
    var myModalEl = document.getElementById('categoryModal');
    modalInstance = new bootstrap.Modal(myModalEl);

    // Set loại danh mục dựa trên Tab đang đứng
    $('#catType').val(filterType);

    if (mode === 'add') {
        $('#modalTitle').text(`Tạo ${filterType === 'Expense' ? 'Khoản Chi' : 'Khoản Thu'} Mới`);
        $('#catID').val('');
        $('#catName').val('');

        // Mặc định màu sắc icon theo loại
        if (filterType === 'Expense') {
            $('#catIcon').val('fa-utensils');
            $('#catColor').val('#e74a3b');
        } else {
            $('#catIcon').val('fa-money-bill');
            $('#catColor').val('#1cc88a');
        }
    } else {
        var item = mockCategories.find(x => x.id === id);
        if (item) {
            $('#modalTitle').text('Cập Nhật Danh Mục');
            $('#catID').val(item.id);
            $('#catName').val(item.name);
            $('#catIcon').val(item.icon);
            $('#catColor').val(item.color);
        }   
    }

    updatePreview();
    modalInstance.show();
}

// Cập nhật icon xem trước khi nhập form
function updatePreview() {
    var color = $('#catColor').val();
    var icon = $('#catIcon').val();

    $('#iconPreviewBox').css('background-color', color);
    $('#iconPreview').attr('class', 'fas fs-3 ' + icon);
}

// 4. SUBMIT FORM
$('#categoryForm').on('submit', async function (e) {
    e.preventDefault();

    // 1. Thu thập dữ liệu từ Form
    const id = $('#catID').val();
    const categoryData = {
        CategoryId: id ? parseInt(id) : 0,
        CategoryName: $('#catName').val().trim(),
        Type: $('#catType').val(),
        Icon: $('#catIcon').val(),
        Color: $('#catColor').val()
    };

    // Kiểm tra nhanh dữ liệu trước khi gửi
    if (!categoryData.CategoryName) {
        Swal.fire('Lỗi', 'Vui lòng nhập tên danh mục', 'error');
        return;
    }

    try {
        // 2. Xác định endpoint: Nếu có ID là Update, không có là Create
        const url = categoryData.CategoryId > 0
            ? '/User/Categories/Update'
            : '/User/Categories/Create';

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });

        if (response.ok) {
            // 3. Nếu thành công: Ẩn Modal và Thông báo
            modalInstance.hide();

            var actionText = categoryData.CategoryId > 0 ? 'Cập nhật' : 'Tạo mới';

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: `Đã ${actionText} danh mục thành công!`,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // 4. Cập nhật lại Mock Data và Render lại giao diện
                refreshData();
            });
        } else {
            const errorMsg = await response.text();
            Swal.fire('Lỗi', 'Không thể lưu dữ liệu: ' + errorMsg, 'error');
        }
    } catch (error) {
        console.error("Submit error:", error);
        Swal.fire('Lỗi', 'Kết nối đến server thất bại!', 'error');
    }
});

// 5. DELETE
function deleteCategory(id) {
    Swal.fire({
        title: 'Xóa danh mục?',
        text: "Các giao dịch cũ thuộc danh mục này sẽ hiển thị là 'Chưa phân loại'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Xóa ngay'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Đã xóa', '', 'success');
        }
    })
}


async function GetAll () {
    try {
        const response = await fetch('/User/Categories/GetAll');

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        console.log(data);

        // xử lý data ở đây
        // render table, chart, v.v.

        return data;
    } catch (err) {
        console.error(err);
    }
}
