import React, { useState } from 'react';
import { SpecEngine, LiminalState } from './engine/spec-engine';
import { LiminalColorEngine } from './engine/liminal-color-engine';
import { LiminalLayoutEngine } from './engine/liminal-layout-engine';
import { AtomsDemo } from './components/atoms';
import { InputsDemo } from './components/inputs';
import { ContainersDemo } from './components/containers';
import { NavDemo } from './components/nav';
import { DataDemo } from './components/data';
import { FeedbackDemo } from './components/feedback';
import {
  Shield,
  Sparkles,
  Search,
  Check,
  Copy,
  Terminal,
  MoreVertical,
  Activity,
  Maximize2,
  X,
  Lock,
  MousePointer,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Palette,
  Layers,
  ArrowUpRight,
  Type,
  Ruler,
  CircleDot,
  Smartphone,
  Monitor,
  Menu,
  ChevronRight,
  Sliders,
  Bell,
  Cpu,
  Wifi,
  Radio,
  Share2,
} from 'lucide-react';

export function App() {
  const [copied, setCopied] = useState<boolean>(false);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'fluid'>('mobile');
  const [activeTab, setActiveTab] = useState<'app' | 'atoms' | 'inputs' | 'containers' | 'nav' | 'data' | 'feedback' | 'bench' | 'tokens' | 'contract'>('app');
  const [selectedHue, setSelectedHue] = useState<number>(230);
  const [interactiveState, setInteractiveState] = useState<LiminalState>('idle');
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [concentricPadding, setConcentricPadding] = useState<number>(12);
  const [selectedSegment, setSelectedSegment] = useState<string>('node-alpha');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Mobile-first horizontal scroll tracking for main tabs
  const navScrollRef = React.useRef<HTMLElement>(null);
  const tabButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  React.useEffect(() => {
    const el = tabButtonRefs.current[activeTab];
    if (el && navScrollRef.current) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  // Engines
  const neutrals = LiminalColorEngine.NEUTRALS;
  const semantics = LiminalColorEngine.SEMANTICS;
  const spectrum = LiminalColorEngine.EXTENDED_SPECTRUM;
  const brand = LiminalColorEngine.BRAND_PRIMARY;

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPE = LiminalLayoutEngine.TYPOGRAPHY;

  // Geometry calculations
  const rOuterDemo = RADIUS.container; // 24px
  const rInnerDemo = LiminalLayoutEngine.getConcentricRadius(rOuterDemo, concentricPadding);

  // Surface Styles Strictly Derived from LIMINAL Engine
  const canvasBg = SpecEngine.LADDER[0]; // #060709 (S0)

  // S1: Container Cards (Surface 1 #08090C, Rim 1)
  const containerStyle = SpecEngine.style({ surfaceLevel: 1, isContainer: true });

  // S2: Nested Panels (Surface 2 #0A0B0F, Rim 1)
  const panelStyle = SpecEngine.style({ surfaceLevel: 2, isContainer: true });

  // Floating Header Bar: Surface 2 (#0A0B0F), Rim 1, Elevation E1 Sub-Canvas Shadow
  const headerBarStyle = SpecEngine.style({
    surfaceLevel: 2,
    isFloating: true,
    elevation: 1,
    isContainer: true,
  });

  // Floating Dropdown: Surface 4 (#101115), Rim 2, Elevation E1 Shadow
  const dropdownComputed = SpecEngine.style({
    surfaceLevel: 4,
    isFloating: true,
    elevation: 1,
    interactive: true,
  });

  // Featured Floating Card: Surface 4 (#101115), Rim 2, Elevation E2 Shadow
  const featuredComputed = SpecEngine.style({
    surfaceLevel: 4,
    isFeatured: true,
  });

  // Floating Modal: Surface 5 (#131418), Rim 3, Elevation E3 Shadow
  const modalComputed = SpecEngine.style({
    surfaceLevel: 5,
    isFloating: true,
    elevation: 3,
    isContainer: true,
  });

  // Floating Toast: Surface 4 (#101115), Rim 2, Elevation E4 Shadow
  const toastComputed = SpecEngine.style({
    surfaceLevel: 4,
    isFloating: true,
    elevation: 4,
    isFeatured: true,
  });

  // Interactive Test Control with Liminal States
  const playgroundComputed = SpecEngine.style({
    surfaceLevel: 2,
    containerLevel: 1,
    interactive: true,
    state: interactiveState,
  });

  // Input Control with Focus State
  const inputComputed = SpecEngine.style({
    surfaceLevel: 2,
    containerLevel: 1,
    interactive: true,
    isInput: true,
    state: inputFocused ? 'focus' : 'idle',
  });

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const copyFullContract = () => {
    const text = `/* ==========================================================================
   LIMINAL DESIGN SYSTEM — FULL CONTRACT (COLOR · RIM · SHADOW · STATES · LAYOUT)
   ========================================================================== */

:root {
  /* == 1. COLOR & TONAL LADDER == */
  --lim-l0-base:          #060709; /* Canvas */
  --lim-l1-surface:       #08090C; /* Container */
  --lim-l2-raised:        #0A0B0F; /* Nested Panel */
  --lim-l3-control:       #0D0E12; /* Control */
  --lim-l4-elevated:      #101115; /* Floating / Popover */
  --lim-l5-overlay:       #131418; /* Modal / Ceiling L 0.203 */

  /* == 2. DIRECTIONAL SPECULAR RIM (180deg Top > Side 55% > Bottom) == */
  --rim-1-top: #0B0C10; --rim-1-side: #0A0B0E; --rim-1-bottom: #0A0B0F;
  --rim-2-top: #0D0E12; --rim-2-side: #0B0C10; --rim-2-bottom: #0A0B0F;
  --rim-3-top: #0E0F13; --rim-3-side: #0D0E12; --rim-3-bottom: #0B0C10;

  /* == 3. SUB-CANVAS SHADOWS (Penumbra S-1 #030406 + S-2 #010203) == */
  --shadow-e1: 0 2px 6px rgba(3,4,6,0.30), 0 1px 2px rgba(1,2,3,0.22);
  --shadow-e2: 0 4px 12px rgba(3,4,6,0.36), 0 2px 4px rgba(1,2,3,0.26);
  --shadow-e3: 0 8px 28px rgba(3,4,6,0.44), 0 3px 8px rgba(1,2,3,0.30);
  --shadow-e4: 0 14px 44px rgba(3,4,6,0.50), 0 5px 12px rgba(1,2,3,0.34);

  /* == 4. SPACING TOKENS (Atom = 4px) == */
  --lim-space-1: 4px;   --lim-space-2: 8px;   --lim-space-3: 12px;
  --lim-space-4: 16px;  --lim-space-5: 24px;  --lim-space-6: 32px;
  --lim-space-7: 48px;  --lim-space-8: 64px;  --lim-space-9: 96px;

  /* == 5. RADIUS TOKENS (r_inner = max(4, r_outer - padding)) == */
  --lim-radius-chip:      6px;
  --lim-radius-control:   10px;
  --lim-radius-card:      16px;
  --lim-radius-panel:     20px;
  --lim-radius-container: 24px;
  --lim-radius-full:      9999px;

  /* == 6. TYPOGRAPHY TOKENS (Modular 1.2 ratio, base 16) == */
  --lim-fs-1: 11px; --lim-fs-2: 13px; --lim-fs-3: 16px; --lim-fs-4: 19px;
  --lim-fs-5: 23px; --lim-fs-6: 28px; --lim-fs-7: 33px; --lim-fs-8: 40px;

  /* == 7. BRAND PRIMARY == */
  --lim-brand-primary:  #E9ECF2;
  --lim-brand-on-color: #060709;

  /* == 11. LIMINAL GLASS (5-LAYER ARCHITECTURE) == */
  /* Layers: Halo -> Edge 1px (Top > Bottom > Side) -> Refraction Inset -> Neutral Surface -> Signal */
  /* cta: edge .65/.40/.50, refr .30/.22 | inline: edge .45/.26/.34, refr .20/.14 */
}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: canvasBg,
        color: SpecEngine.getTextStyle('primary', 0).color,
      }}
    >
      {/* ─── 1. TOP NAVBAR (Strictly Liminal Surface 2 · Rim 1 · Elevation E1 Sub-Canvas Shadow) ─── */}
      <div className="sticky top-0 z-40 p-2 sm:p-3 backdrop-blur-md">
        <header
          className={`mx-auto px-3.5 py-2.5 flex items-center justify-between transition-all duration-300 ${
            deviceMode === 'mobile' ? 'max-w-[410px]' : 'max-w-2xl'
          }`}
          style={{
            ...headerBarStyle.style,
            borderRadius: `${RADIUS.panel}px`,
          }}
        >
          {/* Logo & Identity */}
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: semantics.SUCCESS.solid }}
            ></span>
            <div>
              <div
                className="font-mono font-bold leading-none flex items-center gap-1.5"
                style={{
                  ...LiminalLayoutEngine.getTypeStyle(2),
                  color: SpecEngine.getTextStyle('primary', 2).color,
                }}
              >
                <span>LIMINAL</span>
                <span style={{ color: SpecEngine.getTextStyle('quaternary', 2).color }}>·</span>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}>v1.0</span>
              </div>
            </div>
          </div>

          {/* Liminal Segmented Viewport Switcher & Copy Action */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            {/* Viewport Switcher Track (Surface 1 #08090C · Rim 1) */}
            <div
              className="flex p-1"
              style={{
                ...SpecEngine.style({ surfaceLevel: 1, isContainer: true }).style,
                borderRadius: `${RADIUS.control}px`,
              }}
            >
              <button
                onClick={() => setDeviceMode('mobile')}
                className="flex items-center gap-1 px-2 py-1 transition-all cursor-pointer"
                style={{
                  ...(deviceMode === 'mobile'
                    ? {
                        ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                        color: SpecEngine.getTextStyle('primary', 3).color,
                        fontWeight: 600,
                      }
                    : {
                        background: 'transparent',
                        border: 'none',
                        color: SpecEngine.getTextStyle('secondary', 1).color,
                      }),
                  borderRadius: `${LiminalLayoutEngine.getConcentricRadius(RADIUS.control, 2)}px`,
                }}
              >
                <Smartphone className="w-3 h-3" />
                <span>390px</span>
              </button>

              <button
                onClick={() => setDeviceMode('fluid')}
                className="flex items-center gap-1 px-2 py-1 transition-all cursor-pointer"
                style={{
                  ...(deviceMode === 'fluid'
                    ? {
                        ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                        color: SpecEngine.getTextStyle('primary', 3).color,
                        fontWeight: 600,
                      }
                    : {
                        background: 'transparent',
                        border: 'none',
                        color: SpecEngine.getTextStyle('secondary', 1).color,
                      }),
                  borderRadius: `${LiminalLayoutEngine.getConcentricRadius(RADIUS.control, 2)}px`,
                }}
              >
                <Monitor className="w-3 h-3" />
                <span>Fluid</span>
              </button>
            </div>

            {/* Contract Copy Button (Surface 3 · Rim 2) */}
            <button
              onClick={copyFullContract}
              className="p-1.5 transition-all cursor-pointer flex items-center justify-center"
              style={{
                ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                borderRadius: `${RADIUS.control}px`,
                color: SpecEngine.getTextStyle('primary', 3).color,
              }}
              title="Copy Liminal Contract"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#34C08B]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Main Page Area */}
      <main
        className={`mx-auto p-3 sm:p-5 lg:p-6 space-y-4 transition-all duration-300 ${
          deviceMode === 'mobile' ? 'max-w-[410px]' : 'max-w-2xl'
        }`}
      >
        {/* ─── 2. MAIN SEGMENTED NAVIGATION TABS (Liminal Track on S1 · Active Tab on S3 with Rim 2 · Mobile-First Horizontal Rail) ─── */}
        <div className="relative w-full">
          <nav
            ref={navScrollRef}
            className="p-1 flex items-center overflow-x-auto no-scrollbar transition-all select-none"
            style={{
              ...containerStyle.style,
              borderRadius: `${RADIUS.panel}px`,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              gap: '3px',
            }}
          >
            {[
              { id: 'app', label: 'Gateway' },
              { id: 'atoms', label: 'Atoms' },
              { id: 'inputs', label: 'Inputs' },
              { id: 'containers', label: 'Containers' },
              { id: 'nav', label: 'Navigation' },
              { id: 'data', label: 'Data' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'bench', label: 'States' },
              { id: 'tokens', label: 'Colors' },
              { id: 'contract', label: 'Contract' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const tabStyle = isSelected
                ? SpecEngine.style({ surfaceLevel: 3, interactive: true })
                : SpecEngine.style({ surfaceLevel: 1, interactive: true });

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabButtonRefs.current[tab.id] = el;
                  }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="shrink-0 px-3.5 sm:px-4 py-2 text-center font-mono text-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center select-none"
                  style={{
                    background: isSelected ? tabStyle.style.background : 'transparent',
                    border: isSelected ? tabStyle.style.border : '1px solid transparent',
                    boxShadow: isSelected ? tabStyle.style.boxShadow : 'none',
                    color: isSelected
                      ? SpecEngine.getTextStyle('primary', 3).color
                      : SpecEngine.getTextStyle('secondary', 1).color,
                    fontWeight: isSelected ? 600 : 400,
                    borderRadius: `${LiminalLayoutEngine.getConcentricRadius(RADIUS.panel, 4)}px`,
                    minHeight: '36px',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── TAB 1: REAL-WORLD MOBILE GATEWAY CONSOLE ─── */}
        {activeTab === 'app' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Header Card (Container Surface 1 #08090C · Rim 1 · Radius 24px) */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              {/* Top row */}
              <div
                className="flex items-center justify-between pb-3"
                style={{
                  borderBottom: `1px solid ${neutrals.L4.hex}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      ...SpecEngine.style({ surfaceLevel: 2, isContainer: true }).style,
                      borderRadius: `${RADIUS.control}px`,
                    }}
                  >
                    <Cpu className="w-4 h-4 text-[#6EE0B4]" />
                  </div>
                  <div>
                    <div
                      style={{
                        ...LiminalLayoutEngine.getTypeStyle(2),
                        color: SpecEngine.getTextStyle('primary', 1).color,
                        fontWeight: 600,
                      }}
                    >
                      EDGE CORE 01
                    </div>
                    <div
                      style={{
                        ...LiminalLayoutEngine.getTypeStyle(1),
                        color: SpecEngine.getTextStyle('tertiary', 1).color,
                      }}
                    >
                      TLS 1.3 Strict · Online
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Semantic Pill Badge (Pill is loud, allowed for badges) */}
                  <span
                    className="px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{
                      backgroundColor: semantics.SUCCESS.subtle,
                      border: `1px solid ${semantics.SUCCESS.border}`,
                      color: semantics.SUCCESS.text,
                      borderRadius: `${RADIUS.full}px`,
                    }}
                  >
                    Active
                  </span>

                  {/* Dropdown Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(!activeDropdown)}
                      className="p-1.5 transition-all cursor-pointer flex items-center justify-center"
                      style={{
                        ...SpecEngine.style({ surfaceLevel: 2, interactive: true }).style,
                        borderRadius: `${RADIUS.control}px`,
                        color: SpecEngine.getTextStyle('primary', 2).color,
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Floating Dropdown with Sub-Canvas E1 Shadow */}
                    {activeDropdown && (
                      <div
                        className="absolute right-0 top-10 w-48 p-1.5 space-y-0.5 z-30 font-mono text-xs"
                        style={{
                          ...dropdownComputed.style,
                          borderRadius: `${RADIUS.card}px`,
                        }}
                      >
                        <div
                          className="px-2 py-1 text-[9px] uppercase tracking-wider"
                          style={{
                            color: SpecEngine.getTextStyle('quaternary', 4).color,
                            borderBottom: `1px solid ${neutrals.L4.hex}`,
                          }}
                        >
                          S4 · E1 Shadow
                        </div>
                        <button
                          onClick={() => {
                            setActiveDropdown(false);
                            triggerToast();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                          style={{
                            color: SpecEngine.getTextStyle('secondary', 4).color,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = SpecEngine.HALF_STEPS[4.5];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Trigger E4 Toast
                        </button>
                        <button
                          onClick={() => {
                            setActiveDropdown(false);
                            setBottomDrawerOpen(true);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                          style={{
                            color: SpecEngine.getTextStyle('secondary', 4).color,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = SpecEngine.HALF_STEPS[4.5];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Open Bottom Drawer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Control (Directional Specular 180° Rim 2 · Focus 2px Outline) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(1),
                      color: SpecEngine.getTextStyle('tertiary', 1).color,
                    }}
                  >
                    NODE QUERY
                  </span>
                  <span
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(1),
                      color: inputFocused
                        ? semantics.SUCCESS.text
                        : SpecEngine.getTextStyle('quaternary', 1).color,
                    }}
                  >
                    {inputFocused ? 'Focus: Rim 3 · 2px Outline' : 'Idle: Rim 2'}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 h-11 px-3 transition-all"
                  style={{
                    ...inputComputed.style,
                    borderRadius: `${RADIUS.control}px`,
                  }}
                >
                  <Search className="w-4 h-4 text-[#555D6E] shrink-0" />
                  <input
                    type="text"
                    defaultValue="cluster.eu-west.liminal"
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    className="w-full bg-transparent text-xs font-mono outline-none"
                    style={{
                      color: SpecEngine.getTextStyle('primary', 2).color,
                    }}
                  />
                  <span
                    className="text-[9px] px-1 py-0.5"
                    style={{
                      backgroundColor: SpecEngine.LADDER[1],
                      color: SpecEngine.getTextStyle('tertiary', 1).color,
                      borderRadius: `${RADIUS.chip}px`,
                    }}
                  >
                    ESC
                  </span>
                </div>
              </div>

              {/* Segmented Controller (Surface 2 #0A0B0F · Concentric Radius 16px) */}
              <div
                className="p-1 flex"
                style={{
                  ...panelStyle.style,
                  borderRadius: `${RADIUS.card}px`,
                }}
              >
                {[
                  { id: 'node-alpha', label: 'Primary Node' },
                  { id: 'node-beta', label: 'Replica' },
                  { id: 'node-gamma', label: 'Failover' },
                ].map((seg) => {
                  const isSel = selectedSegment === seg.id;
                  const segStyle = SpecEngine.style({
                    surfaceLevel: isSel ? 3 : 2,
                    interactive: true,
                  });
                  return (
                    <button
                      key={seg.id}
                      onClick={() => setSelectedSegment(seg.id)}
                      className="flex-1 py-1.5 text-[11px] font-mono transition-all cursor-pointer"
                      style={{
                        background: isSel ? segStyle.style.background : 'transparent',
                        border: isSel ? segStyle.style.border : 'none',
                        color: isSel
                          ? SpecEngine.getTextStyle('primary', 3).color
                          : SpecEngine.getTextStyle('secondary', 2).color,
                        fontWeight: isSel ? 600 : 400,
                        borderRadius: `${LiminalLayoutEngine.getConcentricRadius(RADIUS.card, 2)}px`,
                      }}
                    >
                      {seg.label}
                    </button>
                  );
                })}
              </div>

              {/* Telemetry Metrics Grid (Cohesive Gap 8px) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className="p-3 space-y-1"
                  style={{
                    ...panelStyle.style,
                    borderRadius: `${RADIUS.card}px`,
                  }}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}>LATENCY</span>
                    <Radio className="w-3 h-3 text-[#34C08B]" />
                  </div>
                  <div
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(3),
                      color: SpecEngine.getTextStyle('primary', 2).color,
                      fontWeight: 600,
                    }}
                  >
                    4.2 ms
                  </div>
                  <div className="text-[9px] text-[#34C08B]">Zero jitter</div>
                </div>

                <div
                  className="p-3 space-y-1"
                  style={{
                    ...panelStyle.style,
                    borderRadius: `${RADIUS.card}px`,
                  }}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}>UPTIME</span>
                    <Wifi className="w-3 h-3 text-[#6FA8EC]" />
                  </div>
                  <div
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(3),
                      color: SpecEngine.getTextStyle('primary', 2).color,
                      fontWeight: 600,
                    }}
                  >
                    99.998%
                  </div>
                  <div
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(1),
                      color: SpecEngine.getTextStyle('tertiary', 2).color,
                    }}
                  >
                    314 days uninterrupted
                  </div>
                </div>
              </div>

              {/* Featured Elevation E2 Card (Sub-Canvas Shadow E2) */}
              <div
                className="p-3.5 space-y-2 transition-all"
                style={{
                  ...featuredComputed.style,
                  borderRadius: `${RADIUS.panel}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E9B44C]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>E2 SUB-CANVAS POPULAR ACTION</span>
                  </div>
                  <span
                    style={{
                      ...LiminalLayoutEngine.getTypeStyle(1),
                      color: SpecEngine.getTextStyle('tertiary', 4).color,
                    }}
                  >
                    H230 Sapphire
                  </span>
                </div>

                <div
                  style={{
                    ...LiminalLayoutEngine.getTypeStyle(2),
                    color: SpecEngine.getTextStyle('primary', 4).color,
                    fontWeight: 500,
                  }}
                >
                  Zero-Knowledge Liminal Token Verification
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setBottomDrawerOpen(true)}
                    className="px-3 py-1.5 text-[11px] font-mono cursor-pointer flex items-center gap-1 transition-all"
                    style={{
                      ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                      borderRadius: `${RADIUS.control}px`,
                      color: SpecEngine.getTextStyle('primary', 3).color,
                    }}
                  >
                    <span>Inspect Layer</span>
                    <Maximize2 className="w-3 h-3 ml-0.5" />
                  </button>

                  <button
                    onClick={triggerToast}
                    className="px-3.5 py-1.5 text-[11px] font-mono font-bold transition-all cursor-pointer"
                    style={{
                      backgroundColor: brand.hex,
                      color: brand.onColor,
                      borderRadius: `${RADIUS.control}px`,
                    }}
                  >
                    Authorize Key
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerToast()}
                  className="px-3 py-2 text-xs font-mono cursor-pointer transition-all"
                  style={{
                    borderRadius: `${RADIUS.control}px`,
                    color: SpecEngine.getTextStyle('secondary', 1).color,
                  }}
                >
                  Dismiss
                </button>

                <button
                  type="button"
                  onClick={() => setBottomDrawerOpen(true)}
                  className="px-4 py-2 text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                    borderRadius: `${RADIUS.control}px`,
                    color: SpecEngine.getTextStyle('primary', 3).color,
                  }}
                >
                  <span>Open Drawer</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ATOMS KIT DEMO ─── */}
        {activeTab === 'atoms' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <AtomsDemo />
          </div>
        )}

        {/* ─── TAB: INPUTS KIT DEMO ─── */}
        {activeTab === 'inputs' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <InputsDemo />
          </div>
        )}

        {/* ─── TAB: CONTAINERS KIT DEMO ─── */}
        {activeTab === 'containers' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <ContainersDemo />
          </div>
        )}

        {/* ─── TAB: NAVIGATION KIT DEMO ─── */}
        {activeTab === 'nav' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <NavDemo />
          </div>
        )}

        {/* ─── TAB: DATA KIT DEMO ─── */}
        {activeTab === 'data' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <DataDemo />
          </div>
        )}

        {/* ─── TAB: FEEDBACK KIT DEMO ─── */}
        {activeTab === 'feedback' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <FeedbackDemo />
          </div>
        )}

        {/* ─── TAB 2: PHYSICAL STATES & GEOMETRY BENCH ─── */}
        {activeTab === 'bench' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Interactive Physical States Tester */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#34C08B]" />
                  <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                    LIMINAL STATES v1.0 [APPROVED]
                  </span>
                </div>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>~JND Engine</span>
              </div>

              {/* State Selector Buttons */}
              <div
                className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1"
                style={{ ...panelStyle.style, borderRadius: `${RADIUS.card}px` }}
              >
                {(
                  [
                    { id: 'idle', label: '1. Idle', desc: '#0A0B0F · Rim 2' },
                    { id: 'hover', label: '2. Hover', desc: '+0.5Δ (#0B0C10) · Rim 2' },
                    { id: 'focus', label: '3. Focus', desc: '+0.5Δ · Rim 3 · 2px Ring' },
                    { id: 'active', label: '4. Active', desc: '−0.5Δ · CONCAVE Rim' },
                    { id: 'disabled', label: '5. Disabled', desc: 'Rim 0 · bg→cont · α.25' },
                  ] as const
                ).map((s) => {
                  const isSel = interactiveState === s.id;
                  const itemStyle = isSel
                    ? SpecEngine.style({ surfaceLevel: 3, interactive: true })
                    : SpecEngine.style({ surfaceLevel: 2, interactive: true });

                  return (
                    <button
                      key={s.id}
                      onClick={() => setInteractiveState(s.id)}
                      className="p-2 text-left transition-all cursor-pointer"
                      style={{
                        background: isSel ? itemStyle.style.background : 'transparent',
                        border: isSel ? itemStyle.style.border : 'none',
                        color: isSel
                          ? SpecEngine.getTextStyle('primary', 3).color
                          : SpecEngine.getTextStyle('secondary', 2).color,
                        borderRadius: `${RADIUS.control}px`,
                      }}
                    >
                      <div className="text-[11px] leading-tight font-semibold">{s.label}</div>
                      <div
                        className="text-[8px] truncate mt-0.5"
                        style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
                      >
                        {s.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* State Interactive Specimen */}
              <div
                className="p-4 space-y-2"
                style={{ ...panelStyle.style, borderRadius: `${RADIUS.card}px` }}
              >
                <div
                  className="text-[10px] uppercase font-bold"
                  style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
                >
                  Inspected Component on Surface 2
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: SpecEngine.getTextStyle('primary', 2).color }}
                >
                  State: {interactiveState.toUpperCase()} · Color: {playgroundComputed.bg} · Rim {playgroundComputed.rimLevel} {playgroundComputed.isConcave ? '(CONCAVE INVERTED)' : ''}
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    className="w-full sm:w-auto px-6 py-3 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      ...playgroundComputed.style,
                      borderRadius: `${RADIUS.control}px`,
                      color: SpecEngine.getTextStyle('primary', 2).color,
                    }}
                    onMouseDown={() => setInteractiveState('active')}
                    onMouseUp={() => setInteractiveState('hover')}
                    onTouchStart={() => setInteractiveState('active')}
                    onTouchEnd={() => setInteractiveState('idle')}
                    onMouseEnter={() => setInteractiveState('hover')}
                    onMouseLeave={() => setInteractiveState('idle')}
                  >
                    <MousePointer className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>TOUCH &amp; HOLD FOR ACTIVE CONCAVE</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Concentric Geometry & Spacing Lab */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <div className="flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-[#60a5fa]" />
                  <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                    CONCENTRIC HARMONY LAB
                  </span>
                </div>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
                  r_inner = max(4, r_outer − padding)
                </span>
              </div>

              {/* Slider Controls */}
              <div
                className="p-3 flex items-center justify-between"
                style={{ ...panelStyle.style, borderRadius: `${RADIUS.card}px` }}
              >
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: SpecEngine.getTextStyle('primary', 2).color }}
                  >
                    Outer Radius: {rOuterDemo}px
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
                  >
                    Padding: {concentricPadding}px $\to$ Inner: {rInnerDemo}px
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="2"
                    value={concentricPadding}
                    onChange={(e) => setConcentricPadding(Number(e.target.value))}
                    className="w-24 accent-[#60a5fa] cursor-pointer"
                  />
                  <span
                    className="text-xs font-bold w-6"
                    style={{ color: SpecEngine.getTextStyle('primary', 2).color }}
                  >
                    {concentricPadding}px
                  </span>
                </div>
              </div>

              {/* Visual Demo */}
              <div
                className="w-full h-28 flex items-center justify-center transition-all"
                style={{
                  ...SpecEngine.style({ surfaceLevel: 1, isContainer: true }).style,
                  borderRadius: `${rOuterDemo}px`,
                  padding: `${concentricPadding}px`,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-all font-mono text-[11px]"
                  style={{
                    ...SpecEngine.style({ surfaceLevel: 2, isContainer: true }).style,
                    borderRadius: `${rInnerDemo}px`,
                    color: SpecEngine.getTextStyle('primary', 2).color,
                  }}
                >
                  Parallel Curves (No Wobble) · r_inner = {rInnerDemo}px
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: COLOR CONTRACT & TYPOGRAPHY ─── */}
        {activeTab === 'tokens' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Semantic Set (4 Roles) */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                  SEMANTIC CONTRACT (4 ROLES)
                </span>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
                  Subtle / Border / Text / Solid
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).map((key) => {
                  const role = semantics[key];
                  return (
                    <div
                      key={key}
                      className="p-3 space-y-2.5"
                      style={{
                        ...panelStyle.style,
                        borderRadius: `${RADIUS.card}px`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: role.text }}>
                          {key === 'SUCCESS' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {key === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {key === 'DANGER' && <XCircle className="w-3.5 h-3.5" />}
                          {key === 'INFO' && <Info className="w-3.5 h-3.5" />}
                          <span>{key}</span>
                        </div>

                        <button
                          className="px-2.5 py-1 text-[10px] font-bold font-mono transition-all"
                          style={{
                            backgroundColor: role.solid,
                            color: role.onSolid,
                            borderRadius: `${RADIUS.chip}px`,
                          }}
                        >
                          Solid Action
                        </button>
                      </div>

                      <div
                        className="p-2 flex items-center justify-between text-[10px]"
                        style={{
                          backgroundColor: role.subtle,
                          border: `1px solid ${role.border}`,
                          color: role.text,
                          borderRadius: `${RADIUS.chip}px`,
                        }}
                      >
                        <span>Subtle 10% + Border 22%</span>
                        <span
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase"
                          style={{
                            backgroundColor: role.border,
                            borderRadius: `${RADIUS.full}px`,
                          }}
                        >
                          Pill Badge
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extended Spectrum 12 Hues */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                  EXTENDED SPECTRUM (12 HUES)
                </span>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
                  Chroma Compensated
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {spectrum.map((item) => (
                  <button
                    key={item.hue}
                    onClick={() => setSelectedHue(item.hue)}
                    className="p-2 text-left transition-all cursor-pointer"
                    style={{
                      ...panelStyle.style,
                      borderRadius: `${RADIUS.chip}px`,
                      outline: selectedHue === item.hue ? `2px solid ${item.hex}` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.hex }}></span>
                      <span className="font-bold text-[10px]" style={{ color: item.hex }}>
                        H{item.hue}
                      </span>
                    </div>
                    <div
                      className="text-[9px] font-mono mt-0.5"
                      style={{ color: SpecEngine.getTextStyle('secondary', 2).color }}
                    >
                      {item.hex}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Scale Preview (1.2 Modular) */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                  TYPOGRAPHY SCALE (RATIO 1.2)
                </span>
                <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
                  Base 16 · Weights 400..700
                </span>
              </div>

              <div className="space-y-2 font-sans">
                {[
                  { level: 7, label: '33px Display', text: 'Liminal Architecture' },
                  { level: 5, label: '23px Heading 3', text: 'Perceptual Boundary Limen' },
                  { level: 3, label: '16px Body Copy', text: 'Each layer on the threshold of perception — neither less, nor more.' },
                  { level: 1, label: '11px Meta / Caption', text: 'ΔL = 0.015 · OKLCH Hue 270° · Concentric Curves' },
                ].map((item) => {
                  const style = LiminalLayoutEngine.getTypeStyle(item.level as any);
                  return (
                    <div
                      key={item.level}
                      className="p-2.5"
                      style={{ ...panelStyle.style, borderRadius: `${RADIUS.card}px` }}
                    >
                      <div
                        className="text-[9px] font-mono mb-0.5"
                        style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          ...style,
                          color: SpecEngine.getTextStyle('primary', 2).color,
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: MASTER CONTRACT & HARD RULES CHECKLIST ─── */}
        {activeTab === 'contract' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Hard Rules Checklist Card */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34C08B]" />
                  <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                    HARD RULES CHECKLIST (100% COMPLIANT)
                  </span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] bg-[#04140D] text-[#6EE0B4] border border-[#34C08B]/30 rounded">
                  ALL PASS ✅
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                {[
                  'ΔL never <0.012 or >0.020 ; dark ceiling L0.203 ; rim ceiling Rim3',
                  'border = directional ladder gradient only (no external/white border-color)',
                  'shadow = sub-canvas dual-layer (S-1/S-2), floating/featured only',
                  'text never pure white ; Q non-critical only ; T/Q surface-compensated',
                  'spacing cohesive ≤12 separating ≥16 atom 4 ; radius size-mapped + concentric',
                  'type ratio 1.2 weight ≤700 ; warm hues lower chroma (anti-neon)',
                  'all chromatic color on dark canvas only ; brand primary = Soft White #E9ECF2',
                  'Glass هرگز tint پس‌زمینه یا border تخت رنگی ندارد',
                  'سقف بودجه‌ی شیشه رعایت شود (نئون ممنوع)',
                  'pill مجاز برای: badge · toggle · Glass CTA',
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 flex items-start gap-2 rounded-lg"
                    style={{ ...panelStyle.style, borderRadius: `${RADIUS.control}px` }}
                  >
                    <Check className="w-3.5 h-3.5 text-[#34C08B] shrink-0 mt-0.5" />
                    <span style={{ color: SpecEngine.getTextStyle('primary', 2).color }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbatim Master Contract Viewer */}
            <div
              className="p-4 sm:p-5 space-y-3 font-mono text-xs"
              style={{
                ...containerStyle.style,
                borderRadius: `${RADIUS.container}px`,
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#8B9CF0]" />
                  <span className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
                    MASTER CONTRACT v1.0 (VERBATIM TEXT)
                  </span>
                </div>

                <button
                  onClick={copyFullContract}
                  className="px-2.5 py-1 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                  style={{
                    ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                    borderRadius: `${RADIUS.chip}px`,
                    color: SpecEngine.getTextStyle('primary', 3).color,
                  }}
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Contract</span>
                </button>
              </div>

              <div
                className="p-3 text-[10px] font-mono space-y-2 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed"
                style={{
                  ...panelStyle.style,
                  borderRadius: `${RADIUS.card}px`,
                  color: SpecEngine.getTextStyle('secondary', 2).color,
                }}
              >
                <p className="text-[#6EE0B4] font-bold">
                  LIMINAL · DESIGN SYSTEM — MASTER CONTRACT v1.0 (COMPLETE)
                </p>
                <p className="italic">«هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر.»</p>
                <p>0) CORE CONSTANTS: OKLCH, Canvas L0: 0.128, ΔL: 0.015, Hue 270°, Base Chroma 0.008, Decay 2.5, JND 0.008.</p>
                <p>1) TONAL LADDER: S0 #060709, S1 #08090C, S2 #0A0B0F, S3 #0D0E12, S4 #101115, S5 #131418. Sub-canvas: S-1 #030406, S-2 #010203.</p>
                <p>2) DIRECTIONAL RIM: 180° Top &gt; Side 55% &gt; Bottom, 1px specular gradient, Rim 0..3.</p>
                <p>3) SUB-CANVAS SHADOW: E1..E4 dual layer ambient (#030406) + contact (#010203), floating only.</p>
                <p>4) STATES: Hover +0.5Δ bg, Focus +0.5Δ bg + Rim 3 + 2px outline ladder(n+1), Active −0.5Δ bg + CONCAVE rim + translateY(0.5px), Disabled α.25.</p>
                <p>5) TEXT: Primary α0.88, Secondary α0.62, Tertiary α0.40, Quaternary α0.25. Surface compensation on S2/S3/S4/S5.</p>
                <p>6) COLOR: Ramp base=oklch(0.78, C_text, H), Semantics Success/Warning/Danger/Info, 12 Extended Hues, Brand Soft White #E9ECF2.</p>
                <p>7) SPACING/RADIUS/TYPE: Atom 4px, Cohesive ≤12, Separating ≥16. Radius chip 6, control 10, card 16, panel 20, container 24, r_inner = max(4, r_outer − padding). Type modular 1.2 ratio (11 to 40px), weights 400..700.</p>
                <p className="text-[#8B9CF0] font-bold">۱۱) LIMINAL GLASS (ساختار ۵ لایه)</p>
                <p>لایه‌ها: 1 halo (box-shadow بیرونی بودجه‌بندی‌شده) · 2 edge 1px (گرادیان جهت‌دار border-box: top &gt; bottom &gt; side) · 3 refraction (ضخامت شیشه: inset shadow بالا/پایین) · 4 surface (گرادیان خنثی نردبان padding-box) · 5 signal (آیکون/متن semantic = تنها سیگنال تیز).</p>
                <p>ترتیب نور Glass: top &gt; bottom &gt; side (شکست نور) — استثنا از ترتیب convex. ترتیب نور Rim جامد: top &gt; side &gt; bottom (بدون تغییر).</p>
                <p>بودجه‌ی شیشه: cta/Featured: edge .65/.40/.50 · refr .30/.22 · halo .14/.16 | inline(Alert): edge .45/.26/.34 · refr .20/.14 · halo .08/.10.</p>
                <p>مجاز فقط برای: CTA اصلی (حداکثر ۱ در نما) · Alert · کارت Featured · Toast (شناور). Tooltip خنثی است (بدون hue) — فقط rim و سایه.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── FLOATING TOAST (Elevation E4 Sub-Canvas Shadow) ─── */}
        {toastVisible && (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-3.5 z-50 flex items-center justify-between font-mono text-xs animate-in slide-in-from-bottom-5 duration-200"
            style={{
              ...toastComputed.style,
              borderRadius: `${RADIUS.card}px`,
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34C08B]" />
              <div>
                <div
                  className="text-xs font-bold"
                  style={{ color: SpecEngine.getTextStyle('primary', 4).color }}
                >
                  Key Rotation Successful
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: SpecEngine.getTextStyle('tertiary', 4).color }}
                >
                  Elevation E4 Sub-Canvas Anchor
                </div>
              </div>
            </div>
            <button
              onClick={() => setToastVisible(false)}
              className="p-1 rounded-md cursor-pointer"
              style={{ color: SpecEngine.getTextStyle('tertiary', 4).color }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── MOBILE BOTTOM DRAWER / MODAL (Surface 5 Overlay · Elevation E3 Shadow) ─── */}
        {bottomDrawerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div
              className="w-full sm:max-w-md p-5 sm:p-6 space-y-4 font-mono text-xs animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
              style={{
                ...modalComputed.style,
                borderTopLeftRadius: `${RADIUS.container}px`,
                borderTopRightRadius: `${RADIUS.container}px`,
                borderBottomLeftRadius: `${RADIUS.container}px`,
                borderBottomRightRadius: `${RADIUS.container}px`,
              }}
            >
              {/* Drawer Handle for Touch cue */}
              <div
                className="w-10 h-1 rounded-full mx-auto sm:hidden -mt-1 mb-2"
                style={{ backgroundColor: neutrals.L5.hex }}
              ></div>

              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: `1px solid ${neutrals.L4.hex}` }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#34C08B]" />
                  <span
                    className="font-bold"
                    style={{ color: SpecEngine.getTextStyle('primary', 5).color }}
                  >
                    S5 Overlay · E3 Shadow Drawer
                  </span>
                </div>
                <button
                  onClick={() => setBottomDrawerOpen(false)}
                  className="p-1 cursor-pointer"
                  style={{ color: SpecEngine.getTextStyle('tertiary', 5).color }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="space-y-2 leading-relaxed text-[11px]"
                style={{ color: SpecEngine.getTextStyle('secondary', 5).color }}
              >
                <p>
                  This mobile-first bottom drawer executes <strong style={{ color: SpecEngine.getTextStyle('primary', 5).color }}>Surface 5 (Overlay)</strong> with Modal Radius ({RADIUS.panel}px) and Rim 3 directional gradient.
                </p>
                <div
                  className="p-2.5 rounded-lg text-[10px] space-y-1"
                  style={panelStyle.style}
                >
                  <div
                    className="font-bold"
                    style={{ color: SpecEngine.getTextStyle('primary', 2).color }}
                  >
                    Sub-Canvas E3 Anchor Shadow:
                  </div>
                  <code className="text-[#A5B4FC]">
                    0 8px 28px rgba(3,4,6,0.44), 0 3px 8px rgba(1,2,3,0.30)
                  </code>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setBottomDrawerOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-mono font-semibold cursor-pointer"
                  style={{
                    ...SpecEngine.style({ surfaceLevel: 3, interactive: true }).style,
                    borderRadius: `${RADIUS.control}px`,
                    color: SpecEngine.getTextStyle('primary', 3).color,
                  }}
                >
                  Acknowledge &amp; Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className="text-center text-[10px] font-mono pt-2 pb-8"
          style={{ color: SpecEngine.getTextStyle('quaternary', 0).color }}
        >
          LIMINAL v1.0 MOBILE-FIRST TESTBENCH · 100% RESPONSIVE · STRICTLY LOCKED SPEC
        </footer>
      </main>
    </div>
  );
}

export default App;
