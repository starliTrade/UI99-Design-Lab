import React from 'react';
import { Button } from '../atoms/Button/Button';
import { Badge } from '../atoms/Badge/Badge';
import { Tag } from '../atoms/Tag/Tag';
import { Toggle } from '../atoms/Toggle/Toggle';
import { Mist } from '../atoms/Mist/Mist';
import { Input } from '../inputs/Input/Input';
import { Textarea } from '../inputs/Textarea/Textarea';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Radio } from '../inputs/Radio/Radio';
import { Select } from '../inputs/Select/Select';
import { Card } from '../containers/Card/Card';
import { Panel } from '../containers/Panel/Panel';
import { Divider } from '../containers/Divider/Divider';
import { Avatar } from '../data/Avatar/Avatar';
import { Stat } from '../data/Stat/Stat';
import { Progress } from '../data/Progress/Progress';
import { Alert } from '../feedback/Alert/Alert';
import { Skeleton } from '../composites/Skeleton/Skeleton';
import { EmptyState } from '../composites/EmptyState/EmptyState';
import { Pagination } from '../data/Pagination/Pagination';
import { NavItem } from '../nav/NavItem/NavItem';
import { Breadcrumb } from '../nav/Breadcrumb/Breadcrumb';
import { Modal } from '../containers/Modal/Modal';
import { Sheet } from '../containers/Sheet/Sheet';
import { Toast } from '../feedback/Toast/Toast';
import { SimpleTooltip } from '../feedback/Tooltip/SimpleTooltip';
import { Combobox } from '../inputs/Combobox/Combobox';
import { MultiSelect } from '../inputs/MultiSelect/MultiSelect';
import { CommandPalette } from '../nav/CommandPalette/CommandPalette';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../data/Table';
import { Calendar } from '../data/Calendar/Calendar';
import { FilterBar } from '../data/FilterBar/FilterBar';
import { AppShell } from '../layout/AppShell/AppShell';
import { Footer } from '../layout/Footer/Footer';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import { PageSection } from '../layout/PageSection/PageSection';
import { Grid, GridCol } from '../layout/Grid/Grid';
import { Sidebar } from '../nav/Sidebar/Sidebar';
import { Topbar } from '../nav/Topbar/Topbar';
import { ErrorPage } from '../composites/ErrorPage/ErrorPage';
import { FormLayout } from '../composites/FormLayout/FormLayout';
import { Form, Field } from '../composites/Form/Form';

/**
 * THE COMPONENT MATRIX
 * «یک کامپوننت با یک اندازه، یک کامپوننت نیست — یک نمونه است.»
 *
 * One table, and three things come out of it: the eye-test page, the a11y
 * sweep, and a COVERAGE report that says what is missing. The third is the
 * point — the roadmap lists what to build; this lists what is actually absent,
 * read from the code.
 *
 * Adding a component is adding a row. Not three places.
 */

export interface ComponentFixture {
  /** The component's name, as a consumer would say it. */
  name: string;
  /** The category, for grouping on the page. */
  group: string;
  /** The sizes the component actually supports. Empty means it has none. */
  sizes: string[];
  /** The states it actually supports. */
  states: string[];
  /** The states the system expects every interactive component to have. */
  expected: string[];
  /** One rendered example per state. */
  render: (state: string, size?: string) => React.ReactElement;
}

const noop = () => {};

/** The states every interactive component should have. */
const INTERACTIVE = ['default', 'hover', 'focus', 'disabled'];
const INPUT_STATES = [...INTERACTIVE, 'error', 'readonly'];
const FEEDBACK_STATES = ['info', 'success', 'warning', 'danger'];

