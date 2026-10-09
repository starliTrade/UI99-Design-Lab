import React, { useEffect } from 'react';
import { useNavigation } from '../navigation/useNavigation';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Grid, GridCol } from '../../components/layout/Grid';
import { Skeleton } from '../../components/composites/Skeleton';
import { Card } from '../../components/containers/Card';
import { Topbar } from '../../components/nav/Topbar';
import { Stack } from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { getTextStyle } from '../../engine/spec-engine';

export function LoadingPage() {
  const { navigate } = useNavigation();
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  // Auto-redirect to dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ name: 'dashboard' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppShell
      maxWidth={1100}
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
        />
      }
    >
      <PageHeader
        title="در حال بارگذاری شاخص‌های شارد..."
        subtitle="ارتباط رمزنگاری‌شده با کلاسترهای سخت‌افزاری در حال برقراری است (انتقال خودکار پس از ۳ ثانیه)"
      />

      {/* 1. Header & Profile Skeleton */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="title" width="45%" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>
      </Card>

      {/* 2. Grid Cards Skeleton */}
      <Grid gap="md">
        <GridCol col={4} md={6} sm={12}>
          <Card padding="md">
            <div className="space-y-2">
              <Skeleton variant="title" width="50%" />
              <Skeleton variant="text" width="90%" />
              <div className="pt-2">
                <Skeleton variant="card" height={54} />
              </div>
            </div>
          </Card>
        </GridCol>

        <GridCol col={4} md={6} sm={12}>
          <Card padding="md">
            <div className="space-y-2">
              <Skeleton variant="title" width="60%" />
              <Skeleton variant="text" width="85%" />
              <div className="pt-2">
                <Skeleton variant="card" height={54} />
              </div>
            </div>
          </Card>
        </GridCol>

        <GridCol col={4} md={12} sm={12}>
          <Card padding="md">
            <div className="space-y-2">
              <Skeleton variant="title" width="55%" />
              <Skeleton variant="text" width="80%" />
              <div className="pt-2">
                <Skeleton variant="card" height={54} />
              </div>
            </div>
          </Card>
        </GridCol>
      </Grid>

      {/* 3. Form-like Skeletons */}
      <Card padding="lg">
        <div className="space-y-4">
          <Skeleton variant="title" width="30%" />
          <div className="space-y-2">
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="card" height={36} />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="card" height={36} />
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

export default LoadingPage;
