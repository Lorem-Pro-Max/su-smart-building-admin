import { useState } from "react";

export function useTemperatureControl() {
  const [activePopoverId, setActivePopoverId] = useState(null);
  
  const handlePopoverChange = (roomId, isOpen) => {
    setActivePopoverId(isOpen ? roomId : null);
  };

  return {
    activePopoverId,
    handlePopoverChange,
  };
}
