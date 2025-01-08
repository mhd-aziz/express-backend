// src/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();

/**
 * Swagger Definition
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API",
      version: "1.0.0",
      description: "API untuk autentikasi pengguna",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
      // Anda dapat menambahkan server produksi di sini
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Error message describing what went wrong.",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Success message.",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "johndoe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongP@ssw0rd",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "johndoe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "StrongP@ssw0rd",
            },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "johndoe@example.com",
            },
          },
        },
        ConfirmOtpRequest: {
          type: "object",
          required: ["otp"],
          properties: {
            otp: {
              type: "string",
              example: "123456",
            },
          },
        },
        ConfirmOtpResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example:
                "OTP confirmed. Use the reset token to set a new password.",
            },
            resetToken: {
              type: "string",
              example: "your_reset_token_here",
            },
          },
        },
        SetNewPasswordRequest: {
          type: "object",
          required: ["resetToken", "newPassword"],
          properties: {
            resetToken: {
              type: "string",
              example: "your_reset_token_here",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "NewStrongP@ssw0rd",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["oldPassword", "confirmOldPassword", "newPassword"],
          properties: {
            oldPassword: {
              type: "string",
              format: "password",
              example: "OldP@ssw0rd",
            },
            confirmOldPassword: {
              type: "string",
              format: "password",
              example: "OldP@ssw0rd",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "NewStrongP@ssw0rd",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: [
    path.join(__dirname, "routes/*.js"),
    path.join(__dirname, "controllers/*.js"),
  ],
};

/**
 * Generate Swagger Specification
 */
const specs = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 * @param {Object} app - Express application instance
 */
module.exports = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

  // Optional: Serve Swagger JSON at /swagger.json
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};
