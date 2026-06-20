import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FileText,
  Gauge,
  GraduationCap,
  Lightbulb,
  Settings,
  User,
  Trophy,
  Briefcase,
  Building,
  Target,
  Users,
  Heart,
  Sparkles,
} from "lucide-react";

export function getNavItems(settings = {}) {
  // Default all to true if settings not provided
  const showEducation = settings.showEducation ?? true;
  const showAchievements = settings.showAchievements ?? true;
  const showProjects = settings.showProjects ?? true;
  const showSkills = settings.showSkills ?? true;
  const showInternship = settings.showInternship ?? true;
  const showProfession = settings.showProfession ?? true;
  const showProfessionSelf = settings.showProfessionSelf ?? true;
  const showHobbies = settings.showHobbies ?? true;
  const showWishes = settings.showWishes ?? true;
  const showSports = settings.showSports ?? true;
  const showActivities = settings.showActivities ?? true;
  const showOutOfBox = settings.showOutOfBox ?? true;

  const allItems = [
    { icon: Gauge, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: GraduationCap, label: "Education", href: "/dashboard/education", show: showEducation },
    { icon: Trophy, label: "Achievements", href: "/dashboard/achievements", show: showAchievements },
    { icon: Briefcase, label: "Projects", href: "/dashboard/projects", show: showProjects },
    { icon: Award, label: "Skills", href: "/dashboard/skills", show: showSkills },
    { icon: Building, label: "Internship", href: "/dashboard/internship", show: showInternship },
    { icon: Briefcase, label: "Profession", href: "/dashboard/profession", show: showProfession },
    { icon: Briefcase, label: "Self Business", href: "/dashboard/profession-self", show: showProfessionSelf },
    { icon: Lightbulb, label: "Out of Box", href: "/dashboard/outofbox", show: showOutOfBox },
    { icon: Target, label: "Sports Activity", href: "/dashboard/sports", show: showSports },
    { icon: Users, label: "Other Activity", href: "/dashboard/activities", show: showActivities },
    { icon: Heart, label: "Hobbies", href: "/dashboard/hobbies", show: showHobbies },
    { icon: Sparkles, label: "My Roadmap", href: "/dashboard/wishes", show: showWishes },
    { icon: FileText, label: "Resume", href: "/dashboard/resume" },
    { icon: BookOpen, label: "User Manual", href: "/dashboard/manual" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return allItems.filter(item => item.show !== false);
}
