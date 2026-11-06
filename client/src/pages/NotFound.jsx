import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px", color: "#333" }}>
      <h1>404</h1>
      <h2> Page Not Found ⚽🥅</h2>
      <button
        onClick={() => navigate("/home")}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          background: "#7b9acc",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Home
      </button>
    </div>
  );
}