export const FIXTURES: ComponentFixture[] = [
  {
    name: 'Button', group: 'اتم‌ها', sizes: ['sm', 'md', 'lg'], states: INTERACTIVE, expected: INTERACTIVE,
    render: (state, size) => (
      <Button size={(size ?? 'md') as 'sm'} disabled={state === 'disabled'} variant="primary">
        {state === 'default' ? 'دکمه' : state}
      </Button>
    ),
  },
  {
    name: 'Input', group: 'ورودی‌ها', sizes: ['sm', 'md', 'lg'], states: INPUT_STATES, expected: INPUT_STATES,
    render: (state, size) => (
      <Input
        size={(size ?? 'md') as 'sm'}
        label="نام کاربری"
        // `hint` is not an Input prop — it lives on `Field`. Recorded rather
        // than worked around: an input that cannot say what it wants is a gap.
        helperText={state === 'error' ? undefined : '۳ تا ۲۰ کاراکتر'}
        error={state === 'error' ? 'این نام قبلاً گرفته شده' : undefined}
        disabled={state === 'disabled'}
        readOnly={state === 'readonly'}
        defaultValue={state === 'default' ? '' : 'starli'}
      />
    ),
  },
  {
    name: 'Textarea', group: 'ورودی‌ها', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Textarea
        label="درباره"
        error={state === 'error' ? 'حداکثر ۲۰۰ کاراکتر' : undefined}
        disabled={state === 'disabled'}
        rows={2}
      />
    ),
  },
  {
    name: 'Select', group: 'ورودی‌ها', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Select
        label="مسیر"
        options={[{ value: 'a', label: 'تهران' }, { value: 'b', label: 'شیراز' }]}
        error={state === 'error' ? 'یک مسیر انتخاب کن' : undefined}
        disabled={state === 'disabled'}
      />
    ),
  },
  {
    name: 'Checkbox', group: 'ورودی‌ها', sizes: [], states: ['default', 'checked', 'disabled'], expected: INTERACTIVE,
    render: (state) => (
      <Checkbox checked={state === 'checked'} disabled={state === 'disabled'} onChange={noop} label="می‌پذیرم" />
    ),
  },
  {
    name: 'Radio', group: 'ورودی‌ها', sizes: [], states: ['default', 'checked', 'disabled'], expected: INTERACTIVE,
    render: (state) => (
      <Radio checked={state === 'checked'} disabled={state === 'disabled'} onChange={noop} name="m" value="a" label="گزینه" />
    ),
  },
  {
    name: 'Toggle', group: 'اتم‌ها', sizes: [], states: ['off', 'on', 'disabled'], expected: INTERACTIVE,
    render: (state) => (
      <Toggle checked={state === 'on'} disabled={state === 'disabled'} onChange={noop} aria-label="فعال" />
    ),
  },
  {
    name: 'Badge', group: 'اتم‌ها', sizes: [], states: ['neutral', 'success', 'warning', 'danger', 'info'], expected: [],
    render: (state) => <Badge semantic={state === 'neutral' ? undefined : (state as 'success')}>برچسب</Badge>,
  },
  {
    name: 'Tag', group: 'اتم‌ها', sizes: [], states: ['default'], expected: [],
    render: () => <Tag>طراحی</Tag>,
  },
  {
    name: 'Alert', group: 'بازخورد', sizes: [], states: FEEDBACK_STATES, expected: FEEDBACK_STATES,
    render: (state) => (
      <Alert semantic={state as 'info'} title={state} onClose={noop}>پیام</Alert>
    ),
  },
  {
    name: 'Progress', group: 'داده', sizes: ['sm', 'md', 'lg'], states: ['default', 'success', 'warning', 'danger'], expected: [],
    render: (state, size) => (
      <Progress value={62} label="آپلود" size={(size ?? 'md') as 'sm'} semantic={state === 'default' ? undefined : (state as 'success')} />
    ),
  },
  {
    name: 'Avatar', group: 'داده', // Avatar has three sizes, not the icon engine's five. Recorded as-is.
    sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Avatar name="Starli Trade" size={(size ?? 'md') as 'md'} />,
  },
  {
    name: 'Stat', group: 'داده', sizes: [], states: ['default'], expected: [],
    render: () => <Stat label="درخواست‌ها" value="۱٬۲۰۴" />,
  },
  {
    name: 'Card', group: 'ظرف‌ها', sizes: [], states: ['default'], expected: [],
    render: () => <Card>محتوای کارت</Card>,
  },
  {
    name: 'Panel', group: 'ظرف‌ها', sizes: [], states: ['default'], expected: [],
    render: () => <Panel title="پنل">محتوا</Panel>,
  },
  {
    name: 'Divider', group: 'ظرف‌ها', sizes: [], states: ['default'], expected: [],
    render: () => <div style={{ width: 200 }}><Divider /></div>,
  },
  {
    name: 'Skeleton', group: 'کمکی', sizes: [], states: ['text', 'circle', 'rect'], expected: [],
    render: (state) => <Skeleton variant={state as 'text'} width={160} />,
  },
  {
    name: 'EmptyState', group: 'کمکی', sizes: [], states: ['default'], expected: [],
    render: () => <EmptyState title="چیزی نیست" />,
  },
  {
    name: 'Mist', group: 'اتم‌ها', sizes: [], states: ['default'], expected: [],
    render: () => <Mist aria-label="شناور">مه</Mist>,
  },
  {
    name: 'Pagination', group: 'داده', sizes: [], states: ['default'], expected: INTERACTIVE,
    // Pagination has no `disabled` prop — recorded as a gap rather than faked.
    render: () => <Pagination currentPage={2} totalPages={5} onPageChange={noop} />,
  },
  {
    name: 'NavItem', group: 'ناوبری', sizes: [], states: ['default', 'active', 'disabled'], expected: INTERACTIVE,
    render: (state) => <NavItem active={state === 'active'} disabled={state === 'disabled'}>داشبورد</NavItem>,
  },
  {
    name: 'Breadcrumb', group: 'ناوبری', sizes: [], states: ['default'], expected: [],
    render: () => <Breadcrumb items={[{ label: 'خانه', href: '/' }, { label: 'پروژه' }]} />,
  },
  // ── the rest of the library ──────────────────────────────────────────────
  {
    name: 'Modal', group: 'ظرف‌ها', sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Modal open title="گفت‌وگو" size={(size ?? 'md') as 'sm'} onClose={noop}>محتوا</Modal>,
  },
  {
    name: 'Sheet', group: 'ظرف‌ها', sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Sheet open title="کشو" size={(size ?? 'md') as 'sm'} onClose={noop}>محتوا</Sheet>,
  },
  {
    name: 'Toast', group: 'بازخورد', sizes: [], states: FEEDBACK_STATES, expected: FEEDBACK_STATES,
    render: (state) => <Toast open title={state} message="پیام" semantic={state as 'info'} onClose={noop} />,
  },
  {
    name: 'SimpleTooltip', group: 'بازخورد', sizes: [], states: ['default'], expected: [],
    render: () => <SimpleTooltip content="راهنما"><Button>نگه‌دار</Button></SimpleTooltip>,
  },
  {
    name: 'Combobox', group: 'ورودی‌ها', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Combobox label="شهر" options={[{ value: 'a', label: 'تهران' }]} onChange={noop}
        error={state === 'error' ? 'انتخاب کن' : undefined} disabled={state === 'disabled'} />
    ),
  },
  {
    name: 'MultiSelect', group: 'ورودی‌ها', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <MultiSelect label="برچسب‌ها" options={[{ value: 'a', label: 'طراحی' }]} onChange={noop}
        error={state === 'error' ? 'یکی انتخاب کن' : undefined} disabled={state === 'disabled'} />
    ),
  },
  {
    name: 'CommandPalette', group: 'ناوبری', sizes: [], states: ['default'], expected: [],
    render: () => <CommandPalette isOpen onClose={noop} groups={[{ title: 'دستورها', items: [{ id: 'a', label: 'ذخیره', action: noop }] }]} />,
  },
  {
    name: 'Table', group: 'داده', sizes: [], states: ['default'], expected: [],
    render: () => (
      <Table>
        <TableHeader><TableRow><TableHead>نام</TableHead><TableHead>وضعیت</TableHead></TableRow></TableHeader>
        <tbody><TableRow><TableCell>ستارلی</TableCell><TableCell>فعال</TableCell></TableRow></tbody>
      </Table>
    ),
  },
  {
    name: 'Calendar', group: 'داده', sizes: [], states: ['gregorian', 'jalali'], expected: [],
    render: (state) => state === 'jalali'
      ? <Calendar calendar="jalali" lang="fa" month={new Date(Date.UTC(2026, 9, 1))} />
      : <Calendar month={new Date(Date.UTC(2026, 9, 1))} />,
  },
  {
    name: 'FilterBar', group: 'داده', sizes: [], states: ['empty', 'active'], expected: [],
    render: (state) => (
      <FilterBar activeFilters={state === 'active' ? [{ id: 'a', label: 'فعال', value: 'x' }] : []} onRemoveFilter={noop} onClearAll={noop}>
        <span />
      </FilterBar>
    ),
  },
  {
    name: 'AppShell', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <AppShell><span>محتوا</span></AppShell>,
  },
  {
    name: 'Sidebar', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <Sidebar><NavItem>داشبورد</NavItem></Sidebar>,
  },
  {
    name: 'Topbar', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <Topbar logo={<span>LIMINAL</span>} />,
  },
  {
    name: 'Footer', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <Footer />,
  },
  {
    name: 'PageHeader', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <PageHeader title="صفحه" />,
  },
  {
    name: 'PageSection', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <PageSection title="بخش">محتوا</PageSection>,
  },
  {
    name: 'Grid', group: 'چیدمان', sizes: [], states: ['default'], expected: [],
    render: () => <Grid><GridCol col={6}>نیمه</GridCol><GridCol col={6}>نیمه</GridCol></Grid>,
  },
  {
    name: 'ErrorPage', group: 'کمکی', sizes: [], states: ['default'], expected: [],
    render: () => <ErrorPage code="۴۰۴" title="پیدا نشد" />,
  },
  {
    name: 'FormLayout', group: 'کمکی', sizes: [], states: ['default'], expected: [],
    render: () => <FormLayout><FormLayout.Section title="بخش"><FormLayout.Field label="فیلد"><Input /></FormLayout.Field></FormLayout.Section></FormLayout>,
  },
  {
    name: 'Form', group: 'کمکی', sizes: [], states: ['default', 'error'], expected: [],
    render: (state) => (
      <Form validators={{ n: (v) => (String(v ?? '').trim() ? undefined : 'لازم است') }}>
        <Field name="n" label="نام" required hint={state === 'error' ? undefined : 'نام کامل'}><Input /></Field>
      </Form>
    ),
  },
];

/** What a component has, out of what it should have. */
export function coverage(f: ComponentFixture): number {
  const expected = f.expected.length ? f.expected : f.states;
  if (!expected.length) return 1;
  const have = expected.filter((s) => f.states.includes(s)).length;
  const sizePart = f.sizes.length ? 1 : 0;
  // Sizes count only for components the system expects to have them.
  const sizeExpected = ['Button', 'Input', 'Select', 'Textarea', 'Toggle', 'Checkbox', 'Radio'].includes(f.name);
  const total = expected.length + (sizeExpected ? 1 : 0);
  const got = have + (sizeExpected ? sizePart : 0);
  return got / total;
}
