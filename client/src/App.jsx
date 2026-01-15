import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@components/layout";
import { DoorControlPage, ValveControlPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" elementÍ={<div>Dashboard Home</div>} />
          <Route path="/doors" element={<DoorControlPage />} />
          <Route path="/valves" element={<ValveControlPage />} />
          <Route path="*" element={<></>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
