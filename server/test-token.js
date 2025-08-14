import jwt from 'jsonwebtoken';

// Use the same JWT secret from .env
const JWT_SECRET = 'BetterBeing2025SecureJWTKeyForDevelopment123456789';

// Create a test token for user ID 1 (john@test.com)
const payload = {
  id: 1,
  email: 'john@test.com',
  firstName: 'John',
  lastName: 'Doe'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:');
console.log(token);