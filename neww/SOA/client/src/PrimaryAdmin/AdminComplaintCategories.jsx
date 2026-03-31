import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminComplaintCategory() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    category_code: "",
    category_name: "",
    category_description: "",
    department_id: "",
    service_type_id: "",
    skill_id: "",
    priority_id: "",
    expected_resolution_days: 7,
    is_public: true,
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
  const [sortBy, setSortBy] = useState("category_name");
  const [order, setOrder] = useState("asc");
  const [expandedRows, setExpandedRows] = useState({});

  const [departments, setDepartments] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---------- Fetch categories ----------
  useEffect(() => {
    if (!token) {
      navigate("/adminlogin");
      return;
    }
    fetchCategories();
    fetchDropdowns();
  }, [navigate, token, pagination.page, sortBy, order, search]);

  // ---------- Fetch categories ----------
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/complaint-categories",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pagination.page,
            limit: pagination.limit,
            sortBy,
            order,
            search,
          },
        },
      );
      const apiData = res.data;
      setCategories(apiData?.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: apiData?.pagination?.totalPages || 1,
        total: apiData?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch complaint categories", error);
    }
  };

  // ---------- Fetch dropdown options ----------
  const fetchDropdowns = async () => {
    try {
      const [deptRes, svcRes, skillRes, prioRes] = await Promise.all([
        axios.get("http://localhost:5000/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10000 },
        }),

        axios.get("http://localhost:5000/api/service-types", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10000 },
        }),

        axios.get("http://localhost:5000/api/skills", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10000 },
        }),

        axios.get("http://localhost:5000/api/priorities", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10000 },
        }),
      ]);

      setDepartments(deptRes.data.data || []);
      setServiceTypes(svcRes.data.data || []);
      setSkills(skillRes.data.data || []);
      setPriorities(prioRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  // ---------- Form handling ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/complaint-categories/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        await fetchCategories(); // 👈 THIS is the key
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/complaint-categories",
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const newCategory = {
          category_id: res.data.id || Date.now(),
          ...form,
          status: "ACTIVE",
        };

        setCategories((prev) => [newCategory, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      }

      setForm({
        category_code: "",
        category_name: "",
        category_description: "",
        department_id: "",
        service_type_id: "",
        skill_id: "",
        priority_id: "",
        expected_resolution_days: 7,
        is_public: true,
      });
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      console.error("Failed to submit category", error);
    }
  };

  // ---------- Status toggle ----------
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(
        `http://localhost:5000/api/complaint-categories/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === id ? { ...c, status: newStatus } : c,
        ),
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleEditClick = (category) => {
    setForm({
      category_code: category.category_code,
      category_name: category.category_name,
      category_description: category.category_description,
      department_id: category.department_id,
      service_type_id: category.service_type_id,
      skill_id: category.skill_id,
      priority_id: category.priority_id,
      expected_resolution_days: category.expected_resolution_days,
      is_public: category.is_public,
    });
    setIsEditing(true);
    setEditId(category.category_id);
    setShowForm(true);
  };

  const handleBack = () => {
    setForm({
      category_code: "",
      category_name: "",
      category_description: "",
      department_id: "",
      service_type_id: "",
      skill_id: "",
      priority_id: "",
      expected_resolution_days: 7,
      is_public: true,
    });
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
      minHeight: "0vh",
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
      width: "400px",
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
    label: { display: "block", fontWeight: "600", marginBottom: "5px" },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate(-1)}
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
        <h2 style={styles.title}>Manage Complaint Categories</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
          }}
        >
          + Add Category
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
          placeholder="Search category..."
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
            <option value="category_name">Name</option>
            <option value="category_code">Code</option>
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
      <div
        style={{
          position: "fixed",
          top: 0,
          right: showForm ? 0 : "-400px",
          width: "400px",
          height: "100vh",
          backgroundColor: "#fff",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
          padding: "30px 25px",
          boxSizing: "border-box",
          transition: "right 0.4s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={styles.formTitle}>
          {isEditing ? "Edit Category" : "Add Category"}
        </h3>

        {/* Make form scrollable */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* Category Code */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Category Code
            </label>
            <input
              type="text"
              name="category_code"
              value={form.category_code}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Category Name */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Category Name
            </label>
            <input
              type="text"
              name="category_name"
              value={form.category_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Description
            </label>
            <textarea
              name="category_description"
              value={form.category_description}
              onChange={handleChange}
              style={{ ...styles.input, ...styles.textarea }}
            />
          </div>

          {/* Department Dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Department
            </label>
            <select
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type Dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Service Type
            </label>
            <select
              name="service_type_id"
              value={form.service_type_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Service Type</option>
              {serviceTypes.map((s) => (
                <option key={s.service_type_id} value={s.service_type_id}>
                  {s.service_type_name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Skill
            </label>
            <select
              name="skill_id"
              value={form.skill_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Skill</option>
              {skills.map((sk) => (
                <option key={sk.skill_id} value={sk.skill_id}>
                  {sk.skill_name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Priority
            </label>
            <select
              name="priority_id"
              value={form.priority_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Priority</option>
              {priorities.map((p) => (
                <option key={p.priority_id} value={p.priority_id}>
                  {p.priority_name}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Resolution Days */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              Expected Resolution Days
            </label>
            <input
              type="number"
              name="expected_resolution_days"
              value={form.expected_resolution_days}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Public Checkbox */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontWeight: "600",
              }}
            >
              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={handleChange}
                style={{ marginRight: "8px" }}
              />
              Public
            </label>
          </div>
        </div>

        {/* Buttons fixed at bottom */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button onClick={handleSubmit} style={styles.submitButton}>
            {isEditing ? "Update" : "Save"}
          </button>
          <button onClick={handleBack} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Service Type</th>
            <th style={styles.th}>Skill</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Resolution Days</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.category_id}>
                <td style={styles.td}>{c.category_id}</td>
                <td style={styles.td}>{c.category_code}</td>
                <td style={styles.td}>{c.category_name}</td>
                <td style={styles.td}>{c.department_name || "-"}</td>
                <td style={styles.td}>{c.service_type_name || "-"}</td>
                <td style={styles.td}>{c.skill_name || "-"}</td>
                <td style={styles.td}>{c.priority_name || "-"}</td>
                <td style={styles.td}>{c.expected_resolution_days}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusButton,
                      ...(c.status === "ACTIVE"
                        ? styles.activeStatus
                        : styles.inactiveStatus),
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleStatus(c.category_id, c.status)}
                    style={{
                      ...styles.statusButton,
                      backgroundColor: "#2980b9",
                      marginRight: "5px",
                    }}
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => handleEditClick(c)}
                    style={{
                      ...styles.statusButton,
                      backgroundColor: "#f39c12",
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
          style={{
            ...styles.pageButton,
            ...(pagination.page === 1 ? styles.pageButtonDisabled : {}),
          }}
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Prev
        </button>
        {[...Array(pagination.totalPages)].map((_, i) => (
          <button
            key={i + 1}
            style={{
              ...styles.pageButton,
              ...(pagination.page === i + 1
                ? { backgroundColor: "#16a085", color: "#fff" }
                : {}),
            }}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          style={{
            ...styles.pageButton,
            ...(pagination.page === pagination.totalPages
              ? styles.pageButtonDisabled
              : {}),
          }}
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminComplaintCategory;
