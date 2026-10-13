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
