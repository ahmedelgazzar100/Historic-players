import { useState } from "react";
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
        <div className="search-box">
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
