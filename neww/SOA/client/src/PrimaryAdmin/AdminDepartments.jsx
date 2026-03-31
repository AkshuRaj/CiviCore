import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    department_name: "",
    department_description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [sortBy, setSortBy] = useState("department_name");
  const [order, setOrder] = useState("asc");
  const [expandedRows, setExpandedRows] = useState({}); // track which descriptions are expanded

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/adminlogin");
      return;
    }
    fetchDepartments();
  }, [navigate, token, pagination.page, sortBy, order, search]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          sortBy,
          order,
          search,
        },
      });

      const apiData = res.data;
      setDepartments(apiData?.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: apiData?.pagination?.totalPages || 1,
        total: apiData?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= ADD / EDIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Edit mode
        await axios.put(
          `http://localhost:5000/api/departments/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Optimistically update the row in the table
        setDepartments((prev) =>
          prev.map((d) => (d.department_id === editId ? { ...d, ...form } : d)),
        );
      } else {
        // Add mode
        const res = await axios.post(
          "http://localhost:5000/api/departments",
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // Optimistically add new department at the top
        const newDept = {
          department_id: res.data.id || Date.now(), // fallback if backend doesn't return ID
          department_name: form.department_name,
          department_description: form.department_description,
          status: "ACTIVE",
        };

        setDepartments((prev) => [newDept, ...prev]);
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
      }

      // Reset form
      setForm({ department_name: "", department_description: "" });
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      console.error("Failed to submit department", error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await axios.put(
        `http://localhost:5000/api/departments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setDepartments((prev) =>
        prev.map((d) =>
          d.department_id === id ? { ...d, status: newStatus } : d,
        ),
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleEditClick = (department) => {
    setForm({
      department_name: department.department_name,
      department_description: department.department_description,
    });
    setIsEditing(true);
    setEditId(department.department_id);
    setShowForm(true);
  };

  const handleBack = () => {
    setForm({ department_name: "", department_description: "" });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const toggleDescription = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------- Styles ----------
  const styles = {
    container: {
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
      color: "#2c3e50",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    title: { fontSize: "26px", fontWeight: "700", marginBottom: "10px" },
    addButton: {
      padding: "10px 20px",
      fontSize: "16px",
      backgroundColor: "#16a085",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    },
    searchInput: {
      padding: "10px 15px",
      fontSize: "16px",
      width: "300px",
      borderRadius: "8px",
      border: "1.5px solid #ccc",
      outline: "none",
      marginBottom: "15px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    },
    th: {
      backgroundColor: "#16a085",
      color: "#fff",
      fontWeight: "600",
      padding: "12px",
      textAlign: "left",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee",
      verticalAlign: "middle",
    },
    statusButton: {
      padding: "6px 14px",
      borderRadius: "6px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      color: "#fff",
    },
    activeStatus: { backgroundColor: "#27ae60" },
    inactiveStatus: { backgroundColor: "#c0392b" },
    slideOverContainer: {
      position: "fixed",
      top: 0,
      right: showForm ? 0 : "-400px",
      width: "350px",
      height: "100vh",
      backgroundColor: "#fff",
      boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
      padding: "30px 25px",
      boxSizing: "border-box",
      transition: "right 0.4s ease-in-out",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
    },
    formTitle: {
      fontSize: "22px",
      fontWeight: "700",
      marginBottom: "20px",
      color: "#16a085",
    },
    input: {
      marginBottom: "18px",
      padding: "12px 15px",
      fontSize: "16px",
      borderRadius: "8px",
      border: "1.5px solid #ccc",
      outline: "none",
      boxSizing: "border-box",
    },
    textarea: { resize: "vertical", height: "90px" },
    formButtons: {
      marginTop: "auto",
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
    },
    submitButton: {
      flex: 1,
      padding: "12px",
      backgroundColor: "#16a085",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    },
    cancelButton: {
      flex: 1,
      padding: "12px",
      backgroundColor: "#c0392b",
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    },
    pagination: {
      marginTop: "20px",
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    pageButton: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #16a085",
      backgroundColor: "#fff",
      cursor: "pointer",
      color: "#16a085",
      fontWeight: "600",
    },
    pageButtonDisabled: { cursor: "not-allowed", opacity: 0.5 },
    description: {
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate(-1)} // Go back to previous page
        style={{
          padding: "8px 16px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #16a085",
          backgroundColor: "#fff",
          color: "#16a085",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <div style={styles.header}>
        <h2 style={styles.title}>Manage Departments</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setForm({ department_name: "", department_description: "" });
          }}
        >
          + Add Department
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search department..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          style={styles.searchInput}
        />
        <div>Total Rows: {pagination.total}</div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Sort By:{" "}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="department_name">Department Name</option>
            <option value="department_description">Description</option>
            <option value="status">Status</option>
            <option value="created_at">Created At</option>
          </select>
        </label>
        <label style={{ marginLeft: "15px" }}>
          Order:{" "}
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      {/* Slide-over Form */}
      <div style={styles.slideOverContainer}>
        <h3 style={styles.formTitle}>
          {isEditing ? "Edit Department" : "Add Department"}
        </h3>
        <input
          type="text"
          name="department_name"
          placeholder="Department Name"
          value={form.department_name}
          onChange={handleChange}
          style={styles.input}
          autoFocus
          required
        />
        <textarea
          name="department_description"
          placeholder="Department Description"
          value={form.department_description}
          onChange={handleChange}
          style={{ ...styles.input, ...styles.textarea }}
        />
        <div style={styles.formButtons}>
          <button
            type="submit"
            onClick={handleSubmit}
            style={styles.submitButton}
          >
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleBack}
            style={styles.cancelButton}
          >
            Back
          </button>
        </div>
      </div>

      {/* Departments Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Department Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No departments found.
              </td>
            </tr>
          ) : (
            departments.map((d) => (
              <tr key={d.department_id}>
                <td style={styles.td}>{d.department_id}</td>
                <td style={styles.td}>{d.department_name}</td>
                <td style={styles.td}>
                  <div
                    style={
                      expandedRows[d.department_id] ? {} : styles.description
                    }
                  >
                    {d.department_description || "-"}
                  </div>
                  {d.department_description?.length > 100 && (
                    <span
                      style={{
                        color: "#2980b9",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                      onClick={() => toggleDescription(d.department_id)}
                    >
                      {expandedRows[d.department_id]
                        ? " View less"
                        : " View more..."}
                    </span>
                  )}
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusButton,
                      ...(d.status === "ACTIVE"
                        ? styles.activeStatus
                        : styles.inactiveStatus),
                    }}
                  >
                    {d.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleStatus(d.department_id, d.status)}
                    style={{
                      ...styles.statusButton,
                      marginRight: "8px",
                      ...(d.status === "ACTIVE"
                        ? styles.inactiveStatus
                        : styles.activeStatus),
                    }}
                  >
                    {d.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEditClick(d)}
                    style={{
                      ...styles.addButton,
                      backgroundColor: "#2980b9",
                      padding: "6px 12px",
                      fontSize: "14px",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          style={{
            ...styles.pageButton,
            ...(pagination.page === 1 ? styles.pageButtonDisabled : {}),
          }}
        >
          Prev
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              style={{
                ...styles.pageButton,
                backgroundColor: pagination.page === p ? "#16a085" : "#fff",
                color: pagination.page === p ? "#fff" : "#16a085",
              }}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          style={{
            ...styles.pageButton,
            ...(pagination.page === pagination.totalPages
              ? styles.pageButtonDisabled
              : {}),
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminDepartments;
