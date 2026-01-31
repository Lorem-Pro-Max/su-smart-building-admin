import { useGraphServices } from "@hooks/graph/useGraphServices";
import { electricityService } from "@services/deviceService";

export function useElectricity() {
  const graphService = useGraphServices(electricityService);

  return {
    graphService: graphService,
  };
}
