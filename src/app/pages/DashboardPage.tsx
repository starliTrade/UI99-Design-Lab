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
import { Stat } from '../../components/data/Stat';
import { Table, TableColumn } from '../../components/data/Table';
import { Progress } from '../../components/data/Progress';
import { Avatar } from '../../components/data/Avatar';
import { AvatarGroup } from '../../components/data/AvatarGroup';
import { Card } from '../../components/containers/Card';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Mist } from '../../components/atoms/Mist';
import { Input } from '../../components/inputs/Input';
import { getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  SquaresFour,
  GitBranch,
  ChartBar,
  Gear,
  Bell,
  MagnifyingGlass,
  Plus,
  ArrowUpRight,
  Shield,
  Stack,
  Sparkle,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export function DashboardPage() {
  const { navigate } = useNavigation();
  const [selectedRows, setSelectedRows] = useState<number[]>([0]);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  const breadcrumbItems = [
    { label: 'خانه', onClick: () => navigate({ name: 'dashboard' }) },
    { label: 'داشبورد', active: true },
  ];

  const tableColumns: TableColumn[] = [
    { key: 'name', title: 'عنوان پروژه', align: 'right' },
    { key: 'tier', title: 'سطح امنیت', align: 'right' },
    { key: 'progress', title: 'وضعیت پیشرفت', align: 'center' },
    { key: 'status', title: 'وضعیت استقرار', align: 'left' },
  ];

  const tableData = [
    {
      id: 'proj-alpha',
      name: 'بازطراحی کلاستر Alpha',
      tier: 'HSM Enclave Level 4',
      progress: '۸۴٪',
      status: <Badge semantic="success">Nominal</Badge>,
    },
    {
      id: 'proj-beta',
      name: 'مهاجرت دیتابیس توزیع‌شده',
      tier: 'PostgreSQL Shard Cluster',
      progress: '۶۲٪',
      status: <Badge semantic="info">Syncing</Badge>,
    },
    {
      id: 'proj-gamma',
      name: 'بازرسی امنیتی پروتکل TLS 1.3',
      tier: 'Zero-Trust Gateway',
      progress: '۹۸٪',
      status: <Badge semantic="success">Verified</Badge>,
    },
    {
      id: 'proj-delta',
      name: 'بهینه‌سازی لودسل‌های شبکه',
      tier: 'Anycast Transit Transit',
      progress: '۲۹٪',
      status: <Badge semantic="warning">Elevated</Badge>,
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
                <LiminalIcon icon={Stack} size="sm" weight="light" color={BRAND.hex} />
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
            <div className="flex items-center gap-3">
              <div style={{ width: '180px' }} className="hidden sm:block">
                <Input
                  type="search"
                  placeholder="جستجو در شاردها..."
                  prefix={<LiminalIcon icon={MagnifyingGlass} size="xs" weight="light" />}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate({ name: 'login' })}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="پروفایل کاربری"
              >
                <Avatar name="Kaelen Vos" size="sm" hue={230} />
              </button>
            </div>
          }
        >
          <NavItem active onClick={() => navigate({ name: 'dashboard' })}>
            داشبورد
          </NavItem>
          <NavItem onClick={() => navigate({ name: 'project', id: 'alpha' })}>
            پروژه‌ها
          </NavItem>
          <NavItem onClick={() => navigate({ name: 'loading' })}>
            تحلیل‌ها
          </NavItem>
        </Topbar>
      }
      sidebar={
        <Sidebar width={220} sticky>
          <Sidebar.Section label="منوی اصلی">
            <NavItem active onClick={() => navigate({ name: 'dashboard' })}>
              <LiminalIcon icon={SquaresFour} size="sm" weight="light" />
              <span>داشبورد مرکزی</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'project', id: 'alpha' })}>
              <LiminalIcon icon={GitBranch} size="sm" weight="light" />
              <span>پروژه‌ها</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'loading' })}>
              <LiminalIcon icon={ChartBar} size="sm" weight="light" />
              <span>تحلیل داده</span>
            </NavItem>
          </Sidebar.Section>

          <Sidebar.Section label="مدیریت">
            <NavItem onClick={() => navigate({ name: '404' })}>
              <LiminalIcon icon={Bell} size="sm" weight="light" />
              <span>اعلانات سیستم</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'login' })}>
              <LiminalIcon icon={Gear} size="sm" weight="light" />
              <span>تنظیمات هویت</span>
            </NavItem>
          </Sidebar.Section>
        </Sidebar>
      }
      footer={
        <Footer
          left={
            <span>
              کنسول عملیاتی لیمینال v1.0 · تمام شاخص‌ها با زمان واقعی همگام هستند
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
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            پروژه Alpha
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
        title="نمای کلی سیستم"
        subtitle="شاخص‌های بلادرنگ و تله‌متری کلاسترهای ابری با تفکیک ادراکی"
        actions={
          /* The Single Allowed Hero Mist in the entire App */
          <Mist
            as="button"
            tier="hero"
            light={BRAND.hex}
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
          >
            <LiminalIcon icon={Plus} size="xs" weight="light" />
            <span>پروژه جدید</span>
          </Mist>
        }
      />

      {/* 2. Key Metrics Section */}
      <PageSection
        title="آمار کلیدی تله‌متری"
        subtitle="عملکرد گره‌های فعال و منابع محاسباتی"
      >
        <Grid gap="md">
          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="تراکنش‌های امضاشده"
              value="۱,۴۸۲,۹۰۰"
              trend={{ direction: 'up', value: '+۱۴.۲٪', semantic: 'success' }}
              subtitle="در مقایسه با دوره قبل"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="کلاسترهای برخط"
              value="۱۴۴ / ۱۴۴"
              trend={{ direction: 'up', value: '۱۰۰٪', semantic: 'info' }}
              subtitle="وضعیت پایداری بهینه"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="نرخ تاخیر شبکه"
              value="۲.۴ ms"
              trend={{ direction: 'down', value: '-۱۸٪', semantic: 'success' }}
              subtitle="ترافیک داخلی منطقه"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="مصرف حافظه Enclave"
              value="۵۴.۲٪"
              trend={{ direction: 'neutral', value: 'نرمال', semantic: 'info' }}
              subtitle="فضای ذخیره‌سازی آزاد"
            />
          </GridCol>
        </Grid>
      </PageSection>

      {/* 3. Recent Projects Section */}
      <PageSection
        title="پروژه‌های اخیر"
        subtitle="فهرست مخازن و استقرارهای در حال اجرای زیرساخت"
        divider
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
          >
            <span>مشاهده جزئیات Alpha</span>
            <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" className="mr-1" />
          </Button>
        }
      >
        <Card padding="sm">
          <Table
            columns={tableColumns}
            data={tableData}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(idx, sel) => {
              if (sel) setSelectedRows((p) => [...p, idx]);
              else setSelectedRows((p) => p.filter((i) => i !== idx));
            }}
            onSelectAll={(all) => {
              setSelectedRows(all ? tableData.map((_, i) => i) : []);
            }}
            onRowClick={(row) => {
              if (row.id === 'proj-alpha') {
                navigate({ name: 'project', id: 'alpha' });
              }
            }}
          />
        </Card>
      </PageSection>

      {/* 4. Team & Progress Section */}
      <PageSection
        title="تیم توسعه و وضعیت اسپرینت‌ها"
        subtitle="تخصیص منابع انسانی و پیشرفت فازهای عملیاتی"
        divider
      >
        <Grid gap="lg">
          <GridCol col={8} md={12} sm={12}>
            <Card padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                      تیم معماری هسته لیمینال
                    </h4>
                    <p style={{ margin: 0, fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                      ۵ مهندس ارشد فعال در این کلاستر
                    </p>
                  </div>

                  <AvatarGroup max={4} size="md">
                    <Avatar name="Kaelen Vos" hue={230} />
                    <Avatar name="Mira Rayne" hue={145} />
                    <Avatar name="Dmitri Vance" hue={15} />
                    <Avatar name="Elena Rostova" hue={290} />
                    <Avatar name="Chen Wei" hue={75} />
                  </AvatarGroup>
                </div>

                <div className="space-y-3 pt-2">
                  <Progress
                    value={84}
                    semantic="success"
                    showLabel
                    label="مهاجرت به معماری بدون شیمر (Zero-Shimmer)"
                  />
                  <Progress
                    value={68}
                    semantic="info"
                    showLabel
                    label="همگام‌سازی شاخص‌های نردبان نوری S0..S5"
                  />
                  <Progress
                    value={42}
                    semantic="warning"
                    showLabel
                    label="پیاده‌سازی تست‌های بارگذاری HSM"
                  />
                </div>
              </div>
            </Card>
          </GridCol>

          <GridCol col={4} md={12} sm={12}>
            <Card padding="md">
              <div className="space-y-3">
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                  راهنمای سریع ناوبری
                </h4>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => navigate({ name: 'project', id: 'alpha' })}
                    className="w-full p-2 text-right rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>صفحه پروژه Alpha</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>

                  <button
                    onClick={() => navigate({ name: 'loading' })}
                    className="w-full p-2 text-right rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>تست صفحه در حال بارگذاری</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>

                  <button
                    onClick={() => navigate({ name: '404' })}
                    className="w-full p-2 text-right rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>تست صفحه ۴۰۴</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>
                </div>
              </div>
            </Card>
          </GridCol>
        </Grid>
      </PageSection>
    </AppShell>
  );
}

export default DashboardPage;
