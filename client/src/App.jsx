import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Layout } from "@components/layout";
import { socket } from "./services/socket";
import { useEffect, useState } from "react";
import {
  DoorsControlPage,
  ValvesControlPage,
  ExhaustFansControlPage,
  LightsControlPage,
  AirConditionersControlPage,
  ElectricityPage,
  AirQualityPage,
  HistoryPage,
  ClassroomNamePage,
  RoomsOverviewPage,
  RoomDetailPage,
  LoginPage
} from "./pages";
import ApproveBookingPage from "./pages/ApproveBookingPage/ApproveBooking";
import UserPermissionPage from "./pages/UserPermissionPage/UserPermissionPage";
import ControlSchedulePage from "./pages/ControlSchedule/ControlSchedulePage";
import { SmokeAlertModal, useIdleWarning } from "./components/utils";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute"

function App() {
  const [smokeData, setSmokeData] = useState(null);
  const { idleToast, contextHolder: idleContext } = useIdleWarning();

  useEffect(() => {
    socket.on("smoke_alert", (data) => {
      setSmokeData(data);
    });

    socket.on("idle_warning", (data) => {
      idleToast(data);
    });

    return () => {
      socket.off("smoke_alert");
      socket.off("idle_warning");
    };
  }, [idleToast]);

  const handleClose = () => setSmokeData(null);

  const antdTheme = {
    token: {
      fontFamily: '"Kanit", sans-serif',
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter basename="/admin-dashboard">
        {idleContext}
        <SmokeAlertModal
          visible={!!smokeData}
          data={smokeData}
          onClose={handleClose}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/device-scheduling" element={<ControlSchedulePage />} />
              <Route path="/rooms-overview" element={<RoomsOverviewPage />} />
              <Route
                path="/rooms-overview/:floorParam/:roomParam"
                element={<RoomDetailPage />}
              />
              {/* รองรับลิงก์เดิมที่ใช้ room id */}
              <Route
                path="/rooms-overview/:roomParam"
                element={<RoomDetailPage />}
              />
              <Route path="/classroom-names" element={<ClassroomNamePage />} />
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
              <Route path="/user-permissions" element={<UserPermissionPage />} />
              <Route
                path="*"
                element={<Navigate to="/approve-booking" replace />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
