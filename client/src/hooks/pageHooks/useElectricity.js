import { electricityService } from "@services/deviceService";
import { useElectricityGraphServices } from "../graph/useElectricityGraphServices";

export function useElectricity() {
  const graphService = useElectricityGraphServices(electricityService);

  return {
    graphService: graphService,
  };
}
