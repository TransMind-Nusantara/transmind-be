const supabase = require("../config/supabaseClient");
const axios = require("axios");

/**
 * Middleware untuk memeriksa apakah pengguna memiliki peran yang diizinkan.
 * @param {Array<string>} allowedRoles - Array berisi string peran yang diizinkan, misal ['admin', 'manager'].
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Akses ditolak: Token tidak disediakan." });
    }
    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Akses ditolak: Token tidak valid." });
    }

    const userRole = user.user_metadata.role;

    if (allowedRoles.includes(userRole)) {
      req.user = user;
      next();
    } else {
      return res
        .status(403)
        .json({ error: "Akses ditolak: Anda tidak memiliki izin yang cukup." });
    }
  };
};

/**
 * Middleware untuk memverifikasi Facebook access token
 */
const verifyFacebookToken = async (req, res, next) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Facebook access token dibutuhkan" });
  }

  try {
    // Verifikasi token ke Facebook Graph API
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: access_token,
        fields: "id,name,email",
      },
    });

    // Token valid, lampirkan data Facebook ke request
    req.facebookUser = response.data;
    next();
  } catch (error) {
    console.error("Facebook token verification failed:", error.message);
    return res
      .status(401)
      .json({ error: "Token Facebook tidak valid atau expired" });
  }
};

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      console.error("Token verification error:", error);
    }
  }

  const { access_token } = req.body;

  if (access_token) {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: access_token,
          fields: "id,name,email",
        },
      });

      req.facebookUser = response.data;
      return next();
    } catch (error) {
      console.error("Facebook token verification error:", error);
    }
  }

  return res
    .status(401)
    .json({ error: "Akses ditolak: Autentikasi diperlukan." });
};

const authSupabase = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Token required!" });

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) return res.status(500).json({ message: "Supabase Error", error });

  req.user = user;

  next();
};

module.exports = {
  checkRole,
  verifyFacebookToken,
  requireAuth,
  authSupabase
};
