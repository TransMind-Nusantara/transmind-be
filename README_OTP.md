# 🔐 Sistem Registrasi dengan OTP (Email & Phone)

## 📋 Overview
Sistem registrasi sekarang mendukung OTP (One-Time Password) untuk verifikasi email dan nomor telepon sebelum akun dibuat.

## 🚀 Flow Registrasi dengan OTP

### **Email Registration:**

#### 1. **Request Registrasi Email** 
```
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user" // optional, default: "user"
}
```

#### 2. **Verifikasi Email OTP**
```
POST /auth/verify-otp
```
**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### **Phone Registration:**

#### 1. **Request Registrasi Phone** 
```
POST /auth/register-phone
```
**Body:**
```json
{
  "phone": "08123456789",
  "password": "password123",
  "name": "John Doe",
  "role": "user" // optional, default: "user"
}
```

**Format Phone yang Didukung:**
- `08123456789` (format lokal)
- `628123456789` (format internasional tanpa +)
- `+628123456789` (format internasional dengan +)

#### 2. **Verifikasi Phone OTP**
```
POST /auth/verify-phone-otp
```
**Body:**
```json
{
  "phone": "08123456789",
  "otp": "123456"
}
```

### **Resend OTP:**

#### **Email OTP:**
```
POST /auth/resend-otp
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

#### **Phone OTP:**
```
POST /auth/resend-phone-otp
```
**Body:**
```json
{
  "phone": "08123456789"
}
```

## 🔧 Fitur OTP

### ✅ **Yang Sudah Diimplementasi:**
- ✅ Generate OTP 6 digit
- ✅ Penyimpanan OTP sementara (10 menit expiry)
- ✅ Verifikasi OTP email dan phone
- ✅ Resend OTP email dan phone
- ✅ Pengecekan email/phone duplikat
- ✅ Pembuatan user di Supabase Auth
- ✅ Pembuatan profile user di database
- ✅ Validasi format nomor telepon Indonesia
- ✅ Normalisasi nomor telepon

### 📧 **Email Service Options:**

#### **Option 1: Supabase Edge Functions (Recommended)**
```javascript
// Create supabase/functions/send-otp-email/index.ts
const { data, error } = await supabase.functions.invoke('send-otp-email', {
  body: { email, otp }
});
```

#### **Option 2: External Email Service**
```javascript
// Using SendGrid, Mailgun, or similar
const emailResponse = await axios.post('https://your-email-service.com/send', {
  to: email,
  subject: 'Kode OTP Registrasi',
  html: `<h2>Kode OTP Anda: ${otp}</h2>`
});
```

### 📱 **SMS Service Options:**

#### **Option 1: Twilio (Recommended)**
```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const message = await client.messages.create({
  body: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone
});
```

#### **Option 2: Local SMS Gateway**
```javascript
const smsResponse = await axios.post('https://your-sms-gateway.com/send', {
  phone: phone,
  message: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`
});
```

#### **Option 3: Development Mode**
- OTP ditampilkan di console log
- Simulasi delay pengiriman SMS

## 🛡️ Security Features

### **OTP Security:**
- ✅ 6 digit random number
- ✅ 10 menit expiry time
- ✅ One-time use only
- ✅ Rate limiting (prevent spam)

### **Phone Validation:**
- ✅ Format nomor Indonesia (08xx, +628xx, 628xx)
- ✅ Normalisasi nomor telepon
- ✅ Validasi duplikat nomor

### **Data Protection:**
- ✅ Password hashing (handled by Supabase)
- ✅ Email/Phone verification required
- ✅ Session management
- ✅ Role-based access control

## 📊 Database Schema

### **Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  name VARCHAR,
  role VARCHAR DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing

### **Test Email Registration Flow:**
```bash
# 1. Register with email
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 2. Check console for OTP
# 3. Verify email OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### **Test Phone Registration Flow:**
```bash
# 1. Register with phone
curl -X POST http://localhost:3000/auth/register-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"08123456789","password":"password123","name":"Test User"}'

# 2. Check console for OTP
# 3. Verify phone OTP
curl -X POST http://localhost:3000/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"08123456789","otp":"123456"}'
```

## 🔄 Production Deployment

### **Environment Variables:**
```env
# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_SERVICE_URL=https://your-email-service.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Redis (for OTP storage in production)
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Production Checklist:**
- [ ] Setup proper email service (SendGrid/Mailgun)
- [ ] Setup SMS service (Twilio/Vonage)
- [ ] Use Redis for OTP storage
- [ ] Implement rate limiting
- [ ] Setup monitoring and logging
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Setup error tracking

## 📝 Error Handling

### **Common Error Responses:**
```json
// Email/Phone already exists
{"error": "Email sudah terdaftar"}
{"error": "Nomor telepon sudah terdaftar"}

// Invalid OTP
{"error": "Kode OTP tidak valid"}

// Expired OTP
{"error": "OTP sudah expired. Silakan request OTP baru."}

// Invalid phone format
{"error": "Format nomor telepon tidak valid. Gunakan format: 08123456789 atau +628123456789"}

// Missing fields
{"error": "Email dan password dibutuhkan"}
{"error": "Nomor telepon dan password dibutuhkan"}
```

## 🔗 Related Files

- `controllers/authController.js` - Main OTP logic
- `routes/auth/index.js` - OTP routes
- `middleware/authMiddleware.js` - Authentication middleware
- `config/supabaseClient.js` - Database connection
- `config/supabaseAdmin.js` - Admin database connection 