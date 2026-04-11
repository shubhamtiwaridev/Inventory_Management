import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgetPassword from "./pages/auth/ForgetPassword.jsx";

import GoodsList from "./pages/goods/GoodsList.jsx";
// import GoodsUnit from "./pages/goods/GoodsUnit.jsx";
// import GoodsClass from "./pages/goods/GoodsClass.jsx";
// import GoodsColor from "./pages/goods/GoodsColor.jsx";
// import GoodsBrand from "./pages/goods/GoodsBrand.jsx";
// import GoodsShape from "./pages/goods/GoodsShape.jsx";
// import GoodsSpecs from "./pages/goods/GoodsSpecs.jsx";
// import GoodsOrigin from "./pages/goods/GoodsOrigin.jsx";

import StaffPage from "./pages/staffs/StaffPage.jsx";
import StaffList from "./pages/staffs/StaffList.jsx";
import StaffType from "./pages/staffs/StaffType.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Dashboard />} />
        <Route path="/orders" element={<Dashboard />} />
        <Route path="/suppliers" element={<Dashboard />} />
        <Route path="/warehouses" element={<Dashboard />} />
        <Route path="/categories" element={<Dashboard />} />
        <Route path="/reports" element={<Dashboard />} />

        <Route path="/goodslist" element={<GoodsList />} />
        {/* <Route path="/goodsunit" element={<GoodsUnit />} />
        <Route path="/goodsclass" element={<GoodsClass />} />
        <Route path="/goodscolor" element={<GoodsColor />} />
        <Route path="/goodsbrand" element={<GoodsBrand />} />
        <Route path="/goodsshape" element={<GoodsShape />} />
        <Route path="/goodsspecs" element={<GoodsSpecs />} />
        <Route path="/goodsorigin" element={<GoodsOrigin />} /> */}

        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff-list" element={<StaffList />} />
        <Route path="/staff-type" element={<StaffType />} />
      </Route>
    </Routes>
  );
}

export default App;
