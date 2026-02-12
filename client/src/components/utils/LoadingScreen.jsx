import { Spin } from "antd";

export function LoadingScreen() {
  const CustomContent = (
    <div className="flex w-22 h-22 flex-col items-center justify-center">
      <div
        className="w-21 h-21 rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(from 0deg, #13C2C2 0%, #FFC53D 75%, transparent 75%)",
          maskImage: "radial-gradient(transparent 50%, black 35%)",
          WebkitMaskImage: "radial-gradient(transparent 55%, black 60%)",
        }}
      />

      <span className="text-white text-base font-medium leading-6 ml-3">
        Loading...
      </span>
    </div>
  );

  return (
    <div className="loading-screen-container">
      <Spin
        indicator={CustomContent}
        fullscreen
        className="custom-blur-overlay"
      />
    </div>
  );
}
