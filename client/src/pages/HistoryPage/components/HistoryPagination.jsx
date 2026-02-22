import { Pagination } from "antd";

function HistoryPagination({ setCurrentPage, setLimit, total }) {


  return (
    <Pagination
      total={total}
      showTotal={(total) => `Total ${total} items`}
      defaultPageSize={10}
      defaultCurrent={1}
      styles={{
        item: {
          color: "green",
          borderRadius: "2px"
        },
      }}
      onChange={(value, page) => {
        setLimit(page)
        setCurrentPage(value)
      }
      }
    />
  );
}

export default HistoryPagination;

