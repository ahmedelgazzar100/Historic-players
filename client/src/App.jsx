import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PlayerDetails from "./pages/PlayerDetails";
import Login from "./pages/Login";
import UserFav from "./pages/UserFav";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<h1>HOME TEST WORKS</h1>} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
        <Route path="/userfav" element={<UserFav />} />
        <Route path="/not-found" element={<NotFound />} />
        {/* Any route that doesn't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
