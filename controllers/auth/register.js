const supabase = require("../../config/supabaseClient");
const { addMinutes } = require("date-fns");

const { sendOTPEmail } = require("../../helpers/mailerSend");
const supabaseAdmin = require("../../config/supabaseAdmin");

const phoneOtpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password dibutuhkan" });
  }

  try {
    // Check if user already exists with superadmin
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers({
      email: email,
    });

    if (listError) {
        return res.status(500).json({ error: 'Gagal memeriksa email: ' + listError.message });
    }

    if (users && users.length > 0) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    // Generate OTP and Expires Date
    const otp = generateOTP();
    const expiresAt = addMinutes(new Date(), 10);

    const { error: otpError } = await supabase.from("otp_codes").insert([
      {
        email,
        otp,
        expires_at: expiresAt,
        data: {
          name,
          role: role || "user",
          password,
        },
      },
    ]);

    if (otpError) {
      console.log(otpError);
      return res.status(500).json({ error: "Gagal menyimpan OTP" });
    }

    const sendResult = await sendOTPEmail(email, otp);
    if (!sendResult.success) {
      return res
        .status(500)
        .json({ error: "Gagal mengirim OTP: " + sendResult.error });
    }

    res.status(200).json({
      message:
        "OTP telah dikirim ke email Anda. Silakan verifikasi untuk menyelesaikan pendaftaran.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ error: "Gagal melakukan registrasi: " + error.message });
  }
};

const registerWithPhone = async (req, res) => {
  const { phone, password, name, role } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ error: "Nomor telepon dan password dibutuhkan" });
  }

  try {
    // Normalize phone number
    let normalizedPhone = phone;
    if (phone.startsWith("0")) {
      normalizedPhone = "+62" + phone.substring(1);
    } else if (phone.startsWith("62")) {
      normalizedPhone = "+" + phone;
    }

    // Check if phone already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", normalizedPhone)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Nomor telepon sudah terdaftar" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP data
    phoneOtpStore.set(normalizedPhone, {
      otp,
      password,
      name: name || "User",
      role: role || "user",
      expiresAt,
    });

    // Send OTP via SMS (simulated for now)
    const smsResult = await sendOTPSMS(normalizedPhone, otp);

    if (smsResult.error) {
      return res
        .status(500)
        .json({ error: "Gagal mengirim OTP: " + smsResult.error });
    }

    res.status(200).json({
      message:
        "OTP telah dikirim ke nomor telepon Anda. Silakan cek SMS dan masukkan kode OTP.",
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error("Phone register error:", error);
    res
      .status(500)
      .json({ error: "Gagal melakukan registrasi: " + error.message });
  }
};

module.exports = { register, registerWithPhone };
