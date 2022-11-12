import Elections from "./components/Elections";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/elections" element={<Elections />}></Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
