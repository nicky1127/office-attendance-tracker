import { Calendar, Heart, BarChart3, Smartphone } from "lucide-react";
import { ChangelogContent } from "./types";

const changelog: ChangelogContent = {
  title: "Major Update: Period-Based Tracking",

  features: [
    {
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      title: "4-Week & 12-Week Periods",
      description:
        "Switch between rolling 4-week and 12-week attendance tracking periods",
    },
    {
      icon: <Heart className="w-5 h-5 text-red-500" />,
      title: "Sick Leave Tracking",
      description: "New sick leave option that reduces available working days",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
      title: "Enhanced Statistics",
      description: "Better attendance insights with period-based calculations",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-500" />,
      title: "Mobile-First Design",
      description: "Improved responsive design optimized for mobile devices",
    },
  ],

  improvements: [
    "Calendar now shows dates for all visible days",
    "Month indicators for better navigation",
    "Cleaner period toggle buttons",
    "Enhanced 'today' date highlighting",
    "Simplified month picker without attendance colors",
    "Better visual separation in button groups",
  ],
};

export default changelog;
