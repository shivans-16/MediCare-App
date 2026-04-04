


// validator.js — make sure it's exported correctly
const { validationResult } = require('express-validator');

const validate = (req, res, next) => { // ✅ must be a named function export
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validate }; 