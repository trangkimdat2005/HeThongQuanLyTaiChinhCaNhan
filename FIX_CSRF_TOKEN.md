# H??ng d?n Fix l?i CSRF Token

## V?n ??
Khi upload avatar ho?c ??i m?t kh?u, server tr? v? l?i 400 Bad Request do CSRF token validation fail.

## Nguyên nhân
ASP.NET Core **KHÔNG ch?p nh?n** CSRF token ???c g?i qua `headers`. Token ph?i ???c g?i qua:
1. **Form data** (name: `__RequestVerificationToken`)
2. **Request body** (cho application/x-www-form-urlencoded)

## Gi?i pháp ?ã áp d?ng

### 1. **Upload Avatar**
```javascript
var formData = new FormData();
formData.append('avatar', this.files[0]);
formData.append('__RequestVerificationToken', getAntiForgeryToken()); // ? ?úng

$.ajax({
    url: '/User/Profile/UploadAvatar',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    // ? KHÔNG dùng headers
});
```

### 2. **Update Info & Change Password**
```javascript
// S? d?ng FormData t? form element (t? ??ng bao g?m AntiForgeryToken)
var formData = new FormData(this); // ? this = form element

$.ajax({
    url: '/User/Profile/UpdateInfo',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false
});
```

### 3. **Thêm name attributes trong HTML**
```html
<form id="updateInfoForm">
    @Html.AntiForgeryToken()
    <input type="text" id="fullName" name="fullName"> <!-- ? Có name -->
    <input type="date" id="dob" name="dob">
    <input type="text" id="city" name="city">
    <input type="text" id="address" name="address">
    <input type="text" id="country" name="country">
</form>

<form id="changePassForm">
    @Html.AntiForgeryToken()
    <input type="password" id="currentPass" name="currentPass"> <!-- ? Có name -->
    <input type="password" id="newPass" name="newPass">
</form>
```

## Cách test

### Test trong Browser Console:
```javascript
// 1. Ki?m tra token có t?n t?i không
console.log('Token:', $('input[name="__RequestVerificationToken"]').val());

// 2. Test FormData
var form = document.getElementById('updateInfoForm');
var formData = new FormData(form);
for (var pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
}
// Ph?i th?y: __RequestVerificationToken, fullName, dob, city, address, country
```

## L?u ý quan tr?ng

### ? ?ÚNG:
```javascript
// Cách 1: Dùng FormData v?i form element
var formData = new FormData(document.getElementById('myForm'));

// Cách 2: Append token vào FormData
var formData = new FormData();
formData.append('__RequestVerificationToken', $('input[name="__RequestVerificationToken"]').val());
formData.append('avatar', file);
```

### ? SAI:
```javascript
// SAI: G?i token qua headers
$.ajax({
    headers: {
        'RequestVerificationToken': token // ? ASP.NET Core không nh?n
    }
});

// SAI: Dùng data object thông th??ng (không có token)
$.ajax({
    data: {
        fullName: 'ABC',
        city: 'HCM'
        // ? Thi?u __RequestVerificationToken
    }
});
```

## Các file ?ã s?a
1. ? `Profile.js` - ??i cách g?i token t? headers sang FormData
2. ? `Profile.cshtml` - Thêm `name` attributes cho t?t c? input
3. ? Gi? nguyên `ProfileController.cs` - Không c?n thay ??i

## K?t qu? mong ??i
- ? Upload avatar thành công
- ? C?p nh?t thông tin cá nhân thành công
- ? ??i m?t kh?u thành công
- ? Không còn l?i 400 Bad Request
