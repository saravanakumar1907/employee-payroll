
package com.payroll.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "payrolls",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_payroll_month",
            columnNames = {"employee_id", "payroll_month"}
        )
    }
)
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotBlank(message = "Payroll month is required")
    @Pattern(
        regexp = "\\d{4}-(0[1-9]|1[0-2])",
        message = "Payroll month must be in YYYY-MM format"
    )
    @Column(name = "payroll_month", nullable = false, length = 7)
    private String payrollMonth;

    @Column(name = "basic_salary",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "other_allowance",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal otherAllowance;

    @Column(name = "pf_deduction",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal pfDeduction;

    @Column(name = "other_deduction",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal otherDeduction;

    @Column(name = "gross_salary",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "total_deductions",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_salary",
            nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "processed_at",
            nullable = false, updatable = false)
    private LocalDateTime processedAt;

    // Automatically set the processing timestamp
    @PrePersist
    protected void onCreate() {
        if (processedAt == null) {
            processedAt = LocalDateTime.now();
        }
    }

    // Default constructor required by JPA
    public Payroll() {
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getPayrollMonth() {
        return payrollMonth;
    }

    public void setPayrollMonth(String payrollMonth) {
        this.payrollMonth = payrollMonth;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getOtherAllowance() {
        return otherAllowance;
    }

    public void setOtherAllowance(BigDecimal otherAllowance) {
        this.otherAllowance = otherAllowance;
    }

    public BigDecimal getPfDeduction() {
        return pfDeduction;
    }

    public void setPfDeduction(BigDecimal pfDeduction) {
        this.pfDeduction = pfDeduction;
    }

    public BigDecimal getOtherDeduction() {
        return otherDeduction;
    }

    public void setOtherDeduction(BigDecimal otherDeduction) {
        this.otherDeduction = otherDeduction;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
