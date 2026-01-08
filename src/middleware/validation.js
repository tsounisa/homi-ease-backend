export const validate = (schema) => (req, res, next) => {
  if (schema) {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
  }
  next();
};
