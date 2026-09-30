const OFF_COLOR = "rgba(0, 0, 0, 0.25)";

export const DeviceGridDoorsIcon = ({ isOn = true }) => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 66.6654C63.682 66.6654 66.6667 63.6807 66.6667 59.9987V19.9987C66.6667 16.3168 63.682 13.332 60 13.332"
        stroke={isOn ? "url(#paint0_linear_3787_53422)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3369 22.827V57.1756C13.3369 62.486 13.3369 65.1413 14.8852 66.9933C16.4335 68.845 19.0507 69.32 24.2851 70.27L34.2852 72.085C41.5706 73.407 45.2136 74.0683 47.6086 72.073C50.0036 70.078 50.0036 66.382 50.0036 58.9906V21.0121C50.0036 13.6206 50.0036 9.92476 47.6086 7.9296C45.2136 5.93443 41.5706 6.59553 34.2852 7.9178L24.2851 9.73266C19.0507 10.6826 16.4335 11.1576 14.8852 13.0094C13.3369 14.8613 13.3369 17.5165 13.3369 22.827Z"
        stroke={isOn ? "url(#paint1_linear_3787_53422)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38.3369 39.9943V39.9609"
        stroke={isOn ? "url(#paint2_linear_3787_53422)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3787_53422"
          x1="63.3333"
          y1="13.332"
          x2="63.3333"
          y2="66.6654"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3787_53422"
          x1="31.6702"
          y1="6.66797"
          x2="31.6702"
          y2="73.3347"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_3787_53422"
          x1="38.8369"
          y1="39.9609"
          x2="38.8369"
          y2="39.9943"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
      </defs>
    </svg>
  );
};
