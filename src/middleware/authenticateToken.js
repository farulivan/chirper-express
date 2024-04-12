import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // If no token is found

  jwt.verify(token, 'secret', (err, user) => {
    if (err)
      return res.status(403).send({
        err: 'ERR_INVALID_ACCESS_TOKEN',
        msg: 'Invalid access token',
      });
    req.user = user;
    next();
  });
};

export default authenticateToken;
