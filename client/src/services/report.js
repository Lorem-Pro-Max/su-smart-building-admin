import { apiClient } from "../lib/apiClient";

const REPORT_TIMEOUT_MS = 60000;

const saveFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadReport = async ({ type, from, to, fileName }) => {
  try {
    const res = await apiClient.get(`/reports/${type}`, {
      params: { from, to },
      responseType: "blob",
      timeout: REPORT_TIMEOUT_MS,
    });

    saveFile(res.data, fileName);
  } catch (error) {
    const data = error.response?.data;
    throw data && !(data instanceof Blob) ? data : error;
  }
};
