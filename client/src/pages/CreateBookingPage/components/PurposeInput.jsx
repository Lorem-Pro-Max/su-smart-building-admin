import { Form, Input } from "antd";

const MAX_PURPOSE_LENGTH = 500;

function PurposeInput({ setFormData }) {
    return (
        <Form.Item label="เหตุผลการจอง" name="purpose">
            <Input.TextArea
                rows={3}
                maxLength={MAX_PURPOSE_LENGTH}
                showCount
                placeholder="ระบุเหตุผลหรือรายละเอียดเพิ่มเติมของการจอง"
                onChange={(event) =>
                    setFormData((prev) => ({ ...prev, purpose: event.target.value }))
                }
            />
        </Form.Item>
    );
}

export default PurposeInput;
