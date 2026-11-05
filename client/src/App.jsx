import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PlayerDetails from "./pages/PlayerDetails";
import Login from "./pages/Login";
import UserFav from "./pages/UserFav";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
        <Route path="/userfav" element={<UserFav />} />
      </Routes>
    </>
  );
}

export default App;
