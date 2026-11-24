export const CONTACT_LIMITS = { name: 80, email: 254, subject: 140, message: 3000 };
export function validateContact(input) {
  const values = Object.fromEntries(['name', 'email', 'subject', 'message'].map(key => [key, typeof input?.[key] === 'string' ? input[key].trim() : '']));
  const errors = {};
  if (values.name.length < 2 || values.name.length > 80) errors.name = 'Enter a name between 2 and 80 characters.';
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(values.email) || values.email.length > 254) errors.email = 'Enter a valid email address.';
  if (values.subject.length < 3 || values.subject.length > 140) errors.subject = 'Enter a subject between 3 and 140 characters.';
  if (values.message.length < 20 || values.message.length > 3000) errors.message = 'Write a message between 20 and 3,000 characters.';
  for (const key of ['name', 'email', 'subject']) if (/[\x00-\x1f\x7f]/.test(values[key])) errors[key] = 'Line breaks and control characters are not allowed here.';
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(values.message)) errors.message = 'Remove unsupported control characters.';
  return { values, errors, valid: Object.keys(errors).length === 0 };
}
