export const extractErrorMessage = (error) => {
  const data = error?.response?.data;

  // Debug: Log the error to see what we're getting
  console.log("Error data:", data);
  console.log("Error response:", error?.response);
  console.log("Error status:", error?.response?.status);

  if (!data) {
    return "Network error. Please check your connection.";
  }

  // Handle custom error format with error_code
  if (data.error && typeof data.error === "string") {
    return data.error;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (typeof data === "object") {
    // Handle validation errors where field-specific errors exist
    const errorMessages = [];

    for (const [field, errors] of Object.entries(data)) {
      if (field === "error_code") continue; // Skip error_code field

      const value = Array.isArray(errors) ? errors.join(", ") : String(errors);
      // Don't include field name for single field errors to make it more user-friendly
      if (Object.keys(data).length === 1) {
        errorMessages.push(value);
      } else {
        errorMessages.push(`${field}: ${value}`);
      }
    }

    return errorMessages.join("\n");
  }

  return "Something went wrong. Please try again.";
};
