const jwt = require('jsonwebtoken');
const { Doctor } = require('../model/doctor');   
const { Patient } = require('../model/patient'); 

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const header = req.headers.authorization;
      const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Missing token' });

      const decode = jwt.verify(token, process.env.JWT_SECRET);

      if (decode.type === 'doctor') {
        req.user = await Doctor.findById(decode._id);
      } else if (decode.type === 'patient') {
        req.user = await Patient.findById(decode._id);
      }

      if (!req.user) return res.status(401).json({ message: 'Invalid user' });

      req.userRole = decode.type;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  },

  requireRole: (role) => (req, res, next) => {
    if (!req.user || (req.user.type !== role && req.userRole !== role)) {
      return res.status(403).json({ message: 'Insufficient role permissions' });
    }
    next();
  }
};
