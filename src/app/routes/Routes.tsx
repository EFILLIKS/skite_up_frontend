import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../../pages/auth/Login";
import Dashboard from "../../pages/dashboard/DashBoard";
import MainLayout from "../../layout/MainLayout";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;