import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { BASE_URL } from "../config/devices";

const socket = io(BASE_URL);

export function useDataFetch(apiEndpoint, socketEvent) {
  const [data, setData] = useState({});

  const processData = (rawItems) => {
    const grouped = {};
    Object.values(rawItems).forEach((item) => {
      const idNumber = parseInt(item.id, 10);
      const floorNum = Math.ceil(idNumber / 3);

      if (!grouped[floorNum]) grouped[floorNum] = {};
      grouped[floorNum][item.id] = item;
    });
    setData(grouped);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(apiEndpoint);
      if (response.data && response.data.data) {
        processData(response.data.data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${apiEndpoint}`, error);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on(socketEvent, (updatedData) => {
      processData(updatedData);
    });

    return () => {
      socket.off(socketEvent);
    };
  }, [apiEndpoint, socketEvent]);

  return { data, refresh: fetchData };
}
