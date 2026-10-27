
package com.payroll.controller;

import com.payroll.entity.Payroll;
import com.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://localhost:3000"
})
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // Get payroll records for a specific month
    @GetMapping
    public List<Payroll> getPayrollByMonth(
            @RequestParam(required = false) String month) {

        if (month == null || month.isBlank()) {
            return payrollService.getAllPayrolls();
        }

        return payrollService.getPayrollByMonth(month);
    }

    // Get complete payroll history
    @GetMapping("/history")
    public List<Payroll> getPayrollHistory() {
        return payrollService.getAllPayrolls();
    }

    // Process payroll for an employee
    @PostMapping("/process")
    @ResponseStatus(HttpStatus.CREATED)
    public Payroll processPayroll(
            @Valid @RequestBody PayrollRequest request) {

        return payrollService.processPayroll(
                request.getEmployeeId(),
                request.getMonth()
        );
    }

    // Get payroll record by ID
    @GetMapping("/{id}")
    public Payroll getPayrollById(@PathVariable Long id) {
        return payrollService.getPayrollById(id);
    }

    // Request body for processing payroll
    public static class PayrollRequest {

        private Long employeeId;
        private String month;

        public Long getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(Long employeeId) {
            this.employeeId = employeeId;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }
    }
}

