import { useEffect, useState, useCallback, useMemo } from "react";
import AddUserComponent from "./components/AddUserComponent";
import DeleteConfirmModal from "./components/DeleteModal";

import { getUsers, deleteUser } from "../../services/user";

import { Table, Button, Flex, Spin, notification } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { LoadingScreen } from "../../components/utils/LoadingScreen";
import TitleIcon from "../../assets/icons/user-permission/TitleIcon.jsx";

function UserPermissionPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [isOpenCreateUser, setIsOpenCreateUser] = useState(false);

  const [deleteUserId, setDeleteUserId] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const mapUsers = (data = []) =>
    data.map((u) => ({
      key: u.id,
      userId: u.id,
      userName: u.userName ?? u.username ?? "",
      fullName: `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim(),
      phone: u.phone,
      position: u.roleId,
      role: u.role,
      email: u.email,
      status: Number(u.status),
      allowedRoomIds: u.allowedRoomIds ?? [],
    }));

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(mapUsers(res?.data));
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      setLoading(true);
      await deleteUser(deleteUserId, { status: 2 });
      notification.success({ message: "ลบข้อมูลผู้ใช้งานสำเร็จ" });
      setDeleteUserId(null);
      await fetchUsers();
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "ชื่อผู้ใช้งาน",
        dataIndex: "userName",
      },
      { title: "ชื่อ-นามสกุล", dataIndex: "fullName" },
      { title: "เบอร์โทรศัพท์", dataIndex: "phone" },
      {
        title: "ตำแหน่ง",
        dataIndex: "position",
        render: (role) => (role === 1 ? "Admin" : "User"),
      },
      { title: "อีเมลล์", dataIndex: "email" },
      {
        title: "",
        render: (_, record) => (
          <div className="flex items-center gap-4">
            <EditOutlined
              className="!text-[#FAAD14] text-[24px] cursor-pointer"
              onClick={() => {
                setEditUser(record);
                setIsOpenCreateUser(true);
              }}
            />

            <DeleteOutlined
              className="!text-[#FF4D4F] text-[24px] cursor-pointer"
              onClick={() => setDeleteUserId(record.key)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="px-6">
      {!isOpenCreateUser && (
        <>
          <Flex justify="space-between" align="center">
            <h3 className="text-lg font-semibold flex items-center gap-2 mt-4 mb-4">
              <TitleIcon />
              กำหนดสิทธิ์ผู้ใช้งาน
            </h3>

            <Button
              icon={<PlusOutlined />}
              variant="outlined"
              color="cyan"
              onClick={() => setIsOpenCreateUser(true)}
            >
              เพิ่มผู้ใช้งาน
            </Button>
          </Flex>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={users}
              pagination={{
                ...pagination,
                total: users.length,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) =>
                  setPagination({
                    current: page,
                    pageSize,
                  }),
              }}
            />
          </Spin>
        </>
      )}

      {isOpenCreateUser && (
        <AddUserComponent
          editData={editUser}
          onSuccess={() => {
            setIsOpenCreateUser(false);
            setEditUser(null);

            fetchUsers();
          }}
          onCancel={() => {
            setIsOpenCreateUser(false);
            setEditUser(null);
          }}
        />
      )}

      <DeleteConfirmModal
        open={!!deleteUserId}
        onCancel={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default UserPermissionPage;
