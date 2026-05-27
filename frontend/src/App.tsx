import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./Pages/AuthPage";
import Dashboard from "./Pages/Dashboard";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
