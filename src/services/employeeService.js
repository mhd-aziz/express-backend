// src/services/employeeService.js
const prisma = require('../prisma');

/**
 * Get All Employees
 */
const getAllEmployees = async () => {
    return await prisma.employee.findMany({
        orderBy: { id: 'asc' },
    });
};

/**
 * Get Employee By ID
 * @param {number} id - Employee ID
 */
const getEmployeeById = async (id) => {
    return await prisma.employee.findUnique({
        where: { id },
    });
};

/**
 * Create New Employee
 * @param {Object} data - Employee data
 */
const createEmployee = async (data) => {
    return await prisma.employee.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            hireDate: new Date(data.hireDate),
            jobTitle: data.jobTitle,
            department: data.department,
            salary: data.salary,
        },
    });
};

/**
 * Update Employee
 * @param {number} id - Employee ID
 * @param {Object} data - Employee data to update
 */
const updateEmployee = async (id, data) => {
    // Cek apakah pegawai ada
    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
        const error = new Error('Employee not found');
        error.code = 'P2025'; // Prisma error code for not found
        throw error;
    }

    return await prisma.employee.update({
        where: { id },
        data: {
            firstName: data.firstName || existingEmployee.firstName,
            lastName: data.lastName || existingEmployee.lastName,
            email: data.email || existingEmployee.email,
            phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : existingEmployee.phoneNumber,
            hireDate: data.hireDate ? new Date(data.hireDate) : existingEmployee.hireDate,
            jobTitle: data.jobTitle !== undefined ? data.jobTitle : existingEmployee.jobTitle,
            department: data.department !== undefined ? data.department : existingEmployee.department,
            salary: data.salary !== undefined ? data.salary : existingEmployee.salary,
        },
    });
};

/**
 * Delete Employee
 * @param {number} id - Employee ID
 */
const deleteEmployee = async (id) => {
    return await prisma.employee.delete({
        where: { id },
    });
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
