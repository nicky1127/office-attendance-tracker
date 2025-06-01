import { Target, Menu, Palette, Layers, Download } from "lucide-react";
import { ChangelogContent } from "./types";

const v2_1_0: ChangelogContent = {
  title: "Major Update: Planner Mode & UI Enhancements",

  features: [
    {
      icon: <Target className="w-5 h-5 text-purple-500" />,
      title: "Attendance Planner Mode",
      description:
        "New planning mode to explore attendance scenarios with customizable reference dates and period calculations",
    },
    {
      icon: <Download className="w-5 h-5 text-blue-500" />,
      title: "Import Tracker Data",
      description:
        "Copy your real attendance history into planner mode as a starting point for scenario planning",
    },
    {
      icon: <Menu className="w-5 h-5 text-emerald-500" />,
      title: "Enhanced Menu Animations",
      description:
        "Smooth sliding menu with staggered item animations and improved visual feedback",
    },
  ],

  improvements: [
    "Added scrollable calendar view for multi-month planning scenarios",
    "Introduced collapsible 'How to use' guidance with info icon",
    "Implemented planner-specific period calculations ending on Fridays",
    "Enhanced component organization with better separation of concerns",
    "Improved user experience with intuitive mode switching",
    "Added visual period indicators showing dimmed dates outside tracking windows",
    "Streamlined planner interface by removing bulk weekday selection",
    "Smart data import with confirmation dialogs and loading states",
    "Complete data replacement workflow for clean planning baselines",
  ],
};

// Export both named and default
export { v2_1_0 };
export default v2_1_0;
