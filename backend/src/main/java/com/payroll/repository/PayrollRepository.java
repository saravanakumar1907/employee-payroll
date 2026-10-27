
package com.payroll.repository;

import com.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollRepository
        extends JpaRepository<Payroll, Long> {

    List<Payroll> findByPayrollMonthOrderByIdDesc(
            String payrollMonth);

    boolean existsByEmployeeIdAndPayrollMonth(
            Long employeeId, String payrollMonth);
}
