
package com.payroll.service;

import com.payroll.entity.Employee;
import com.payroll.entity.Payroll;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.PayrollRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

    // Get all payroll records
    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    // Get payroll records for a specific month
    public List<Payroll> getPayrollByMonth(String month) {
        validateMonth(month);
        return payrollRepository.findByPayrollMonthOrderByIdDesc(month);
    }

    // Get payroll record by ID
    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payroll record not found with ID: " + id
                ));
    }

    // Process payroll for an employee
    @Transactional
    public Payroll processPayroll(Long employeeId, String month) {

        if (employeeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee ID is required"
            );
        }

        validateMonth(month);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with ID: " + employeeId
                ));

        if (payrollRepository
                .existsByEmployeeIdAndPayrollMonth(employeeId, month)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payroll already processed for this employee and month"
            );
        }

        BigDecimal basicSalary = employee.getBasicSalary();

        if (basicSalary == null || basicSalary.signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee basic salary must be zero or greater"
            );
        }

        // Example payroll rules — adjust to your company's policy.
        BigDecimal hra = percentage(basicSalary, "0.20");
        BigDecimal otherAllowance = percentage(basicSalary, "0.10");
        BigDecimal pfDeduction = percentage(basicSalary, "0.12");
        BigDecimal otherDeduction = new BigDecimal("500.00");

        BigDecimal grossSalary = basicSalary
                .add(hra)
                .add(otherAllowance);

        BigDecimal totalDeductions = pfDeduction
                .add(otherDeduction);

        BigDecimal netSalary = grossSalary
                .subtract(totalDeductions);

        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setPayrollMonth(month);
        payroll.setBasicSalary(money(basicSalary));
        payroll.setHra(hra);
        payroll.setOtherAllowance(otherAllowance);
        payroll.setPfDeduction(pfDeduction);
        payroll.setOtherDeduction(otherDeduction);
        payroll.setGrossSalary(money(grossSalary));
        payroll.setTotalDeductions(money(totalDeductions));
        payroll.setNetSalary(money(netSalary));

        return payrollRepository.save(payroll);
    }

    // Validate month format: YYYY-MM
    private void validateMonth(String month) {
        if (month == null || !month.matches("\\d{4}-\\d{2}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Month must use YYYY-MM format, for example 2026-10"
            );
        }

        try {
            YearMonth.parse(month);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payroll month: " + month
            );
        }
    }

    private BigDecimal percentage(
            BigDecimal amount, String rate) {
        return money(amount.multiply(new BigDecimal(rate)));
    }

    private BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
