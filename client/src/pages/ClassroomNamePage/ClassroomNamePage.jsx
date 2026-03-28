import { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";
import PageHeader from "@components/layout/ContentLayout/PageHeader";
import TabsMenu from "@components/layout/ContentLayout/TabsMenu";
import { HistoryPageTitleIcon } from "@assets/icons";
import { getClassroomRoomsByFloor } from "@services/classroomRooms";
import EditRoomTitleModal from "./components/EditRoomTitleModal";
import FloorRoomColumns from "./components/FloorRoomColumns";

function ClassroomNamePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const openEditModal = (room) => {
    setEditTitle(room.title?.trim() ?? "");
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditTitle("");
  };

  const handleSaveClick = () => {
    closeEditModal();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const json = await getClassroomRoomsByFloor();
        if (cancelled) return;
        setRows(Array.isArray(json.data) ? json.data : []);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message || e?.message || "โหลดข้อมูลไม่สำเร็จ",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const floorMap = useMemo(() => {
    const map = {};
    for (const row of rows) {
      map[row.floor] = row;
    }
    return map;
  }, [rows]);

  return (
    <PageHeader pageIcon={<HistoryPageTitleIcon />} pageTitle="ชื่อห้อง">
      {loading ? (
        <div className="flex justify-center items-center min-h-[240px] w-full">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="rounded-content-layout-tab shadow-content-layout-card bg-white p-6">
          <p className="text-base text-red-600 leading-relaxed">{error}</p>
        </div>
      ) : (
        <TabsMenu>
          {(floorNum) => (
            <FloorRoomColumns
              section={floorMap[floorNum]}
              onEditRoom={openEditModal}
            />
          )}
        </TabsMenu>
      )}

      <EditRoomTitleModal
        open={editOpen}
        title={editTitle}
        onTitleChange={setEditTitle}
        onCancel={closeEditModal}
        onSave={handleSaveClick}
      />
    </PageHeader>
  );
}

export default ClassroomNamePage;
