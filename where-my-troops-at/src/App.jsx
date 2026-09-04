import { Routes, Route } from "react-router-dom";
import MPC from "./planning/MPC";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MPC />} />
      <Route path="/MPC" element={<MPC />} />
    </Routes>
  );
}

export default App;
