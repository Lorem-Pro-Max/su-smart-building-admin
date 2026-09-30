import { Card, Space, Typography, Tag, Flex, Row, Col } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStatusDetails } from '../../utils/bookingStatusMeta';

const { Text, Title } = Typography;

function BookingCard({ bookings }) {
    if (bookings?.length === 0) {
        return (
            <p className="text-gray-300 text-sm font-light text-center">ยังไม่มีประวัติการจอง</p>
        );
    }
    return (
        <>
            {
                bookings?.map((item) => {
                    const status = getStatusDetails(item.booking_status);
                    if (!status.display) { return null }
                    return (
                        <Col key={item.id} span={24}>

                            <div
                                className="bg-white border border-gray-200  rounded-2xl p-4 shadow-md"
                            >
                                <div className='flex items-center justify-between'>
                                    <Title level={5} >
                                        {item.meeting_name}
                                    </Title>
                                    <Tag color={status.color} className="h-fit w-fit" style={{ margin: 0, borderRadius: '4px' }}>
                                        {status['label']}
                                    </Tag>
                                </div>
                                <p type="secondary">ชั้น {item.floor}  {item.room_title}</p>
                                <Flex gap="small">
                                    <Space>
                                        <ClockCircleOutlined style={{ color: '#13C2C2' }} />
                                        <Text>{dayjs(item.booking_date).format('DD MMM YYYY')}</Text>
                                    </Space>
                                    <Text>{dayjs(item.start_dateTime).format('HH:mm')} - {dayjs(item.end_dateTime).format('HH:mm')} น.</Text>

                                </Flex>
                                <Space style={{ marginTop: 4 }}>
                                    <UserOutlined style={{ color: '#8c8c8c' }} />
                                    <Text type="secondary">{item.firstname} {item.lastname}</Text>
                                </Space>
                            </div>
                        </Col>
                    );
                })
            }
        </>
    );
}
export default BookingCard;
