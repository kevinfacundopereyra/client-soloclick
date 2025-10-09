import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfilePage from "./components/ProfilePage";
import ProfessionalsHome from "./professionals/pages/ProfessionalsHome";
import ProfessionalsFeatured from "./professionals/pages/ProfessionalsFeatured";
import ProfessionalDetail from "./professionals/pages/ProfessionalDetail";
import ServicesSelection from "./professionals/pages/ServicesSelection";
import ScheduleTime from "./professionals/pages/ScheduleTime";
import BookingConfirmation from "./professionals/pages/BookingConfirmation";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignInPage from "./components/SignInPage";
import UserRegisterPage from "./components/UserRegisterPage";
import ProfessionalRegisterPage from "./components/ProfessionalRegisterPage";
import ProfilePage from "./components/ProfilePage";
import CompleteProfilePage from "./components/CompleteProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register/user" element={<UserRegisterPage />} />
        <Route
          path="/register/professional"
          element={<ProfessionalRegisterPage />}
        />
        <Route path="/professionals" element={<ProfessionalsHome />} />
        <Route path="/featured" element={<ProfessionalsFeatured />} />
        <Route path="/featured/:id" element={<ProfessionalsFeatured />} />
        <Route path="/profesional/:id" element={<ProfessionalDetail />} />
        <Route path="/reservar/servicios/:id" element={<ServicesSelection />} />
        <Route path="/reservar/horario/:id" element={<ScheduleTime />} />
        <Route path="/reservar/confirmar/:id" element={<BookingConfirmation />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/complete" element={<CompleteProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
