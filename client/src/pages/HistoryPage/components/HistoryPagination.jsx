import { Pagination } from "antd";

function HistoryPagination() {

  return (
    <Pagination
      total={85}
      showTotal={(total) => `Total ${total} items`}
      defaultPageSize={20}
      defaultCurrent={1}
      styles={{
        item: {
          color: "green",
          borderRadius: "2px"
        },
      }}
      onChange={(value, page) => console.log(value, page)}
    />
  );
}

export default HistoryPagination;

