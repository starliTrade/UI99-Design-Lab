import React from 'react';
import { useNavigation } from '../navigation/useNavigation';
import { AppShell } from '../../components/layout/AppShell';
import { ErrorPage } from '../../components/composites/ErrorPage';
import { Topbar } from '../../components/nav/Topbar';
import { Button } from '../../components/atoms/Button';
import { Stack, ArrowLeft } from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { getTextStyle } from '../../engine/spec-engine';

export function NotFoundPage() {
  const { navigate } = useNavigation();
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  return (
    <AppShell
      maxWidth={900}
      topbar={
        <Topbar
          sticky={false}
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ name: 'dashboard' })}
            >
              <LiminalIcon icon={ArrowLeft} size="xs" weight="light" className="mr-1" />
              <span>بازگشت به خانه</span>
            </Button>
          }
        />
      }
    >
      <div style={{ marginTop: '60px' }}>
        <ErrorPage
          code="404"
          title="این صفحه در زیرساخت وجود ندارد"
          description="مسیر یا شارد آدرس‌دهی شده در جدول مسیرهای معتبر ثبت نشده است. ممکن است آدرس تغییر کرده یا دسترسی آن منقضی شده باشد."
          primaryAction={{
            label: 'بازگشت به داشبورد اصلی',
            onClick: () => navigate({ name: 'dashboard' }),
          }}
          secondaryAction={{
            label: 'ثبت گزارش خطا',
            onClick: () => {},
          }}
        />
      </div>
    </AppShell>
  );
}

export default NotFoundPage;
