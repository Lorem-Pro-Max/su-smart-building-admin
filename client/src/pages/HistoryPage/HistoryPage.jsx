import { HistoryPageTitleIcon } from "@assets/icons";
import HistoryTable from "./components/HistoryTable";
import HistoryPagination from "./components/HistoryPagination";
import { useState, useEffect } from "react";
import { getIotLogs } from "../../services/history";

function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10)

  const [currentPage, setCurrentPage] = useState(1);


  const fetchHistory = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      const response = await getIotLogs({ limit, offset });

      if (response.success) {
        setLogs(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);


  return (
    <div className=" bg-white w-full h-full px-7 py-6 flex justify-center">
      <div className="w-full h-full flex flex-col gap-4">
        <div className="w-full h-max flex gap-2 items-center">
          <HistoryPageTitleIcon />
          <h3 className="text-2xl font-medium leading-8">ประวัติ</h3>
        </div>
        <div className="h-full w-full flex flex-col justify-between">
          <HistoryTable data={logs} />
          <div className="w-full h-max flex justify-end">
            <HistoryPagination setCurrentPage={setCurrentPage} setLimit={setLimit} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
