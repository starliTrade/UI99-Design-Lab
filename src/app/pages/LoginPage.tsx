import React, { useState } from 'react';
import { useNavigation } from '../navigation/useNavigation';
import { AppShell } from '../../components/layout/AppShell';
import { Grid, GridCol } from '../../components/layout/Grid';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/containers/Card';
import { FormLayout } from '../../components/composites/FormLayout';
import { Input } from '../../components/inputs/Input';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Topbar } from '../../components/nav/Topbar';
import { NavItem } from '../../components/nav/NavItem';
import {
  getLadderColor,
  getTextStyle,
  getDirectionalRim,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { Lock, Shield, ArrowRight, Stack, Key } from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export function LoginPage() {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState<string>('architect@liminal.systems');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [loading, setLoading] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  // Concave well for lock icon
  const wellRim = getDirectionalRim(1.5, 2, true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate({ name: 'dashboard' });
    }, 600);
  };

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
                LIMINAL AUTH
              </span>
            </div>
          }
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ name: 'dashboard' })}
            >
              <span>Explore as Guest</span>
              <LiminalIcon icon={ArrowRight} size="xs" weight="light" className="ml-1" />
            </Button>
          }
        >
          <NavItem active>Identity Gate</NavItem>
        </Topbar>
      }
      footer={
        <Footer
          left={
            <span>
              Zero-Trust Hardware Enclave · TLS 1.3 Mutual Authentication
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
            Dashboard
          </button>
          <button
            onClick={() => navigate({ name: '404' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Diagnostics
          </button>
        </Footer>
      }
    >
      <div style={{ maxWidth: '960px', margin: '40px auto 0', width: '100%' }}>
        <Grid gap="lg">
          {/* Main Form Card */}
          <GridCol col={7} md={12} sm={12}>
            <Card padding="lg">
              {/* Hero Icon in Inverted Well */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  marginBottom: `${SPACING[5]}px`,
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid transparent',
                    background: wellRim ? wellRim.cssBackground : getLadderColor(1.5),
                    color: getTextStyle('tertiary', 1).color,
                    marginBottom: `${SPACING[3]}px`,
                  }}
                >
                  <LiminalIcon icon={Lock} size="md" weight="light" />
                </div>

                <h1
                  style={{
                    fontSize: `${TYPOGRAPHY[5].fs}px`,
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                    margin: 0,
                  }}
                >
                  ورود به کنسول لیمینال
                </h1>
                <p
                  style={{
                    fontSize: `${TYPOGRAPHY[2].fs}px`,
                    color: getTextStyle('secondary', 1).color,
                    marginTop: '4px',
                    margin: 0,
                  }}
                >
                  احراز هویت رمزنگاری‌شده بر مبنای کلیدهای سخت‌افزاری
                </p>
              </div>

              {/* Form Layout */}
              <FormLayout onSubmit={handleSubmit}>
                <FormLayout.Section>
                  <FormLayout.Field label="شناسه کاربری یا ایمیل سازمانی">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@enclave.liminal"
                      required
                    />
                  </FormLayout.Field>

                  <FormLayout.Field
                    label="رمز عبور سخت‌افزاری"
                    hint="حداقل ۱۲ کاراکتر ترکیبی با ریشه امنیت سخت‌افزاری HSM"
                  >
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                  </FormLayout.Field>
                </FormLayout.Section>

                <FormLayout.Actions>
                  {/* Standard Secondary Action Button */}
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={loading}
                  >
                    <LiminalIcon icon={Key} size="xs" weight="light" />
                    <span>{loading ? 'در حال تایید کلید...' : 'ورود امن به سیستم'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate({ name: 'loading' })}
                  >
                    بازیابی دسترسی
                  </Button>
                </FormLayout.Actions>
              </FormLayout>
            </Card>
          </GridCol>

          {/* Side Explanatory Card */}
          <GridCol col={5} md={12} sm={12}>
            <div className="space-y-4">
              <Card padding="md">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LiminalIcon icon={Shield} size="sm" weight="light" color={LiminalColorEngine.SEMANTICS.SUCCESS.solid} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                      پروتکل امنیتی لیمینال v1.0
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.7, color: getTextStyle('secondary', 1).color }}>
                    این دروازه دسترسی به کلاسترهای محاسباتی و مخازن توزیع‌شده را با تطابق دقیق
                    نردبان روشنایی و آستانه تفکیک ادراکی محافظت می‌کند.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Badge semantic="success">Quorum Signed</Badge>
                    <Badge semantic="info">Air-Gapped Node</Badge>
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <div className="space-y-2 text-xs" style={{ color: getTextStyle('tertiary', 1).color }}>
                  <div className="flex justify-between">
                    <span>زمان پاسخگویی دروازه:</span>
                    <span style={{ color: getTextStyle('primary', 1).color }}>0.42 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>منطقه ترانزیت:</span>
                    <span style={{ color: getTextStyle('primary', 1).color }}>asia-east1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسخه شارد:</span>
                    <span style={{ color: getTextStyle('primary', 1).color }}>4.19-lim</span>
                  </div>
                </div>
              </Card>
            </div>
          </GridCol>
        </Grid>
      </div>
    </AppShell>
  );
}

export default LoginPage;
