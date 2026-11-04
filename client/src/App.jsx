import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PlayerDetails from "./pages/PlayerDetails";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
      </Routes>
    </>
  );
}

export default App;
