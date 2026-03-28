import { useCallback, useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import PageHeader from "@components/layout/ContentLayout/PageHeader";
import { LoadingScreen } from "@components/utils/LoadingScreen";
import TabsMenu from "@components/layout/ContentLayout/TabsMenu";
import { HistoryPageTitleIcon } from "@assets/icons";
import {
  getClassroomRoomsByFloor,
  patchRoomTitle,
} from "@services/classroomRooms";
import EditRoomTitleModal from "./components/EditRoomTitleModal";
import FloorRoomColumns from "./components/FloorRoomColumns";

function applyRoomTitleUpdate(rows, updated) {
  return rows.map((section) => ({
    ...section,
    left: section.left.map((r) =>
      r.id === updated.id ? { ...r, title: updated.title } : r,
    ),
    right: section.right.map((r) =>
      r.id === updated.id ? { ...r, title: updated.title } : r,
    ),
  }));
}

function ClassroomNamePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const openEditModal = (room) => {
    setEditingRoomId(room.id);
    setEditTitle(room.title?.trim() ?? "");
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingRoomId(null);
    setEditTitle("");
  };

  const handleSaveClick = useCallback(async () => {
    if (editingRoomId == null) return;
    try {
      setSaveLoading(true);
      const json = await patchRoomTitle(editingRoomId, { title: editTitle });
      if (json?.data) {
        setRows((prev) => applyRoomTitleUpdate(prev, json.data));
      }
      notification.success({ message: "บันทึกข้อมูลสำเร็จ" });
      closeEditModal();
    } catch (e) {
      notification.error({
        message:
          e?.response?.data?.message || e?.message || "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaveLoading(false);
    }
  }, [editingRoomId, editTitle]);

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
    <>
      {loading && <LoadingScreen />}
      <PageHeader pageIcon={<HistoryPageTitleIcon />} pageTitle="ชื่อห้อง">
        {error ? (
          <div className="rounded-content-layout-tab shadow-content-layout-card bg-white p-6">
            <p className="text-base text-red-600 leading-relaxed">{error}</p>
          </div>
        ) : loading ? null : (
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
          saveLoading={saveLoading}
        />
      </PageHeader>
    </>
  );
}

export default ClassroomNamePage;
