import {
  generateSecret,
  generateURI,
  verifySync,
} from "otplib";

export function createTotpSecret() {
  return generateSecret();
}

export function getTotpUri(email: string, secret: string) {
  return generateURI({
    issuer: "Auctions Evtinko",
    label: email,
    secret,
  });
}

export function verifyTotpCode(code: string, secret: string) {
  try {
    const result = verifySync({ token: String(code || "").trim(), secret });
    return !!(result && (result as { valid?: boolean }).valid);
  } catch {
    return false;
  }
}
