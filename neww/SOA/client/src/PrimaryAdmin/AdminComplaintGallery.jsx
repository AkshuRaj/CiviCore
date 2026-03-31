import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminComplaintGallery() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [isCommon, setIsCommon] = useState(false);

  const [viewImage, setViewImage] = useState(null);

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10000 },
      })
      .then((res) => setDepartments(res.data.data || []));
  }, [token]);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    if (!departmentId) return;

    axios
      .get(`http://localhost:5000/api/gallery/categories/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10000 },
      })
      .then((res) => setCategories(res.data || []));
  }, [departmentId, token]);

  /* ================= FETCH IMAGES (AUTO REFRESH) ================= */
  const fetchImages = async () => {
    if (!departmentId) return;

    const url = isCommon
      ? `http://localhost:5000/api/gallery/common/${departmentId}`
      : categoryId
        ? `http://localhost:5000/api/gallery/category/${categoryId}`
        : null;

    if (!url) {
      setImages([]);
      return;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setImages(res.data || []);
  };

  useEffect(() => {
    fetchImages();
  }, [departmentId, categoryId, isCommon]);

  /* ================= FILE PREVIEW ================= */
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!departmentId || (!categoryId && !isCommon) || !file) {
      alert("Please select department and category or common image");
      return;
    }

    const formData = new FormData();
    formData.append("department_id", departmentId);
    formData.append("category_id", categoryId);
    formData.append("image", file);
    formData.append("image_description", description);
    formData.append("is_common", isCommon);

    await axios.post("http://localhost:5000/api/gallery/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      params: { page: 1, limit: 10000 },
    });

    // reset form
    setFile(null);
    setPreview(null);
    setDescription("");

    // ✅ AUTO REFRESH
    fetchImages();
  };

  /* ================= DELETE ================= */
  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    await axios.delete(`http://localhost:5000/api/gallery/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 1, limit: 10000 },
    });

    setImages((prev) => prev.filter((img) => img.image_id !== id));
  };

  /* ================= STYLES ================= */
  const styles = {
    container: {
      padding: 20,
      background: "#f9f9f9",
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
    },
    backBtn: {
      padding: "8px 16px",
      marginBottom: 15,
      borderRadius: 6,
      border: "1px solid #16a085",
      background: "#fff",
      color: "#16a085",
      fontWeight: 600,
      cursor: "pointer",
    },
    select: {
      padding: 10,
      borderRadius: 8,
      border: "1.5px solid #ccc",
      marginRight: 10,
    },
    uploadBox: {
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      marginTop: 15,
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    },
    gallery: {
      marginTop: 30,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: 20,
    },
    card: {
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
      transition: "transform .2s",
    },
    image: {
      width: "100%",
      height: 160,
      objectFit: "cover",
      cursor: "pointer",
    },
    title: {
      padding: "10px 12px",
      fontWeight: 600,
      fontSize: 14,
      color: "#2c3e50",
      textAlign: "center",
    },
    actions: {
      display: "flex",
      justifyContent: "space-around",
      paddingBottom: 10,
    },
    btn: {
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      color: "#fff",
      fontSize: 13,
    },
    modal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000,
    },
    modalImg: {
      maxWidth: "90%",
      maxHeight: "90%",
      borderRadius: 10,
    },
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>Complaint Gallery</h2>

      <select
        style={styles.select}
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
      >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d.department_id} value={d.department_id}>
            {d.department_name}
          </option>
        ))}
      </select>

      <select
        style={styles.select}
        value={categoryId}
        disabled={!departmentId || isCommon}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>
            {c.category_name}
          </option>
        ))}
      </select>

      <label style={{ marginLeft: 10 }}>
        <input
          type="checkbox"
          checked={isCommon}
          onChange={(e) => setIsCommon(e.target.checked)}
        />{" "}
        Common
      </label>

      {/* Upload Box */}
      <div style={styles.uploadBox}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: 150, marginTop: 10 }}
          />
        )}
        <br />
        <input
          type="text"
          placeholder="Image title / description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 8, width: 250, marginTop: 10 }}
        />
        <br />
        <button
          style={{ ...styles.btn, background: "#16a085", marginTop: 10 }}
          onClick={handleUpload}
        >
          Upload Image
        </button>
      </div>

      {/* Gallery */}

      <h3 style={{ textAlign: "-webkit-center", fontFamily: "revert-layer" }}>
        IMAGES
      </h3>
      <div style={styles.gallery}>
        {images.map((img) => (
          <div key={img.image_id} style={styles.card}>
            <img
              src={`http://localhost:5000/uploads/gallery/${img.image_path}`}
              style={styles.image}
              onClick={() => setViewImage(img)}
            />
            <div style={styles.title}>
              {img.image_description || "No Title"}
            </div>
            <div style={styles.actions}>
              <button
                style={{ ...styles.btn, background: "#2980b9" }}
                onClick={() => setViewImage(img)}
              >
                View
              </button>
              <button
                style={{ ...styles.btn, background: "#c0392b" }}
                onClick={() => deleteImage(img.image_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {viewImage && (
        <div style={styles.modal} onClick={() => setViewImage(null)}>
          <img
            src={`http://localhost:5000/uploads/gallery/${viewImage.image_path}`}
            style={styles.modalImg}
          />
        </div>
      )}
    </div>
  );
}

export default AdminComplaintGallery;
