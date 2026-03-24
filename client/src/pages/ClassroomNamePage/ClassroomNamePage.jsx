import PageHeader from "@components/layout/ContentLayout/PageHeader";
import TabsMenu from "@components/layout/ContentLayout/TabsMenu";
import { HistoryPageTitleIcon } from "@assets/icons";

const FLOOR_PLACEHOLDER_TEXT = {
  1: "ชั้น 1 — โซนใกล้บันไดเลื่อน (ข้อความจำลอง) ตัวอย่าง: ห้อง A101, A102 จะแสดงที่นี่เมื่อต่อข้อมูลจริง",
  2: "ชั้น 2 — แผนกวิทยาศาสตร์แบบ mock ถ้าสลับแท็บมาชั้นนี้ ข้อความต้องไม่เหมือนชั้นอื่น",
  3: "ชั้น 3 — ห้องปฏิบัติการคอมพิวเตอร์ / สตูดิโอ — ลอเร็ม แต่เป็นภาษาไทย: ทดสอบว่าแท็บทำงาน",
  4: "ชั้น 4 — ห้องสมุดย่อยและมุมอ่านหนังสือ — placeholder ยาวหน่อยเพื่อให้เห็นความต่างชัดเจนเมื่อเปลี่ยนแท็บ",
  5: "ชั้น 5 — โซนบนสุดของอาคาร (จำลอง) ชั้นสุดท้ายแล้วนะ ข้อความนี้เฉพาะชั้น 5 เท่านั้น",
};

function ClassroomNamePage() {
  return (
    <PageHeader pageIcon={<HistoryPageTitleIcon />} pageTitle="ชื่อห้อง">
      <TabsMenu>
        {(floorNum) => (
          <div className="flex flex-col gap-6 w-full h-max pb-6">
            <div className="rounded-content-layout-tab shadow-content-layout-card bg-white p-6">
              <p className="text-base text-black/88 leading-relaxed">
                {FLOOR_PLACEHOLDER_TEXT[floorNum]}
              </p>
            </div>
          </div>
        )}
      </TabsMenu>
    </PageHeader>
  );
}

export default ClassroomNamePage;
