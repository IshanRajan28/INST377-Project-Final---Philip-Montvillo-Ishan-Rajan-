const MIN_PASSWORD_LENGTH = 6;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateAuthInput(email, password, { forSignUp = false } = {}) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { ok: false, message: "Enter your email address." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (!password) {
    return { ok: false, message: "Enter your password." };
  }

  if (forSignUp && password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  return { ok: true, email: normalizedEmail };
}

export function formatAuthError(error) {
  if (!error) {
    return "Something went wrong. Try again.";
  }

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox for the link.";
  }

  if (message.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (message.includes("rate limit") || error.status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }

  return error.message || "Something went wrong. Try again.";
}

export function getSignUpResultMessage(data) {
  if (data?.user?.identities?.length === 0) {
    return {
      type: "error",
      message: "An account with this email already exists. Sign in instead.",
    };
  }

  if (data?.session) {
    return {
      type: "success",
      message: "Account created. You're signed in.",
    };
  }

  return {
    type: "success",
    message:
      "Account created. Check your email for a confirmation link before signing in.",
  };
}
