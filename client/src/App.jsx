import { Route, Routes } from "react-router";
import Header from "./Components/Header";
import Home from "./pages/Home";
function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
