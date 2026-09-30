const OFF_COLOR = "rgba(0, 0, 0, 0.25)";

export const DeviceGridFansIcon = ({ isOn = true }) => {
  return (
    <svg
      width="70"
      height="69"
      viewBox="0 0 70 69"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25.876 34.9766C18.9756 34.339 10.4671 34.568 5.78699 37.27L5.2917 37.556C3.76046 38.44 2.62636 39.9006 2.52969 41.6663C2.38449 44.318 2.69359 48.5786 5.23676 52.9836C9.74953 60.8 17.584 64.395 20.8999 65.622C21.8859 65.987 22.9652 65.842 23.8756 65.3163C25.5538 64.3476 26.2659 62.312 25.8236 60.4253C24.5886 55.1563 24.3103 47.591 28.2623 41.7063C26.7612 40.1993 25.8333 38.1206 25.8333 35.8256C25.8333 35.539 25.8478 35.256 25.876 34.9766Z"
        stroke={isOn ? "url(#paint0_linear_3787_37574)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M42.2035 38.0375C41.5739 40.3315 39.9885 42.2302 37.9019 43.2782C40.7969 49.6242 45.2999 57.0209 50.0359 59.7552L50.5312 60.0412C52.0625 60.9252 53.8949 61.1769 55.4719 60.3779C57.8409 59.1779 61.3765 56.7799 63.9195 52.3749C68.4322 44.5585 67.6285 35.9762 67.0332 32.4912C66.8562 31.4549 66.1912 30.5925 65.2805 30.0669C63.6025 29.0979 61.4835 29.4989 60.0709 30.8252C56.0442 34.6055 49.4482 38.7185 42.2035 38.0375Z"
        stroke={isOn ? "url(#paint1_linear_3787_37574)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M32.2371 27.7237C32.8554 27.5774 33.5001 27.5 34.1631 27.5C36.1638 27.5 37.9998 28.205 39.4361 29.38C43.4391 23.7226 47.4964 16.2383 47.4964 10.8333V10.2614C47.4964 8.4933 46.7984 6.78073 45.3178 5.81427C43.0941 4.3627 39.2494 2.5 34.1631 2.5C25.1376 2.5 18.107 7.48733 15.3863 9.74543C14.5774 10.4169 14.1631 11.424 14.1631 12.4753C14.1631 14.4131 15.5699 16.0475 17.4249 16.6078C22.5083 18.1434 29.0454 21.582 32.2371 27.7237Z"
        stroke={isOn ? "url(#paint2_linear_3787_37574)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M42.5034 35.8255C42.5034 40.4282 38.7728 44.1589 34.1701 44.1589C29.5678 44.1589 25.8369 40.4282 25.8369 35.8255C25.8369 31.2232 29.5678 27.4922 34.1701 27.4922C38.7728 27.4922 42.5034 31.2232 42.5034 35.8255Z"
        stroke={isOn ? "url(#paint3_linear_3787_37574)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3787_37574"
          x1="15.3812"
          y1="34.6797"
          x2="15.3812"
          y2="65.8242"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3787_37574"
          x1="52.7008"
          y1="29.5312"
          x2="52.7008"
          y2="60.8597"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_3787_37574"
          x1="30.8298"
          y1="2.5"
          x2="30.8298"
          y2="29.38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_3787_37574"
          x1="34.1702"
          y1="27.4922"
          x2="34.1702"
          y2="44.1589"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
      </defs>
    </svg>
  );
};
