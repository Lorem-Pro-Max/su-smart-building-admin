import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@components/layout";
import {
  DoorsControlPage,
  ValvesControlPage,
  ExhaustFansControlPage,
  LightsControlPage,
  AirConditionersControlPage,
  ElectricityPage,
  AirQualityPage,
  HistoryPage,
} from "./pages";
import ApproveBookingPage from "./pages/ApproveBookingPage/ApproveBooking";
import UserPermissionPage from "./pages/UserPermissionPage/UserPermissionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/device-scheduling" element={<></>} />
          <Route path="/doors" element={<DoorsControlPage />} />
          <Route path="/lights" element={<LightsControlPage />} />
          <Route path="/exhaust-fans" element={<ExhaustFansControlPage />} />
          <Route path="/valves" element={<ValvesControlPage />} />
          <Route
            path="/air-conditioners"
            element={<AirConditionersControlPage />}
          />
          <Route path="/air-quality" element={<AirQualityPage />} />
          <Route path="/electricity" element={<ElectricityPage />} />
          <Route path="/approve-booking" element={<ApproveBookingPage />} />
          <Route path="/user-permissions" element={<></>} />
          <Route
            path="*"
            element={<Navigate to="/approve-booking" replace />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
