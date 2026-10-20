/**
 * LIMINAL — ZERO STATE SITE
 * موتور زنده است، کامپوننت‌ها صفر شده‌اند.
 * دو صفحه: «صفر مطلق» (بیانیه) و «ممیزی زندهٔ هسته» (تست‌ها و دلایل، از موتور واقعی).
 */
import React, { useState } from 'react';
import { AuditLab } from './AuditLab';

type Tab = 'zero' | 'audit';

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px',
  border: '1px solid #0b0d0f',
  borderRadius: 8,
  fontSize: 13,
  cursor: 'pointer',
  background: active ? '#0b0d0f' : 'transparent',
  color: active ? '#E9ECF2' : 'rgba(233,236,242,0.55)',
  fontFamily: 'inherit',
});

export function ZeroSite() {
  const [tab, setTab] = useState<Tab>('audit');

  if (tab === 'audit') {
    return (
      <div>
        <nav dir="rtl" style={{
          position: 'sticky', top: 0, zIndex: 10, display: 'flex', gap: 10,
          padding: '12px 20px', background: 'rgba(6,7,9,0.92)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #0b0d0f', fontFamily: 'Vazirmatn, system-ui, sans-serif',
        }}>
          <button style={tabStyle(false)} onClick={() => setTab('zero')}>○ صفر مطلق</button>
          <button style={tabStyle(true)}>◉ ممیزی زندهٔ هسته</button>
        </nav>
        <AuditLab />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060709',
      color: '#E9ECF2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Vazirmatn, system-ui, sans-serif',
      padding: 32,
      textAlign: 'center',
      direction: 'rtl'
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>○</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        صفر مطلق
      </h1>
      <p style={{ fontSize: 16, opacity: 0.7, maxWidth: 480, lineHeight: 1.8 }}>
        موتور دست‌نخورده است — ۹ پله، یک فرمول، <code>q=0.0083</code><br/>
        کامپوننت‌ها حذف شدند تا از موتور متولد شوند، نه از حدس.<br/>
        <br/>
        <strong>چرخهٔ هر کامپوننت:</strong><br/>
        ایده → تست چشمی → تحلیل → سیاست → قانون → موتور → کامپوننت → تست → ممیزی → ثبت
      </p>
      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ padding: '8px 16px', border: '1px solid #0b0d0f', borderRadius: 8, fontSize: 12 }}>
          موتور: ۳۹ فایل ✓
        </div>
        <div style={{ padding: '8px 16px', border: '1px solid #0b0d0f', borderRadius: 8, fontSize: 12 }}>
          کامپوننت: ۰ — در انتظار تولد
        </div>
        <div style={{ padding: '8px 16px', border: '1px solid #0b0d0f', borderRadius: 8, fontSize: 12 }}>
          رودمپ: ۹ فاز تا انتشار
        </div>
      </div>
      <button style={{ ...tabStyle(true), marginTop: 32 }} onClick={() => setTab('audit')}>
        ◉ ممیزی زندهٔ هسته را ببین
      </button>
      <p style={{ marginTop: 32, fontSize: 12, opacity: 0.5 }}>
        <a href="https://github.com/starliTrade/UI99-Design-Lab/blob/arena/d2b358bd-ui99-design-lab/LIMINAL-ZERO-ROADMAP.md" style={{ color: '#E9ECF2' }}>
          LIMINAL-ZERO-ROADMAP.md
        </a>
        {' · '}
        انتشار آخرین مرحله است
      </p>
    </div>
  );
}
