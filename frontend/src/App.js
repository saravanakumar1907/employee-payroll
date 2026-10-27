
import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "./api";
import "./App.css";

const emptyEmployee = {
  employeeCode: "",
  fullName: "",
  email: "",
  department: "",
  designation: "",
  basicSalary: "",
  joiningDate: "",
};

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function validateEmployee(employee, employees, editingId) {
  const errors = {};

  const code = employee.employeeCode.trim();
  const name = employee.fullName.trim();
  const email = employee.email.trim().toLowerCase();
  const designation = employee.designation.trim();
  const salary = employee.basicSalary;
  const joiningDate = employee.joiningDate;

  if (!code) {
    errors.employeeCode = "Employee code is required.";
  } else if (!/^[A-Za-z0-9-]+$/.test(code)) {
    errors.employeeCode = "Use only letters, numbers, and hyphens.";
  } else if (
    employees.some(
      (item) =>
        item.id !== editingId &&
        item.employeeCode?.trim().toLowerCase() === code.toLowerCase()
    )
  ) {
    errors.employeeCode = "This employee code already exists.";
  }

  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (name.length < 2) {
    errors.fullName = "Name must contain at least 2 characters.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (
    employees.some(
      (item) =>
        item.id !== editingId &&
        item.email?.trim().toLowerCase() === email
    )
  ) {
    errors.email = "This email address is already registered.";
  }

  if (!employee.department) {
    errors.department = "Please select a department.";
  }

  if (!designation) {
    errors.designation = "Designation is required.";
  }

  if (
    salary === "" ||
    salary === null ||
    !Number.isFinite(Number(salary))
  ) {
    errors.basicSalary = "Enter a valid salary.";
  } else if (Number(salary) < 0) {
    errors.basicSalary = "Salary cannot be negative.";
  }

  if (!joiningDate) {
    errors.joiningDate = "Joining date is required.";
  } else {
    const date = new Date(`${joiningDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(date.getTime())) {
      errors.joiningDate = "Enter a valid joining date.";
    } else if (date > today) {
      errors.joiningDate = "Joining date cannot be in the future.";
    }
  }

  return errors;
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(emptyEmployee);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load employees. Check that Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return employees;

    return employees.filter((item) =>
      [
        item.employeeCode,
        item.fullName,
        item.email,
        item.department,
        item.designation,
      ].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [employees, search]);

  const totalPayroll = employees.reduce(
    (total, item) => total + Number(item.basicSalary || 0),
    0
  );

  const averageSalary = employees.length
    ? totalPayroll / employees.length
    : 0;

  const departmentData = useMemo(() => {
    const counts = {};

    employees.forEach((item) => {
      const department = item.department || "Other";
      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [employees]);

  const salaryData = useMemo(
    () =>
      employees.slice(0, 8).map((item) => ({
        name: item.fullName,
        salary: Number(item.basicSalary || 0),
      })),
    [employees]
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setEmployee((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEmployee(emptyEmployee);
    setFieldErrors({});
    setEditingId(null);
  }

  function openAddForm() {
    resetForm();
    setError("");
    setSuccess("");
    setActivePage("Add Employee");
  }

  function openEditForm(item) {
    setEmployee({
      employeeCode: item.employeeCode || "",
      fullName: item.fullName || "",
      email: item.email || "",
      department: item.department || "",
      designation: item.designation || "",
      basicSalary: String(item.basicSalary ?? ""),
      joiningDate: item.joiningDate || "",
    });

    setEditingId(item.id);
    setFieldErrors({});
    setError("");
    setSuccess("");
    setActivePage("Add Employee");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateEmployee(employee, employees, editingId);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      ...employee,
      employeeCode: employee.employeeCode.trim(),
      fullName: employee.fullName.trim(),
      email: employee.email.trim().toLowerCase(),
      department: employee.department,
      designation: employee.designation.trim(),
      basicSalary: Number(employee.basicSalary),
      joiningDate: employee.joiningDate,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await updateEmployee(editingId, payload);
        setSuccess("Employee updated successfully.");
      } else {
        await addEmployee(payload);
        setSuccess("Employee added successfully.");
      }

      resetForm();
      await loadEmployees();
      setActivePage("Employees");
    } catch (err) {
      setError(
        "Could not save the employee. Check the backend and try again. The employee code or email may already exist."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteEmployee(id);
      setEmployees((previous) => previous.filter((item) => item.id !== id));
      setSuccess("Employee deleted successfully.");
    } catch (err) {
      setError("Could not delete the employee. Please try again.");
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div>
            <h1>Employee Payroll Management System</h1>
          </div>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <button
          className={`nav-link ${activePage === "Dashboard" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Dashboard");
            setError("");
          }}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className={`nav-link ${activePage === "Employees" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Employees");
            setError("");
          }}
        >
          <span>♙</span> Employees
        </button>

        <button
          className={`nav-link ${activePage === "Add Employee" ? "active" : ""}`}
          onClick={openAddForm}
        >
          <span>＋</span> Add Employee
        </button>

        
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Manage your employees and payroll information.</p>
          </div>
          <button className="primary-button" onClick={openAddForm}>
            + Add Employee
          </button>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {activePage === "Dashboard" && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Employees</p>
                <h2>{employees.length}</h2>
                <span>Registered employees</span>
              </div>

              <div className="stat-card">
                <p>Monthly Basic Payroll</p>
                <h2>{money(totalPayroll)}</h2>
                <span>Before deductions</span>
              </div>

              <div className="stat-card">
                <p>Average Basic Salary</p>
                <h2>{money(averageSalary)}</h2>
                <span>Per employee</span>
              </div>

              <div className="stat-card">
                <p>Departments</p>
                <h2>{departmentData.length}</h2>
                <span>Active departments</span>
              </div>
            </section>

            <section className="charts-grid">
              <div className="panel">
                <div className="panel-heading">
                  <h3>Employees by Department</h3>
                </div>

                {departmentData.length === 0 ? (
                  <p className="empty-state">No department data available.</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          label
                        >
                          {departmentData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <h3>Basic Salary by Employee</h3>
                </div>

                {salaryData.length === 0 ? (
                  <p className="empty-state">No salary data available.</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={salaryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip formatter={(value) => money(value)} />
                        <Bar
                          dataKey="salary"
                          fill="#4f46e5"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>

            <EmployeeTable
              employees={filteredEmployees.slice(0, 5)}
              search={search}
              setSearch={setSearch}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onViewAll={() => setActivePage("Employees")}
              loading={loading}
            />
          </>
        )}

        {activePage === "Employees" && (
          <EmployeeTable
            employees={filteredEmployees}
            search={search}
            setSearch={setSearch}
            onEdit={openEditForm}
            onDelete={handleDelete}
            loading={loading}
          />
        )}

        {activePage === "Add Employee" && (
          <section className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h3>{editingId !== null ? "Edit Employee" : "Add New Employee"}</h3>
                <p>Enter the employee details below.</p>
              </div>
            </div>

            <form className="employee-form" onSubmit={handleSubmit} noValidate>
              <FormField
                label="Employee Code"
                name="employeeCode"
                value={employee.employeeCode}
                onChange={handleChange}
                error={fieldErrors.employeeCode}
                placeholder="Example: EMP008"
              />

              <FormField
                label="Full Name"
                name="fullName"
                value={employee.fullName}
                onChange={handleChange}
                error={fieldErrors.fullName}
                placeholder="Enter full name"
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={employee.email}
                onChange={handleChange}
                error={fieldErrors.email}
                placeholder="employee@example.com"
              />

              <label>
                Department
                <select
                  name="department"
                  value={employee.department}
                  onChange={handleChange}
                  className={fieldErrors.department ? "input-invalid" : ""}
                  aria-invalid={Boolean(fieldErrors.department)}
                >
                  <option value="">Select department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Data Analytics">Data Analytics</option>
                </select>
                <FieldError message={fieldErrors.department} />
              </label>

              <FormField
                label="Designation"
                name="designation"
                value={employee.designation}
                onChange={handleChange}
                error={fieldErrors.designation}
                placeholder="Example: Software Engineer"
              />

              <FormField
                label="Basic Salary (₹)"
                name="basicSalary"
                type="number"
                value={employee.basicSalary}
                onChange={handleChange}
                error={fieldErrors.basicSalary}
                placeholder="Enter basic salary"
              />

              <FormField
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={employee.joiningDate}
                onChange={handleChange}
                error={fieldErrors.joiningDate}
                max={new Date().toLocaleDateString("en-CA")}
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    resetForm();
                    setActivePage("Employees");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Employee"
                    : "Save Employee"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <span className="field-error" role="alert">
      {message}
    </span>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  max,
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        className={error ? "input-invalid" : ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function EmployeeTable({
  employees,
  search,
  setSearch,
  onEdit,
  onDelete,
  onViewAll,
  loading,
}) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading table-heading">
        <div>
          <h3>Employee List</h3>
          <p>View and manage employee records.</p>
        </div>

        <input
          className="search-input"
          type="search"
          placeholder="Search employees..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="empty-state">Loading employees...</p>
      ) : employees.length === 0 ? (
        <p className="empty-state">No employees found.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Basic Salary</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="employee-name">{item.fullName}</div>
                    <small>{item.employeeCode}</small>
                    <small>{item.email}</small>
                  </td>
                  <td>{item.department}</td>
                  <td>{item.designation}</td>
                  <td>{money(item.basicSalary)}</td>
                  <td>{item.joiningDate || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => onEdit(item)} type="button">Edit
                      </button>
                      <button className="delete-button" onClick={() => onDelete(item.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onViewAll && (
        <div className="view-all">
          <button className="text-button" onClick={onViewAll} type="button">
            View all employees →
          </button>
        </div>
      )}
    </section>
  );
}

export default App;
