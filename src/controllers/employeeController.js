// src/controllers/employeeController.js
const employeeService = require("../services/employeeService");
const { sendErrorResponse } = require("../utils/errorUtils");

/**
 * Get All Employees Controller
 */
const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await employeeService.getAllEmployees();
        res.json(employees);
    } catch (error) {
        sendErrorResponse(res, 500, 'Server error');
        next(error);
    }
};

/**
 * Get Employee By ID Controller
 */
const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await employeeService.getEmployeeById(parseInt(id, 10));

        if (!employee) {
            return sendErrorResponse(res, 404, 'Employee not found');
        }

        res.json(employee);
    } catch (error) {
        sendErrorResponse(res, 500, 'Server error');
        next(error);
    }
};

/**
 * Create New Employee Controller
 */
const createEmployee = async (req, res, next) => {
    try {
        const employeeData = req.body;
        const newEmployee = await employeeService.createEmployee(employeeData);
        res.status(201).json(newEmployee);
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return sendErrorResponse(res, 400, 'Email already exists');
        }
        sendErrorResponse(res, 500, 'Server error');
        next(error);
    }
};

/**
 * Update Employee Controller
 */
const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employeeData = req.body;

        const updatedEmployee = await employeeService.updateEmployee(parseInt(id, 10), employeeData);

        res.json(updatedEmployee);
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return sendErrorResponse(res, 400, 'Email already exists');
        }
        if (error.code === 'P2025') { // Record to update not found
            return sendErrorResponse(res, 404, 'Employee not found');
        }
        sendErrorResponse(res, 500, 'Server error');
        next(error);
    }
};

/**
 * Delete Employee Controller
 */
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        await employeeService.deleteEmployee(parseInt(id, 10));
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') { // Record to delete not found
            return sendErrorResponse(res, 404, 'Employee not found');
        }
        sendErrorResponse(res, 500, 'Server error');
        next(error);
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
