import React, { useState } from 'react';
import { useNavigation } from '../navigation/useNavigation';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSection } from '../../components/layout/PageSection';
import { Grid, GridCol } from '../../components/layout/Grid';
import { Footer } from '../../components/layout/Footer';
import { Topbar } from '../../components/nav/Topbar';
import { Sidebar } from '../../components/nav/Sidebar';
import { NavItem } from '../../components/nav/NavItem';
import { Breadcrumb } from '../../components/nav/Breadcrumb';
import { Tabs } from '../../components/nav/Tabs';
import { Alert } from '../../components/feedback/Alert';
import { Stat } from '../../components/data/Stat';
import { Table, TableColumn } from '../../components/data/Table';
import { Card } from '../../components/containers/Card';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Toggle } from '../../components/atoms/Toggle';
import { Select } from '../../components/inputs/Select';
import { Input } from '../../components/inputs/Input';
import { getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  FolderGit2,
  LayoutDashboard,
  BarChart3,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export function ProjectPage({ id }: { id: string }) {
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [quarantineEnabled, setQuarantineEnabled] = useState<boolean>(false);
  const [selectedTaskRows, setSelectedTaskRows] = useState<number[]>([1]);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  const projectTitle = id === 'alpha' ? 'کلاستر محاسباتی Alpha' : `پروژه سازمانی ${id.toUpperCase()}`;

  const breadcrumbItems = [
    { label: 'خانه', onClick: () => navigate({ name: 'dashboard' }) },
    { label: 'پروژه‌ها', onClick: () => navigate({ name: 'dashboard' }) },
    { label: projectTitle, active: true },
  ];

  const taskColumns: TableColumn[] = [
    { key: 'task', title: 'عنوان فعالیت', align: 'right' },
    { key: 'assignee', title: 'مسئول مستقیم', align: 'right' },
    { key: 'priority', title: 'اولویت', align: 'center' },
    { key: 'state', title: 'وضعیت', align: 'left' },
  ];

  const taskData = [
    {
      id: 'task-1',
      task: 'ارتقای میان‌افزار HSM به نسخه 2.4',
      assignee: 'Kaelen Vos',
      priority: <Badge semantic="danger">P0 فوری</Badge>,
      state: 'تکمیل‌شده',
    },
    {
      id: 'task-2',
      task: 'بازبینی کلیدهای ریشه در انکلاو توکیو',
      assignee: 'Mira Rayne',
      priority: <Badge semantic="warning">P1 بالا</Badge>,
      state: 'در دست اقدام',
    },
    {
      id: 'task-3',
      task: 'تست ترافیک ساختگی ۴۰ گیگابیت بر ثانیه',
      assignee: 'Chen Wei',
      priority: <Badge semantic="info">P2 نرمال</Badge>,
      state: 'برنامه‌ریزی‌شده',
    },
  ];

  return (
    <AppShell
      maxWidth={1280}
      topbar={
        <Topbar
          sticky
          logo={
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: `${RADIUS.chip}px`,
                  background: 'rgba(233, 236, 242, 0.08)',
                  border: '1px solid rgba(233, 236, 242, 0.16)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.hex,
                }}
              >
                <Layers size={15} />
              </span>
              <span
                style={{
                  fontSize: `${TYPOGRAPHY[2].fs}px`,
                  fontWeight: 600,
                  color: getTextStyle('primary', 1).color,
                }}
              >
                LIMINAL SYSTEM
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ name: 'dashboard' })}
              >
                <ArrowLeft size={13} className="mr-1" />
                <span>بازگشت به داشبورد</span>
              </Button>
            </div>
          }
        >
          <NavItem onClick={() => navigate({ name: 'dashboard' })}>داشبورد</NavItem>
          <NavItem active>پروژه‌ها</NavItem>
          <NavItem onClick={() => navigate({ name: 'loading' })}>تحلیل‌ها</NavItem>
        </Topbar>
      }
      sidebar={
        <Sidebar width={220} sticky>
          <Sidebar.Section label="منوی اصلی">
            <NavItem onClick={() => navigate({ name: 'dashboard' })}>
              <LayoutDashboard size={15} />
              <span>داشبورد مرکزی</span>
            </NavItem>
            <NavItem active>
              <FolderGit2 size={15} />
              <span>پروژه‌ها</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'loading' })}>
              <BarChart3 size={15} />
              <span>تحلیل داده</span>
            </NavItem>
          </Sidebar.Section>

          <Sidebar.Section label="مدیریت">
            <NavItem onClick={() => navigate({ name: '404' })}>
              <Bell size={15} />
              <span>اعلانات سیستم</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'login' })}>
              <Settings size={15} />
              <span>تنظیمات هویت</span>
            </NavItem>
          </Sidebar.Section>
        </Sidebar>
      }
      footer={
        <Footer
          left={
            <span>
              پروژه: {projectTitle} · کلاستر فعال در منطقه آسیای شرقی
            </span>
          }
        >
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            داشبورد
          </button>
          <button
            onClick={() => navigate({ name: 'login' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            خروج از حساب
          </button>
        </Footer>
      }
    >
      {/* 1. Page Header */}
      <PageHeader
        breadcrumb={<Breadcrumb items={breadcrumbItems} />}
        title={projectTitle}
        subtitle="پیکربندی شاردها، کلیدهای سخت‌افزاری و وضعیت استقرار انکلاو"
        actions={
          <>
            <Button size="sm" variant="secondary">
              <FileText size={13} className="mr-1" />
              <span>گزارش وضعیت</span>
            </Button>
            <Button size="sm" variant="ghost">
              ویرایش مشخصات
            </Button>
          </>
        }
      />

      {/* 2. Project Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.Tab value="overview">نمای کلی</Tabs.Tab>
        <Tabs.Tab value="tasks">وظایف و فعالیت‌ها</Tabs.Tab>
        <Tabs.Tab value="members">اعضای تیم</Tabs.Tab>
        <Tabs.Tab value="files">پرونده‌ها و کلیدها</Tabs.Tab>
        <Tabs.Tab value="settings">تنظیمات شارد</Tabs.Tab>
      </Tabs>

      {/* 3. Inline Mist Alert (closable) */}
      <Alert
        semantic="success"
        title="اسپرینت فعلی با موفقیت به پایان رسید"
        closable
      >
        تمام ۸ گره محاسباتی با امضای مشترک بدون هیچ خطای ناهمگامی به مرحله بعد ارتقا یافتند.
      </Alert>

      {/* 4. Telemetry Stats Grid */}
      <PageSection title="شاخص‌های عملیاتی شارد">
        <Grid gap="md">
          <GridCol col={3} md={6} sm={12}>
            <Stat label="تعداد اعضای فعال" value="۱۲ مهندس" subtitle="دسترسی ریشه تایید شده" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="نرخ خطا" value="۰.۰۰۱٪" trend={{ direction: 'down', value: '-۹۰٪', semantic: 'success' }} subtitle="آستانه پایداری" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="بار محاسباتی" value="۴۲.۸٪" subtitle="توزیع متوازن" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="زمان بدون وقفه" value="۹۹.۹۹٪" trend={{ direction: 'up', value: 'SLA', semantic: 'info' }} subtitle="در ۳۰ روز اخیر" />
          </GridCol>
        </Grid>
      </PageSection>

      {/* 5. Tasks Table with Filters */}
      <PageSection
        title="فعالیت‌های بازرسی و توسعه"
        subtitle="فهرست وظایف جاری مهندسان انکلاو"
        divider
        actions={
          <div style={{ width: '180px' }}>
            <Select
              value={filterRegion}
              onChange={setFilterRegion}
              options={[
                { value: 'all', label: 'همه مناطق' },
                { value: 'tokyo', label: 'انکلاو توکیو' },
                { value: 'frankfurt', label: 'انکلاو فرانکفورت' },
              ]}
            />
          </div>
        }
      >
        <Card padding="sm">
          <Table
            columns={taskColumns}
            data={taskData}
            selectable
            selectedRows={selectedTaskRows}
            onSelectRow={(idx, sel) => {
              if (sel) setSelectedTaskRows((p) => [...p, idx]);
              else setSelectedTaskRows((p) => p.filter((i) => i !== idx));
            }}
          />
        </Card>
      </PageSection>

      {/* 6. Settings Controls from Atoms */}
      <PageSection
        title="تنظیمات بلادرنگ انکلاو"
        subtitle="مدیریت وضعیت همگام‌سازی خودکار و قرنطینه امنیتی"
        divider
      >
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: getTextStyle('primary', 1).color }}>
                  همگام‌سازی خودکار تله‌متری (Auto-Sync)
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                  ارسال داده‌های لودسل به هسته مرکزی هر ۵ ثانیه
                </div>
              </div>
              <Toggle checked={autoSync} onChange={setAutoSync} />
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.04)' }} />

            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: getTextStyle('primary', 1).color }}>
                  قرنطینه خودکار در صورت نوسان ولتاژ
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                  مسدودسازی ورودی در صورت تشخیص تغییرات سخت‌افزاری مشکوک
                </div>
              </div>
              <Toggle checked={quarantineEnabled} onChange={setQuarantineEnabled} />
            </div>
          </div>
        </Card>
      </PageSection>
    </AppShell>
  );
}

export default ProjectPage;
