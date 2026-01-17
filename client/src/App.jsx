import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@components/layout";
import {
  DoorsControlPage,
  ValvesControlPage,
  ExhaustFansControlPage,
  LightsControlPage,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Dashboard Home</div>} />
          <Route path="/doors" element={<DoorsControlPage />} />
          <Route path="/valves" element={<ValvesControlPage />} />
          <Route path="/exhaust-fans" element={<ExhaustFansControlPage />} />
          <Route path="/lights" element={<LightsControlPage />} />
          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
