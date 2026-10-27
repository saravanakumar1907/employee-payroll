
CREATE DATABASE IF NOT EXISTS employee_payroll;

USE employee_payroll;

CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    payroll_month CHAR(7) NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
    pf_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_salary DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_employee_month
        UNIQUE (employee_id, payroll_month)
);

INSERT INTO employees
(employee_code, full_name, email, department,
 designation, basic_salary, joining_date)
VALUES
('EMP001', 'Arun Kumar', 'arun@example.com', 'IT',
 'Software Engineer', 40000.00, '2024-01-15'),
('EMP002', 'Priya Devi', 'priya@example.com', 'HR',
 'HR Executive', 30000.00, '2024-03-01'),
('EMP003', 'Karthik Raj', 'karthik@example.com', 'Finance',
 'Accountant', 35000.00, '2023-11-10');
