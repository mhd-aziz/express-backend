// src/routes/employeeRoutes.js
const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware"); // Perbarui impor middleware
const { sendErrorResponse } = require("../utils/errorUtils");

/**
 * Middleware untuk validasi input data pegawai
 */
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

/**
 * Middleware untuk validasi parameter ID pegawai
 */
const validateEmployeeId = [
    param("id")
        .isInt({ gt: 0 })
        .withMessage("Employee ID must be a positive integer."),
];

/**
 * @api {get} /employees Get all employees
 * @apiName GetAllEmployees
 * @apiGroup Employee
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess (200) {Object[]} employees List of employees.
 *
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (500) {String} error Server error.
 */
router.get(
    "/",
    authMiddleware, // Gunakan authMiddleware
    employeeController.getAllEmployees
);

/**
 * @api {get} /employees/:id Get employee by ID
 * @apiName GetEmployeeById
 * @apiGroup Employee
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Employee's unique ID.
 *
 * @apiSuccess (200) {Object} employee Employee data.
 *
 * @apiError (400) {String} error Invalid employee ID.
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (404) {String} error Employee not found.
 * @apiError (500) {String} error Server error.
 */
router.get(
    "/:id",
    authMiddleware, // Gunakan authMiddleware
    validateEmployeeId,
    employeeController.getEmployeeById
);

/**
 * @api {post} /employees Create a new employee
 * @apiName CreateEmployee
 * @apiGroup Employee
 *
 * @apiHeader {String} Authorization Bearer token.
 * @apiHeader {String} Content-Type application/json.
 *
 * @apiParam (Body) {String} firstName First name of the employee.
 * @apiParam (Body) {String} lastName Last name of the employee.
 * @apiParam (Body) {String} email Email of the employee.
 * @apiParam (Body) {String} [phoneNumber] Phone number of the employee.
 * @apiParam (Body) {Date} hireDate Hire date of the employee.
 * @apiParam (Body) {String} [jobTitle] Job title of the employee.
 * @apiParam (Body) {String} [department] Department of the employee.
 * @apiParam (Body) {Number} [salary] Salary of the employee.
 *
 * @apiSuccess (201) {Object} employee Created employee data.
 *
 * @apiError (400) {String} error Validation failed or email already exists.
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (500) {String} error Server error.
 */
router.post(
    "/",
    authMiddleware, // Gunakan authMiddleware
    validateEmployee,
    employeeController.createEmployee
);

/**
 * @api {put} /employees/:id Update an existing employee
 * @apiName UpdateEmployee
 * @apiGroup Employee
 *
 * @apiHeader {String} Authorization Bearer token.
 * @apiHeader {String} Content-Type application/json.
 *
 * @apiParam {Number} id Employee's unique ID.
 *
 * @apiParam (Body) {String} [firstName] First name of the employee.
 * @apiParam (Body) {String} [lastName] Last name of the employee.
 * @apiParam (Body) {String} [email] Email of the employee.
 * @apiParam (Body) {String} [phoneNumber] Phone number of the employee.
 * @apiParam (Body) {Date} [hireDate] Hire date of the employee.
 * @apiParam (Body) {String} [jobTitle] Job title of the employee.
 * @apiParam (Body) {String} [department] Department of the employee.
 * @apiParam (Body) {Number} [salary] Salary of the employee.
 *
 * @apiSuccess (200) {Object} employee Updated employee data.
 *
 * @apiError (400) {String} error Validation failed or email already exists.
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (404) {String} error Employee not found.
 * @apiError (500) {String} error Server error.
 */
router.put(
    "/:id",
    authMiddleware, // Gunakan authMiddleware
    validateEmployeeId,
    validateEmployee,
    employeeController.updateEmployee
);

/**
 * @api {delete} /employees/:id Delete an employee
 * @apiName DeleteEmployee
 * @apiGroup Employee
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Employee's unique ID.
 *
 * @apiSuccess (200) {String} message Confirmation message.
 *
 * @apiError (400) {String} error Invalid employee ID.
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (404) {String} error Employee not found.
 * @apiError (500) {String} error Server error.
 */
router.delete(
    "/:id",
    authMiddleware, // Gunakan authMiddleware
    validateEmployeeId,
    employeeController.deleteEmployee
);

module.exports = router;
