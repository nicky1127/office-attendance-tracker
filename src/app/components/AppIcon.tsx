"use client";

interface AppIconProps {
  size?: number;
  className?: string;
}

const AppIcon = ({ size = 40, className = "" }: AppIconProps) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Use the custom favicon from the public folder */}
      <img
        src="/favicon.svg"
        alt="Office Attendance Tracker"
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
};

export default AppIcon;
