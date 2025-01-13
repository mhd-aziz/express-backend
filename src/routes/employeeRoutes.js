const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");
const { sendErrorResponse } = require("../utils/errorUtils");

const validateEmployee = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 50 })
        .withMessage("First name cannot exceed 50 characters."),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ max: 50 })
        .withMessage("Last name cannot exceed 50 characters."),
    body("email")
        .isEmail()
        .withMessage("Valid email is required.")
        .isLength({ max: 100 })
        .withMessage("Email cannot exceed 100 characters."),
    body("phoneNumber")
        .optional()
        .isLength({ max: 20 })
        .withMessage("Phone number cannot exceed 20 characters."),
    body("hireDate")
        .isISO8601()
        .withMessage("Valid hire date is required."),
    body("jobTitle")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Job title cannot exceed 100 characters."),
    body("department")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Department cannot exceed 100 characters."),
    body("salary")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Salary must be a positive number."),
];

const validateEmployeeId = [
    param("id")
        .isInt({ gt: 0 })
        .withMessage("Employee ID must be a positive integer."),
];

router.get(
    "/",
    authMiddleware,
    employeeController.getAllEmployees
);

router.get(
    "/:id",
    authMiddleware,
    validateEmployeeId,
    employeeController.getEmployeeById
);

router.post(
    "/",
    authMiddleware,
    validateEmployee,
    employeeController.createEmployee
);

router.put(
    "/:id",
    authMiddleware,
    validateEmployeeId,
    validateEmployee,
    employeeController.updateEmployee
);

router.delete(
    "/:id",
    authMiddleware,
    validateEmployeeId,
    employeeController.deleteEmployee
);

module.exports = router;
