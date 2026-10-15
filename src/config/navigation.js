import {
  LayoutDashboard,
  Users,
  CreditCard,
  ScrollText,
  Calculator,
  Eye,
  Heart,
  Library,
  ClipboardCheck,
  MessageCircle,
  FileText,
  Clapperboard,
  Bell,
  BarChart3,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

/** قائمة العميل — صفحات مربوطة بـ Supabase فقط. المسارات القديمة تفضل شغالة بالرابط المباشر. */
export const navSections = [
  { path: '/', label: 'نظرة عامة', icon: LayoutDashboard },
  { path: '/users', label: 'المستخدمون والأطفال', icon: Users },
  { path: '/subscriptions', label: 'الاشتراكات', icon: CreditCard },
  { path: '/courses', label: 'الدورات', icon: GraduationCap },
  { path: '/library', label: 'مكتبة المحتوى', icon: Library },
  { path: '/onboarding', label: 'فيديوهات التعريف', icon: Clapperboard },
  { path: '/cms', label: 'محتوى ثابت', icon: FileText },
  { path: '/quran', label: 'القرآن', icon: ScrollText },
  { path: '/math', label: 'الحساب النقطي', icon: Calculator },
  { path: '/visual', label: 'التحفيز البصري', icon: Eye },
  { path: '/emotional', label: 'الذكاء العاطفي', icon: Heart },
  { path: '/assessments', label: 'التقييمات', icon: ClipboardCheck },
  { path: '/community', label: 'المجتمع والدعم', icon: MessageCircle },
  { path: '/ai', label: 'مساعدة بيانور (AI)', icon: Sparkles },
  { path: '/notifications', label: 'الإشعارات', icon: Bell },
  { path: '/reports', label: 'التقارير', icon: BarChart3 },
];

export const mobileNavSections = [
  { path: '/', label: 'نظرة', icon: LayoutDashboard },
  { path: '/users', label: 'المستخدمون', icon: Users },
  { path: '/courses', label: 'الدورات', icon: GraduationCap },
  { path: '/library', label: 'المكتبة', icon: Library },
  { path: '/community', label: 'المجتمع', icon: MessageCircle },
];
