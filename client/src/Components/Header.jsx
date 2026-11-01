export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1>Historic Players</h1>
        <div className="search-box">
          <input type="text" placeholder="Search for a player..." />
          <button>Search</button>
        </div>
      </div>
    </header>
  );
}
