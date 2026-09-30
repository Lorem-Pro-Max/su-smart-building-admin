import { HistoryPageTitleIcon } from "@assets/icons";
import HistoryTable from "./components/HistoryTable";
import HistoryPagination from "./components/HistoryPagination";
import { useState, useEffect } from "react";
import { getIotLogs } from "../../services/history";
import { LoadingScreen } from "../../components/utils/LoadingScreen";

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
  }, [currentPage, limit]);

  return (<>
    {loading && <LoadingScreen />}
    <div className="bg-white w-full h-full min-w-0 min-h-0 px-7 py-6 flex justify-center overflow-hidden">
      <div className="w-full h-full min-w-0 min-h-0 flex flex-col gap-4 overflow-hidden">
        <div className="w-full h-max flex gap-2 items-center shrink-0">
          <HistoryPageTitleIcon />
          <h3 className="text-2xl font-medium leading-8">ประวัติ</h3>
        </div>
        <div className="flex-1 min-h-0 w-full flex flex-col justify-between gap-4 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto">
            <HistoryTable data={logs} />
          </div>
          <div className="w-full h-max flex justify-end shrink-0">
            <HistoryPagination setCurrentPage={setCurrentPage} setLimit={setLimit} total={total} />
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default HistoryPage;
