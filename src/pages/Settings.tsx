import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ padding: "20px" }}>Please log in to view settings.</div>;
  }

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Profile Settings</h2>
      
      {user && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>User Information</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#666", marginBottom: "5px" }}>
                  Email
                </label>
                <p style={{ margin: 0, fontSize: "16px" }}>{user.email}</p>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#666", marginBottom: "5px" }}>
                  Role
                </label>
                <p style={{ margin: 0, fontSize: "16px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      backgroundColor: user.role === "admin" ? "#007bff" : "#28a745",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "14px",
                    }}
                  >
                    {roleLabel}
                  </span>
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#666", marginBottom: "5px" }}>
                  User ID
                </label>
                <p style={{ margin: 0, fontSize: "12px", color: "#888", fontFamily: "monospace" }}>
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "16px", color: "#856404", backgroundColor: "#fff3cd", padding: "12px", borderRadius: "6px" }}>
        Profile details like phone, company, and industry are not available because the backend does not expose a profile endpoint.
      </div>
    </div>
  );
};

export default Settings;