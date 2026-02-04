import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@components/layout";
import {
  DoorsControlPage,
  ValvesControlPage,
  ExhaustFansControlPage,
  LightsControlPage,
  AirConditionersControlPage,
  ElectricityPage,
  AirQualityPage,
} from "./pages";
import ApproveBookingPage from "./pages/ApproveBookingPage/ApproveBooking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Dashboard Home</div>} />
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

          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
