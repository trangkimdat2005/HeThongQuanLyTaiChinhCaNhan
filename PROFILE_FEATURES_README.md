# Ch?c n?ng Profile User - H??ng d?n

## Các ch?c n?ng ?ã ???c x? lý:

### 1. **Xem thông tin profile**
- **Endpoint**: `GET /User/Profile/GetProfile`
- **Mô t?**: Load thông tin ng??i dùng t? database
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "userId": "...",
      "email": "...",
      "fullName": "...",
      "avatarUrl": "...",
      "address": "...",
      "city": "...",
      "country": "...",
      "dateOfBirth": "yyyy-MM-dd",
      "role": "User",
      "lastLogin": "dd/MM/yyyy HH:mm",
      "createdAt": "dd/MM/yyyy"
    }
  }
  ```

### 2. **C?p nh?t thông tin cá nhân**
- **Endpoint**: `POST /User/Profile/UpdateInfo`
- **Mô t?**: C?p nh?t fullName, dateOfBirth, address, city, country
- **Parameters**:
  - `fullName`: H? và tên
  - `dob`: Ngày sinh (yyyy-MM-dd)
  - `address`: ??a ch?
  - `city`: Thành ph?
  - `country`: Qu?c gia
- **Response**:
  ```json
  {
    "success": true,
    "message": "C?p nh?t thông tin thành công!"
  }
  ```

### 3. **Upload avatar**
- **Endpoint**: `POST /User/Profile/UploadAvatar`
- **Mô t?**: Upload ?nh ??i di?n, t? ??ng xóa ?nh c?
- **Parameters**:
  - `avatar`: File ?nh (IFormFile)
- **L?u tr?**: `/wwwroot/images/avatars/`
- **Response**:
  ```json
  {
    "success": true,
    "message": "C?p nh?t avatar thành công!",
    "avatarUrl": "/images/avatars/xxx.jpg"
  }
  ```

### 4. **??i m?t kh?u**
- **Endpoint**: `POST /User/Profile/ChangePassword`
- **Mô t?**: ??i m?t kh?u v?i xác th?c m?t kh?u c?
- **Parameters**:
  - `currentPass`: M?t kh?u hi?n t?i
  - `newPass`: M?t kh?u m?i
- **Validation**:
  - Ki?m tra m?t kh?u hi?n t?i ?úng
  - M?t kh?u m?i >= 6 ký t?
  - Confirm password kh?p (client-side)
- **Response**:
  ```json
  {
    "success": true,
    "message": "??i m?t kh?u thành công!"
  }
  ```

## B?o m?t

- ? T?t c? endpoints yêu c?u authentication (`[Authorize(Roles = "User")]`)
- ? Anti-CSRF token ???c validate
- ? M?t kh?u ???c hash b?ng SHA256
- ? Upload file ???c validate extension
- ? T? ??ng xóa file c? khi upload file m?i

## File liên quan

### Backend:
- `ProfileController.cs` - Controller x? lý các API
- `PasswordHelper.cs` - Utility hash password
- `ProfileDto.cs` - DTOs cho profile

### Frontend:
- `Profile.cshtml` - View hi?n th?
- `Profile.js` - JavaScript x? lý AJAX
- `Profile.css` - Styling

## Test th?

1. ??m b?o ?ã login v?i role "User"
2. Truy c?p: `/User/Profile`
3. Th? các ch?c n?ng:
   - ? Load thông tin profile
   - ? C?p nh?t tên, ??a ch?, ngày sinh
   - ? Upload avatar m?i
   - ? ??i m?t kh?u

## L?u ý

- Avatar ???c l?u t?i `/wwwroot/images/avatars/`
- N?u ch?a có folder này, h? th?ng s? t? t?o
- Tên file avatar s? d?ng GUID ?? tránh trùng l?p
- Validation m?t kh?u t?i thi?u 6 ký t? (có th? t?ng lên)
