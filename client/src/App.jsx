import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@components/layout";
import {
  DoorControlPage,
  ValveControlPage,
  ExhaustFanControlPage,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Dashboard Home</div>} />
          <Route path="/doors" element={<DoorControlPage />} />
          <Route path="/valves" element={<ValveControlPage />} />
          <Route path="/exhaust-fans" element={<ExhaustFanControlPage />} />
          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
