const UsersIcon = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="usersGrad0"
          x1="11.9991"
          y1="17.2344"
          x2="11.9991"
          y2="21.0238"
        >
          <stop stopColor="#FFD666" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>

        <linearGradient
          id="usersGrad1"
          x1="12.0005"
          y1="9.11328"
          x2="12.0005"
          y2="14.5268"
        >
          <stop stopColor="#FFD666" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>

        <linearGradient
          id="usersGrad2"
          x1="20.1203"
          y1="11.8203"
          x2="20.1203"
          y2="15.6098"
        >
          <stop stopColor="#FFD666" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>

        <linearGradient
          id="usersGrad3"
          x1="17.9536"
          y1="4.78125"
          x2="17.9536"
          y2="9.11206"
        >
          <stop stopColor="#FFD666" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>

        <linearGradient
          id="usersGrad4"
          x1="1.71446"
          y1="13.715"
          x2="6.04522"
          y2="13.715"
        >
          <stop stopColor="#FADB14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>

        <linearGradient
          id="usersGrad5"
          x1="3.8812"
          y1="6.94665"
          x2="8.21196"
          y2="6.94665"
        >
          <stop stopColor="#FADB14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
      </defs>

      <path
        d="M7.127 21.0238C7.127 19.9784 7.4827 18.9208 8.35144 18.3392C9.3933 17.6416 10.6483 17.2344 11.9991 17.2344C13.3499 17.2344 14.6049 17.6416 15.6468 18.3392C16.5155 18.9208 16.8712 19.9784 16.8712 21.0238"
        stroke="url(#usersGrad0)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M12.0005 14.5268C13.4953 14.5268 14.7072 13.3149 14.7072 11.82C14.7072 10.3251 13.4953 9.11328 12.0005 9.11328C10.5056 9.11328 9.29374 10.3251 9.29374 11.82C9.29374 13.3149 10.5056 14.5268 12.0005 14.5268Z"
        stroke="url(#usersGrad1)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17.955 11.8203C19.1568 11.8203 20.2735 12.2284 21.2002 12.9273C21.9857 13.5197 22.2857 14.5218 22.2857 15.5056V15.6098"
        stroke="url(#usersGrad2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17.9536 9.11206C19.1495 9.11206 20.119 8.14257 20.119 6.94665C20.119 5.75073 19.1495 4.78125 17.9536 4.78125C16.7577 4.78125 15.7882 5.75073 15.7882 6.94665C15.7882 8.14257 16.7577 9.11206 17.9536 9.11206Z"
        stroke="url(#usersGrad3)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.04522 11.8203C4.84329 11.8203 3.7266 12.2284 2.79992 12.9273C2.01443 13.5197 1.71446 14.5218 1.71446 15.5056V15.6098"
        stroke="url(#usersGrad4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.04658 9.11206C7.24249 9.11206 8.21196 8.14257 8.21196 6.94665C8.21196 5.75073 7.24249 4.78125 6.04658 4.78125C4.85067 4.78125 3.8812 5.75073 3.8812 6.94665C3.8812 8.14257 4.85067 9.11206 6.04658 9.11206Z"
        stroke="url(#usersGrad5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UsersIcon;
