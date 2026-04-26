export const extractErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Network error. Please check your connection.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, errors]) => {
        const value = Array.isArray(errors) ? errors.join(", ") : String(errors);
        return `${field}: ${value}`;
      })
      .join("\n");
  }

  return "Something went wrong. Please try again.";
};
