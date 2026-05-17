import { isValidEmail, isValidUsername } from './helpers';

// ─── Auth Validations ─────────────────────────────────────────────────

export const validateSignup = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.username?.trim()) {
    errors.username = 'Username is required';
  } else if (!isValidUsername(values.username)) {
    errors.username = 'Username: 3-20 chars, lowercase letters, numbers, underscores only';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateLogin = (values) => {
  const errors = {};

  if (!values.username?.trim()) {
    errors.username = 'Username is required';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

// ─── Post Validations ─────────────────────────────────────────────────

export const validatePost = (values) => {
  const errors = {};
  const { category, content, title, itemType, itemDescription, location, departure, destination, departureTime, seatsAvailable } = values;

  // Content always required
  if (!content?.trim()) {
    errors.content = 'Content is required';
  } else if (content.length > 1000) {
    errors.content = 'Content must be under 1000 characters';
  }

  // Discussion: title required
  if (category === 'discussion') {
    if (!title?.trim()) {
      errors.title = 'Title is required for discussions';
    } else if (title.length > 100) {
      errors.title = 'Title must be under 100 characters';
    }
  }

  // Carpool: title required too
  if (category === 'carpool') {
    if (!title?.trim()) {
      errors.title = 'Title is required for carpool posts';
    } else if (title.length > 100) {
      errors.title = 'Title must be under 100 characters';
    }
    if (!departure?.trim()) errors.departure = 'Departure location is required';
    if (!destination?.trim()) errors.destination = 'Destination is required';
    if (!departureTime) {
      errors.departureTime = 'Departure time is required';
    } else if (new Date(departureTime) < new Date()) {
      errors.departureTime = 'Departure time must be in the future';
    }
    if (!seatsAvailable || seatsAvailable < 1) {
      errors.seatsAvailable = 'At least 1 seat must be available';
    }
  }

  // Lost & Found
  if (category === 'lost-found') {
    if (!itemType) errors.itemType = 'Please select Lost or Found';
    if (itemDescription && itemDescription.length > 300) {
      errors.itemDescription = 'Item description must be under 300 characters';
    }
  }

  return errors;
};

// ─── Comment Validation ───────────────────────────────────────────────

export const validateComment = (content) => {
  if (!content?.trim()) return 'Comment cannot be empty';
  if (content.length > 300) return 'Comment must be under 300 characters';
  return null;
};

// ─── Profile Validation ───────────────────────────────────────────────

export const validateProfile = (values) => {
  const errors = {};

  if (values.name !== undefined) {
    if (!values.name?.trim()) errors.name = 'Name is required';
    else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  }

  if (values.bio !== undefined && values.bio.length > 200) {
    errors.bio = 'Bio must be under 200 characters';
  }

  return errors;
};
