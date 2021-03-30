const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../auth/secrets');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(JWT_SECRET)

  if (!token) {
    res.status(401).json({ message: 'token required' });
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err)
        res.status(401).json({ message: 'token invalid' });
      } else {
        req.decodedJwt = decoded;
        console.log(req.decodedJwt)
        next();
      }
    });
  }
};