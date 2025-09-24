import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfessionalsHome from "./professionals/pages/ProfessionalsHome";
import ProfessionalsFeatured from "./professionals/pages/ProfessionalsFeatured";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfessionalsHome />} />
        <Route path="/featured" element={<ProfessionalsFeatured />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
