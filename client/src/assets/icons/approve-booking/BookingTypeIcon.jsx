const BookingTypeIcon = ({
  width = 21,
  height = 23,
  color = "#13C2C2",
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.6078 0.75V3.83574M4.35083 0.75V3.83574M8.97929 0.75V3.83574"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17.2068 11.0349V9.49205C17.2068 6.09791 17.2068 4.40084 16.1524 3.34641C15.0979 2.29199 13.4009 2.29199 10.0069 2.29199H7.94983C4.5558 2.29199 2.85878 2.29199 1.80439 3.34642C0.75 4.40084 0.75 6.09791 0.75 9.49205V14.1207C0.75 17.5148 0.75 19.2118 1.80439 20.2663C2.85878 21.3207 4.5558 21.3207 7.94983 21.3207H8.97838"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4.86328 14.1207H8.97747M4.86328 10.0063H13.0917"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.8512 20.9649L12.0649 21.3221L12.4222 19.5358C12.4948 19.173 12.6731 18.8397 12.9347 18.5782L17.1162 14.3965C17.4821 14.0306 18.0755 14.0306 18.4414 14.3965L18.9904 14.9454C19.3562 15.3114 19.3562 15.9048 18.9904 16.2706L14.8088 20.4523C14.5472 20.7139 14.214 20.8923 13.8512 20.9649Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BookingTypeIcon;