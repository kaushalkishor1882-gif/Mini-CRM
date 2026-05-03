
module.exports = function validateLead(data) {
  const { name, email, source } = data;

  if (!name || !email || !source) {
    return "All fields (name, email, source) are required";
  }

  const emailRegex = /.+\@.+\..+/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
};

