import jwt from "jsonwebtoken";

/**
 * Generate access + refresh token pair
 * @param {Object} payload - { id, role }
 * @returns {{ accessToken, refreshToken }}
 */
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

  return { accessToken, refreshToken };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Attach token to response as httpOnly cookie + return in body
 */
export const sendTokenResponse = (res, user, statusCode = 200) => {
  const payload = { id: user._id, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  return res.status(statusCode).json({
    success: true,
    accessToken,
    user: userObj,
  });
};
