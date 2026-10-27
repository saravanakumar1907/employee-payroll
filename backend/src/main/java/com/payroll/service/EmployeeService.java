
package com.payroll.service;

import com.payroll.entity.Employee;
import com.payroll.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // Get all employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Get employee by ID
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with ID: " + id
                ));
    }

    // Create a new employee
    public Employee createEmployee(Employee employee) {
        if (employeeRepository.existsByEmployeeCode(
                employee.getEmployeeCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Employee code already exists"
            );
        }

        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        employee.setId(null);
        return employeeRepository.save(employee);
    }

    // Update an existing employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existingEmployee = getEmployeeById(id);

        if (employeeRepository.existsByEmployeeCodeAndIdNot(
                updatedEmployee.getEmployeeCode(), id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Employee code already exists"
            );
        }

        if (employeeRepository.existsByEmailAndIdNot(
                updatedEmployee.getEmail(), id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        existingEmployee.setEmployeeCode(
                updatedEmployee.getEmployeeCode());
        existingEmployee.setFullName(updatedEmployee.getFullName());
        existingEmployee.setEmail(updatedEmployee.getEmail());
        existingEmployee.setDepartment(updatedEmployee.getDepartment());
        existingEmployee.setDesignation(updatedEmployee.getDesignation());
        existingEmployee.setBasicSalary(updatedEmployee.getBasicSalary());
        existingEmployee.setJoiningDate(updatedEmployee.getJoiningDate());

        return employeeRepository.save(existingEmployee);
    }

    // Delete an employee
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }
}
