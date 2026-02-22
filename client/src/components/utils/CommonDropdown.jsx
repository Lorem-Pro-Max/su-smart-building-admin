import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, ConfigProvider } from "antd";
import { CommonDropdownTheme } from "@styles/themes/commonDropdownTheme";

export function CommonDropdown({ items = [], currentItem, onSelect }) {
  const activeItem = items.find((item) => item.key === currentItem);
  const displayLabel =
    activeItem?.label || (items.length > 0 ? items[0].label : "กำลังโหลด...");

  return (
    <ConfigProvider theme={CommonDropdownTheme}>
      <Dropdown
        menu={{
          items,
          selectable: true,
          selectedKeys: [String(currentItem)],
          onClick: ({ key }) => onSelect?.(key),
          style: {
            maxHeight: "300px",
            overflowY: "auto",
            borderRadius: "8px",
          },
        }}
        trigger={["click"]}
      >
        <div className="w-max min-w-40 cursor-pointer border border-gray-300 rounded-lg px-4 py-2 bg-white flex items-center transition-colors">
          <Space className="flex justify-between w-full">
            <span className="text-gray-700 font-medium text-sm">
              {displayLabel}
            </span>
            <DownOutlined className="text-xs text-gray-400" />
          </Space>
        </div>
      </Dropdown>
    </ConfigProvider>
  );
}
