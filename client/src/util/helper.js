// Function to decode the payload from the token
export const decodeTokenPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) throw new Error("Invalid token format.");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    // console.log("Decoded token payload:", jsonPayload);
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token payload:", error);
    return null; // Return null if decoding fails
  }
};

// Function to validate email
export const validateEmail = (user_email) => {
  // Check if email is empty
  if (!user_email) {
    return {
      valid: false,
      message: "Email is required",
    };
  }

  // Check if email includes '@'
  if (!user_email.includes("@")) {
    return {
      valid: false,
      message: "Invalid email format",
    };
  }

  // Validate email format using regex
  const regex = /^\S+@\S+\.\S+$/;
  if (!regex.test(user_email)) {
    return {
      valid: false,
      message: "Invalid email format",
    };
  }

  return { valid: true, message: "Email is valid." };
};

// Function to validate password and ensure it is strong
// helpers/passwordHelper.js

export const validatePassword = (user_password) => {
  const validations = [
    { regex: /.{8,}/, message: "At least 8 characters" },
    { regex: /[A-Z]/, message: "At least one uppercase letter" },
    { regex: /[a-z]/, message: "At least one lowercase letter" },
    { regex: /\d/, message: "At least one digit" },
    {
      regex: /[!@#$%^&*]/,
      message: "At least one special character",
    },
  ];

  const errors = validations
    .filter((validation) => !validation.regex.test(user_password))
    .map((validation) => validation.message);

  if (errors.length) {
    return { valid: false, message: errors.join(", ") };
  }

  return { valid: true, message: "" };
};

// Function to check if a date string is valid (YYYY-MM-DD format)
export const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
  return regex.test(dateString);
};

// Function to format a date string into a readable format
export const formatDate = (
  dateString,
  options = { year: "numeric", month: "short", day: "numeric" }
) => {
  return new Date(dateString).toLocaleDateString(undefined, options);
};
export const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);

  // Edge case: if the date is in the future
  if (seconds < 0) return "In the future";

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
};



// Function to format a currency amount
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Function to filter attendance by date
export const filterAttendanceByDate = (attendance, date) => {
  return attendance.filter(
    (item) =>
      new Date(item.date).toLocaleDateString() ===
      new Date(date).toLocaleDateString()
  );
};

export const idGenerate = (user_id, user_type) => {
  if (user_type == "admin") {
    return "EMS" + user_id + "00A";
  } else if (user_type == "teacher") {
    return "EMS" + user_id + "00T";
  } else if (user_type == "Student") {
    return "EMS" + user_id + "00S";
  } else if (user_type == "parent") {
    return "EMS" + user_id + "00P";
  }
};

