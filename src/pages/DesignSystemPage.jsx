import { AdminCard } from '../components/AdminCard';
import { AdminTableContainer } from '../components/AdminTableContainer';
import { EmptyState } from '../components/EmptyState';
import { InfoBanner } from '../components/InfoBanner';
import { MockActionButton } from '../components/MockActionButton';
import { MockLoading } from '../components/MockLoading';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';

export function DesignSystemPage() {
  return (
    <div className="page-stack">
      <PageHeader title="نظام التصميم — بيانور Admin" />
      <InfoBanner>هذه الصفحة لعرض كل مكوّنات الواجهة. كل الأزرار mock — UI فقط.</InfoBanner>

      <SectionHeader title="Stat cards" />
      <div className="grid-3">
        <StatCard label="مثال" value="1,284" sub="نص فرعي" />
        <StatCard label="نشط" value="642" />
        <StatCard label="تنبيه" value="18" />
      </div>

      <SectionHeader title="Status badges" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge tone="success">نشط</StatusBadge>
        <StatusBadge tone="warning">قيد المراجعة</StatusBadge>
        <StatusBadge tone="error">ناقص</StatusBadge>
        <StatusBadge tone="info">معلومة</StatusBadge>
        <StatusBadge tone="muted">موقوف</StatusBadge>
      </div>

      <SectionHeader title="أزرار mock + snackbars" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MockActionButton>أساسي</MockActionButton>
        <MockActionButton variant="secondary">ثانوي</MockActionButton>
        <MockActionButton variant="outline">حدود</MockActionButton>
        <MockActionButton action="save">حفظ</MockActionButton>
        <MockActionButton action="publish">نشر</MockActionButton>
        <MockActionButton action="check">فحص</MockActionButton>
        <MockActionButton action="export">تصدير</MockActionButton>
      </div>

      <SectionHeader title="Mock loading" />
      <MockLoading />

      <SectionHeader title="Banners" />
      <InfoBanner tone="info">بانر معلومات — مثل حالة manifest أو تعليمات.</InfoBanner>
      <InfoBanner tone="warning">بانر تحذير — مثل «الدفع غير متصل» أو mp3 ناقص.</InfoBanner>

      <AdminCard>
        <SectionHeader title="جدول داخل AdminTableContainer" />
        <AdminTableContainer>
          <table className="admin-table">
            <thead>
              <tr>
                <th>العمود</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>صف تجريبي</td>
                <td><StatusBadge tone="success">موجود</StatusBadge></td>
              </tr>
            </tbody>
          </table>
        </AdminTableContainer>
      </AdminCard>

      <AdminCard>
        <SectionHeader title="Empty states (أمثلة Prompt 24)" />
        <div className="grid-2">
          <EmptyState title="لا توجد شكاوى" description="عمود Kanban أو جدول فارغ." compact />
          <EmptyState title="لا يوجد محتوى في هذه الفئة" description="المكتبة بعد الفلاتر." compact />
          <EmptyState title="لا توجد نتائج بحث" description="صفحة /search." compact />
          <EmptyState title="لا توجد ملفات مرفوعة" description="قسم uploads في الأصول." compact />
        </div>
      </AdminCard>
    </div>
  );
}
