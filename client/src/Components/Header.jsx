import { useState } from "react";
import { FaHeart } from "react-icons/fa";
export default function Header(props) {
  const [name, setName] = useState("");

  function handleChange(event) {
    const value = event.target.value;
    setName(value);
    props.onName(value);
  }

  return (
    <header className="header">
      <div className="container">
        <h1>Historic Players</h1>

        <div
          className="search-box"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <div
            onClick={props.onFavClick}
            title="لعيبتك المفضلة (Favorites)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 71, 87, 0.1)",
              transition: "0.3s",
            }}
          >
            <FaHeart
              style={{
                color: "#ff4757", // لون أحمر صريح يدل على المفضلة والقلوب
                fontSize: "20px",
              }}
            />
          </div>

          <input
            onChange={handleChange}
            value={name}
            type="text"
            placeholder="Search for a player..."
          />
        </div>
      </div>
    </header>
  );
}
