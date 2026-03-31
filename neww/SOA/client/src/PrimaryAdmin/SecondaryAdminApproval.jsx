import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SecondaryAdminApproval.css";

export default function SecondaryAdminApproval() {
  const [apps, setApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // ===============================
  // FETCH APPLICATIONS
  // ===============================
  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/secondary-admin/applications",
      );
      setApps(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // ===============================
  // FILTER
  // ===============================
  useEffect(() => {
    let data = apps.filter((a) => a.application_status === tab);

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(s) ||
          a.email?.toLowerCase().includes(s),
      );
    }

    setFiltered(data);
  }, [apps, tab, search]);

  // ===============================
  // ACTIONS
  // ===============================
  const approve = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/secondary-admin/approve/${id}`,
      );
      fetchApps();
    } catch (err) {
      alert("Approval failed");
      console.error(err);
    }
  };

  const reject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/secondary-admin/reject/${id}`,
      );
      fetchApps();
    } catch (err) {
      alert("Reject failed");
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/secondary-admin/remove/${id}`,
      );
      fetchApps();
    } catch (err) {
      alert("Remove failed");
      console.error(err);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="approval-container">
      <h1>Secondary Admin Approval</h1>

      {/* Tabs */}
      <div className="tabs">
        {["PENDING", "WAITING LIST", "APPROVED", "REJECTED"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        className="search"
        placeholder="Search name/email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading */}
      {loading && <div className="spinner">Loading...</div>}

      {/* List */}
      {!loading && (
        <div className="card-grid">
          {filtered.map((app) => (
            <div key={app.application_id} className="card">
              <h3>
                {app.full_name}- {app.country_name} - {app.state_name}
              </h3>

              <p>
                <b>Email:</b> {app.email}
              </p>
              <p>
                <b>Mobile:</b> {app.mobile_number}
              </p>
              <p>
                <b>Status:</b> {app.application_status}
              </p>

              {/* Files */}
              <div className="files">
                {app.profile_photo && (
                  <img
                    src={`http://localhost:5000/uploads/staff/${app.profile_photo}`}
                    alt="profile"
                    className="avatar"
                    onClick={() => setSelected(app)}
                  />
                )}

                {app.resume_pdf && (
                  <a
                    href={`http://localhost:5000/uploads/staff/${app.resume_pdf}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Resume
                  </a>
                )}

                {app.degree_certificate && (
                  <a
                    href={`http://localhost:5000/uploads/staff/${app.degree_certificate}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Degree
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="actions">
                {app.application_status === "PENDING" && (
                  <>
                    <button
                      className="approve"
                      onClick={() => approve(app.application_id)}
                    >
                      Approve
                    </button>

                    <button
                      className="reject"
                      onClick={() => reject(app.application_id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {app.application_status === "APPROVED" && (
                  <button
                    className="remove"
                    onClick={() => remove(app.application_id)}
                  >
                    Remove Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.full_name}</h2>

            {selected.profile_photo && (
              <img
                src={`http://localhost:5000/uploads/staff/${selected.profile_photo}`}
                alt="profile"
                className="modal-avatar"
              />
            )}

            <p>
              <b>Email:</b> {selected.email}
            </p>
            <p>
              <b>Mobile:</b> {selected.mobile_number}
            </p>

            {selected.resume_pdf && (
              <iframe
                src={`http://localhost:5000/uploads/staff/${selected.resume_pdf}`}
                title="resume"
                className="pdf-viewer"
              />
            )}

            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
