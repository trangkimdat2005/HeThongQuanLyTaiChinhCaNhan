# CHECKLIST TEST PROFILE FEATURES

## Tr??c khi test
- [ ] ?ã build project thành công
- [ ] ?ã login v?i tài kho?n role "User"
- [ ] Có th? truy c?p `/User/Profile`

## Test t?ng ch?c n?ng

### 1. ? Load thông tin Profile
**Cách test:**
1. M? trang `/User/Profile`
2. M? Browser Console (F12)
3. Ki?m tra Network tab, tìm request `GetProfile`

**K?t qu? mong ??i:**
- [ ] Avatar hi?n th? (ho?c default n?u ch?a có)
- [ ] Tên hi?n th? ?úng
- [ ] Email hi?n th? ?úng (readonly)
- [ ] Role hi?n th? (User/Admin)
- [ ] Ngày tham gia hi?n th?
- [ ] T?t c? thông tin khác fill ??y ??

**Debug n?u l?i:**
```javascript
// Trong Browser Console
$.get('/User/Profile/GetProfile', function(data) {
    console.log(data);
});
```

---

### 2. ? C?p nh?t thông tin cá nhân
**Cách test:**
1. S?a h? tên thành "Nguy?n V?n Test"
2. Ch?n ngày sinh
3. Nh?p ??a ch?, thành ph?, qu?c gia
4. Click "L?u Thay ??i"

**K?t qu? mong ??i:**
- [ ] Loading spinner hi?n lên
- [ ] Thông báo "C?p nh?t thông tin thành công!"
- [ ] Tên phía trên avatar c?p nh?t thành "Nguy?n V?n Test"
- [ ] F5 refresh l?i v?n gi? nguyên d? li?u m?i

**Debug n?u l?i:**
```javascript
// Ki?m tra FormData có g?i ?úng không
var form = document.getElementById('updateInfoForm');
var formData = new FormData(form);
for (var pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
}
// Ph?i th?y: __RequestVerificationToken, fullName, dob, city, address, country
```

**L?i th??ng g?p:**
- ? 400 Bad Request ? Thi?u CSRF token
  - **Fix**: Ki?m tra `@Html.AntiForgeryToken()` có trong form không
- ? D? li?u không l?u ? Thi?u `name` attribute
  - **Fix**: Ki?m tra t?t c? input có `name="..."` không

---

### 3. ? Upload Avatar
**Cách test:**
1. Click vào icon camera trên avatar
2. Ch?n file ?nh (jpg/png)
3. ??i upload

**K?t qu? mong ??i:**
- [ ] Preview ?nh ngay l?p t?c
- [ ] Loading "?ang t?i lên..." hi?n
- [ ] Thông báo toast "C?p nh?t avatar thành công!"
- [ ] ?nh m?i hi?n th?
- [ ] F5 refresh v?n th?y ?nh m?i
- [ ] ?nh ???c l?u t?i `/wwwroot/images/avatars/[guid]_filename.jpg`

**Debug n?u l?i:**
```javascript
// Ki?m tra file upload
$('#uploadAvatar').change(function() {
    console.log('File selected:', this.files[0]);
    console.log('Token:', $('input[name="__RequestVerificationToken"]').val());
});
```

**L?i th??ng g?p:**
- ? 400 Bad Request ? Thi?u token trong FormData
  - **Fix**: ?ã fix trong code, token ???c append vào FormData
- ? ?nh không hi?n th? ? Sai ???ng d?n
  - **Fix**: Ki?m tra `response.avatarUrl` có ?úng `/images/avatars/xxx.jpg` không

---

### 4. ? ??i m?t kh?u
**Cách test:**
1. Nh?p m?t kh?u hi?n t?i
2. Nh?p m?t kh?u m?i (>= 6 ký t?)
3. Nh?p l?i m?t kh?u m?i
4. Click "C?p Nh?t M?t Kh?u"

**K?t qu? mong ??i:**
- [ ] N?u m?t kh?u xác nh?n không kh?p ? L?i "M?t kh?u xác nh?n không kh?p!"
- [ ] N?u < 6 ký t? ? L?i "M?t kh?u ph?i có ít nh?t 6 ký t?!"
- [ ] N?u m?t kh?u hi?n t?i sai ? L?i "M?t kh?u hi?n t?i không ?úng"
- [ ] N?u ?úng ? Thông báo "??i m?t kh?u thành công!"
- [ ] Form reset v? r?ng
- [ ] Th? login l?i v?i m?t kh?u m?i ? OK

**Debug n?u l?i:**
```javascript
// Ki?m tra form data
var form = document.getElementById('changePassForm');
var formData = new FormData(form);
for (var pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
}
// Ph?i th?y: __RequestVerificationToken, currentPass, newPass
```

**L?i th??ng g?p:**
- ? M?t kh?u hi?n t?i luôn sai
  - **Nguyên nhân**: M?t kh?u trong DB ?ã b? hash, ph?i nh?p ?úng m?t kh?u ban ??u
  - **Fix**: Ki?m tra PasswordHelper có hash ?úng không

---

## Test nâng cao

### Test Security
- [ ] Logout r?i th? truy c?p `/User/Profile` ? Ph?i redirect v? login
- [ ] Xóa CSRF token kh?i form ? Submit ph?i báo l?i 400
- [ ] Upload file không ph?i ?nh (.exe, .txt) ? Ph?i báo l?i

### Test Performance
- [ ] Upload ?nh l?n (>5MB) ? Ki?m tra loading spinner
- [ ] Submit form nhi?u l?n liên t?c ? Không b? duplicate request

### Test Edge Cases
- [ ] Không nh?p gì c? r?i submit ? C?p nh?t thành công (d? li?u r?ng h?p l?)
- [ ] Nh?p ký t? ??c bi?t vào tên ? L?u ???c bình th??ng
- [ ] Ch?n ngày sinh trong t??ng lai ? V?n l?u ???c (n?u c?n validate thêm client-side)

---

## K?t lu?n

### ? N?u t?t c? test PASS:
Ch?c n?ng Profile ?ã ho?t ??ng hoàn ch?nh!

### ? N?u có test FAIL:
1. Ki?m tra Browser Console có l?i JavaScript không
2. Ki?m tra Network tab xem request/response nh? th? nào
3. Ki?m tra logs server (n?u có)
4. Tham kh?o file `FIX_CSRF_TOKEN.md` ?? debug

---

## Công c? debug h?u ích

### 1. Ki?m tra token trong Console:
```javascript
console.log('Token exists:', $('input[name="__RequestVerificationToken"]').length > 0);
console.log('Token value:', $('input[name="__RequestVerificationToken"]').val());
```

### 2. Test API tr?c ti?p:
```javascript
// Test GetProfile
$.get('/User/Profile/GetProfile', console.log);

// Test UpdateInfo
var formData = new FormData();
formData.append('__RequestVerificationToken', $('input[name="__RequestVerificationToken"]').val());
formData.append('fullName', 'Test Name');
formData.append('city', 'HCM');

$.ajax({
    url: '/User/Profile/UpdateInfo',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: console.log,
    error: console.error
});
```

### 3. Monitor Network:
- F12 ? Network tab
- Filter: XHR
- Xem Request Headers, Form Data, Response
