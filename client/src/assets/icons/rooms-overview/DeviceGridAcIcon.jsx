const OFF_COLOR = "rgba(0, 0, 0, 0.25)";

export const DeviceGridAcIcon = ({ isOn = true }) => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40.0036 73.3346C49.2082 73.3346 56.6702 65.8726 56.6702 56.668C56.6702 51.216 54.0526 46.3753 50.0052 43.3346V16.6696C50.0052 13.5618 50.0052 12.0079 49.4972 10.7822C48.8206 9.14967 47.5236 7.85254 45.8909 7.17594C44.6652 6.66797 43.1112 6.66797 40.0036 6.66797C36.8959 6.66797 35.3419 6.66797 34.1162 7.17594C32.4836 7.85254 31.1865 9.14967 30.5099 10.7822C30.0019 12.0079 30.0019 13.5618 30.0019 16.6696V43.3346C25.9547 46.3753 23.3369 51.216 23.3369 56.668C23.3369 65.8726 30.7988 73.3346 40.0036 73.3346Z"
        stroke={isOn ? "url(#paint0_linear_3787_40045)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M40.0036 50.0013C36.3216 50.0013 33.3369 52.986 33.3369 56.668C33.3369 60.35 36.3216 63.3346 40.0036 63.3346C43.6856 63.3346 46.6702 60.35 46.6702 56.668C46.6702 52.986 43.6856 50.0013 40.0036 50.0013ZM40.0036 50.0013V26.668"
        stroke={isOn ? "url(#paint1_linear_3787_40045)" : OFF_COLOR}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3787_40045"
          x1="40.0036"
          y1="6.66797"
          x2="40.0036"
          y2="73.3346"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3787_40045"
          x1="40.0036"
          y1="26.668"
          x2="40.0036"
          y2="63.3346"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD14" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
      </defs>
    </svg>
  );
};
