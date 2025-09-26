import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfessionalsHome from "./professionals/pages/ProfessionalsHome";
import ProfessionalsFeatured from "./professionals/pages/ProfessionalsFeatured";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import UserRegisterPage from "./components/UserRegisterPage";
import ProfessionalRegisterPage from "./components/ProfessionalRegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/user" element={<UserRegisterPage />} />
        <Route path="/register/professional" element={<ProfessionalRegisterPage />} />
        <Route path="/professionals" element={<ProfessionalsHome />} />
        <Route path="/featured" element={<ProfessionalsFeatured />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
