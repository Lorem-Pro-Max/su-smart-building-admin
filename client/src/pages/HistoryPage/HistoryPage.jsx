import { HistoryPageTitleIcon } from "@assets/icons";
import HistoryTable from "./components/HistoryTable";
import HistoryPagination from "./components/HistoryPagination";

function HistoryPage() {
  return (
    <div className=" bg-white w-full h-full px-7 py-6 flex justify-center">
      <div className="w-full h-full flex flex-col gap-4">
        <div className="w-full h-max flex gap-2 items-center">
          <HistoryPageTitleIcon />
          <h3 className="text-2xl font-medium leading-8">ประวัติ</h3>
        </div>
        <div className="h-full w-full flex flex-col justify-between">
          <HistoryTable />
          <div className="w-full h-max flex justify-end">
            <HistoryPagination />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
