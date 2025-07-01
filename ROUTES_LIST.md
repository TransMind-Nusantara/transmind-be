# 🚀 Daftar Lengkap Route Aplikasi

## 🔐 **Authentication Routes** (`/auth`)

### **Registrasi dengan Email OTP:**
- **POST** `/auth/register` - Request registrasi email dan kirim OTP
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "user" // optional
  }
  ```

- **POST** `/auth/verify-otp` - Verifikasi email OTP dan selesaikan registrasi
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```

- **POST** `/auth/resend-otp` - Kirim ulang email OTP
  ```json
  {
    "email": "user@example.com"
  }
  ```

### **Registrasi dengan Phone OTP:**
- **POST** `/auth/register-phone` - Request registrasi phone dan kirim OTP
  ```json
  {
    "phone": "08123456789",
    "password": "password123",
    "name": "John Doe",
    "role": "user" // optional
  }
  ```

- **POST** `/auth/verify-phone-otp` - Verifikasi phone OTP dan selesaikan registrasi
  ```json
  {
    "phone": "08123456789",
    "otp": "123456"
  }
  ```

- **POST** `/auth/resend-phone-otp` - Kirim ulang phone OTP
  ```json
  {
    "phone": "08123456789"
  }
  ```

### **Login:**
- **POST** `/auth/login` - Login dengan email
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST** `/auth/login-phone` - Login dengan nomor telepon
  ```json
  {
    "phone": "08123456789",
    "password": "password123"
  }
  ```

- **POST** `/auth/facebook` - Login dengan Facebook
  ```json
  {
    "access_token": "facebook_access_token"
  }
  ```

### **Admin Routes:**
- **GET** `/auth/users` - Ambil semua pengguna (Admin only)

---

## 📅 **Booking Routes** (`/bookings`)

### **CRUD Operations:**
- **GET** `/bookings` - Ambil semua data booking
- **POST** `/bookings` - Buat booking baru
- **PUT** `/bookings/:id` - Update booking berdasarkan ID

### **Admin Reports:**
- **GET** `/bookings/summary` - Ringkasan booking (Admin only)

---

## 🏠 **General Routes** (`/`)

### **Basic Endpoints:**
- **GET** `/` - Halaman utama
- **GET** `/hello` - Endpoint hello
- **PUT** `/username` - Update username
- **GET** `/flights` - Ambil data penerbangan

---

## 🔒 **Middleware Protection**

### **Authentication Required:**
- `/auth/users` - Role: `admin`
- `/bookings/summary` - Role: `admin`

### **Public Routes:**
- `/auth/register` - Registrasi email
- `/auth/register-phone` - Registrasi phone
- `/auth/verify-otp` - Verifikasi email OTP
- `/auth/verify-phone-otp` - Verifikasi phone OTP
- `/auth/resend-otp` - Resend email OTP
- `/auth/resend-phone-otp` - Resend phone OTP
- `/auth/login` - Login email
- `/auth/login-phone` - Login phone
- `/auth/facebook` - Facebook login
- `/bookings` - CRUD bookings
- `/` - General routes

---

## 📋 **Flow Registrasi Lengkap**

### **Email Registration:**
```bash
# Step 1: Register with email
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'

# Step 2: Check console for OTP
# Step 3: Verify email OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

### **Phone Registration:**
```bash
# Step 1: Register with phone
curl -X POST http://localhost:3000/auth/register-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08123456789",
    "password": "password123",
    "name": "John Doe"
  }'

# Step 2: Check console for OTP
# Step 3: Verify phone OTP
curl -X POST http://localhost:3000/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08123456789",
    "otp": "123456"
  }'
```

---

## 📱 **Phone Number Format Support**

### **Supported Formats:**
- `08123456789` (format lokal)
- `628123456789` (format internasional tanpa +)
- `+628123456789` (format internasional dengan +)

### **Validation Rules:**
- ✅ Nomor Indonesia (08xx, +628xx, 628xx)
- ✅ Panjang 10-13 digit
- ✅ Format yang valid

---

## 🛡️ **Security Features**

### **OTP Security:**
- ✅ 6 digit random number
- ✅ 10 menit expiry time
- ✅ One-time use only
- ✅ Rate limiting protection

### **Phone Validation:**
- ✅ Format nomor Indonesia
- ✅ Normalisasi nomor telepon
- ✅ Validasi duplikat nomor

### **Authentication:**
- ✅ Password hashing (Supabase)
- ✅ Email/Phone verification required
- ✅ Session management
- ✅ Role-based access control
- ✅ CORS protection

---

## 📊 **Response Status Codes**

### **Success:**
- `200` - OK (GET, PUT, DELETE)
- `201` - Created (POST)

### **Client Errors:**
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (login required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found

### **Server Errors:**
- `500` - Internal Server Error

---

## 🔧 **Development Setup**

### **Environment Variables:**
```env
PORT=3000
NODE_ENV=development
SESS_SECRET=your_session_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SMS Service (Optional for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### **Start Server:**
```bash
npm start
# or
node index.js
```

---

## 📝 **Error Handling Examples**

### **Email/Phone Already Exists:**
```json
{
  "error": "Email sudah terdaftar"
}
{
  "error": "Nomor telepon sudah terdaftar"
}
```

### **Invalid OTP:**
```json
{
  "error": "Kode OTP tidak valid"
}
```

### **Expired OTP:**
```json
{
  "error": "OTP sudah expired. Silakan request OTP baru."
}
```

### **Invalid Phone Format:**
```json
{
  "error": "Format nomor telepon tidak valid. Gunakan format: 08123456789 atau +628123456789"
}
```

### **Missing Fields:**
```json
{
  "error": "Email dan password dibutuhkan"
}
{
  "error": "Nomor telepon dan password dibutuhkan"
}
```

---

## 🔗 **Related Documentation**

- `README_OTP.md` - Dokumentasi lengkap fitur OTP
- `controllers/authController.js` - Logic authentication
- `controllers/bookingController.js` - Logic booking
- `controllers/generalController.js` - Logic general
- `middleware/authMiddleware.js` - Middleware authentication 