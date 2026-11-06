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
        <Route path="/home" element={<Home />} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
        <Route path="/userfav" element={<UserFav />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} /> //any route that doesnt exist
      </Routes>
    </>
  );
}

export default App;
