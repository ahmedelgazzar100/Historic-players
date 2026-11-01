import { Route, Routes } from "react-router";

function App() {
  return (
    <>
      <main className="container">
        <Routes>
          <Route path="/" element={<home />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
