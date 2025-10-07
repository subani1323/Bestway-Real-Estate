/**
 * Formats a phone number string to xxx-xxx-xxxx format
 * @param {string} value - The input phone number string
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Limit to 10 digits
  const trimmed = phoneNumber.slice(0, 10);

  // Format as xxx-xxx-xxxx
  if (trimmed.length >= 6) {
    return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  } else if (trimmed.length >= 3) {
    return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
  } else {
    return trimmed;
  }
};

/**
 * Handles phone number input change with automatic formatting
 * @param {Event} e - The input change event
 * @param {Function} setValue - Function to update the value
 */
export const handlePhoneNumberChange = (e, setValue) => {
  const { name, value } = e.target;
  const formattedValue = formatPhoneNumber(value);
  setValue((prev) => ({
    ...prev,
    [name]: formattedValue,
  }));
};
