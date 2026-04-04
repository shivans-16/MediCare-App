

module.exports = (req, res, next) => {
  res.ok = (data, message = "OK") => {
    res.status(200).json({ success: true, message, data });
  };

  res.created = (data, message = "Created") => {
    res.status(201).json({ success: true, message, data });
  };

  res.badRequest = (message = "Bad Request", errors = []) => {
    res.status(400).json({ success: false, message, errors });
  };

  res.unauthorized = (message = "Unauthorized") => {
    res.status(401).json({ success: false, message });
  };
     res.forbidden = (message = 'forbidden',) =>
    res.status(403).json({ success: false, message });

  res.serverError = (message = "Server Error", errors = []) => {
    res.status(500).json({ success: false, message, errors });
  };

  next();
};

