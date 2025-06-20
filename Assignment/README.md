# Shopping Cart REST API

A complete Node.js Express application with MongoDB for managing a shopping cart system. This application includes product management, authentication, file uploads, email sharing, and comprehensive error handling.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopping-cart-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Testing

### Run Tests
```bash
# Run all tests
npm test
```

## Postman/Thunderclient Collection

### Import Instructions
1. Open Postman/ThunderClient
2. Import the following collection Test_API in Test_API folder


### Environment Variables for Postman
Create a Postman environment with:
- `baseUrl`: `http://localhost:3000`
- `token`: Your JWT token (obtained from login)
- `productId`: MongoDB ObjectId of a product

## Error Handling

The application includes comprehensive error handling:
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

All errors are logged with timestamps and context information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 