import React from "react";

const ApproveIconTitle = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.1163 1.71484V5.8293M7.88737 1.71484V5.8293"
        stroke="url(#paint0_linear)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.2596 11.9999C21.2596 8.12076 21.2596 6.18119 20.0545 4.97609C18.8495 3.771 16.9098 3.771 13.0307 3.771H10.9735C7.09433 3.771 5.15476 3.771 3.94966 4.97609C2.74457 6.18119 2.74457 8.12076 2.74457 11.9999V14.0571C2.74457 17.9362 2.74457 19.8759 3.94966 21.0809C5.15476 22.286 7.09433 22.286 10.9735 22.286"
        stroke="url(#paint1_linear)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.74457 9.94409H21.2596"
        stroke="url(#paint2_linear)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.448 18.8923L17.1446 18.1711V16.3883M21.2591 18.1711C21.2591 20.4434 19.4169 22.2855 17.1446 22.2855C14.8723 22.2855 13.0302 20.4434 13.0302 18.1711C13.0302 15.8988 14.8723 14.0566 17.1446 14.0566C19.4169 14.0566 21.2591 15.8988 21.2591 18.1711Z"
        stroke="url(#paint3_linear)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient
          id="paint0_linear"
          x1="12.0018"
          y1="1.71484"
          x2="12.0018"
          y2="5.8293"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD15" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="12.0021"
          y1="3.771"
          x2="12.0021"
          y2="22.286"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD15" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="12.0021"
          y1="9.94409"
          x2="12.0021"
          y2="10.9441"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD15" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
        <linearGradient
          id="paint3_linear"
          x1="17.1446"
          y1="14.0566"
          x2="17.1446"
          y2="22.2855"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAAD15" />
          <stop offset="1" stopColor="#36CFC9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ApproveIconTitle;
