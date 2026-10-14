import React from 'react';
import { Button } from '../atoms/Button/Button';
import { Badge } from '../atoms/Badge/Badge';
import { Tag } from '../atoms/Tag/Tag';
import { Toggle } from '../atoms/Toggle/Toggle';
import { Mist } from '../atoms/Mist/Mist';
import { Input } from '../inputs/Input/Input';
import { Textarea } from '../inputs/Textarea/Textarea';
import { Slider } from '../inputs/Slider/Slider';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Radio } from '../inputs/Radio/Radio';
import { Select } from '../inputs/Select/Select';
import { Card } from '../containers/Card/Card';
import { Panel } from '../containers/Panel/Panel';
import { Divider } from '../containers/Divider/Divider';
import { Popover } from '../containers/Popover/Popover';
import { HoverCard } from '../containers/HoverCard/HoverCard';
import { Drawer } from '../containers/Drawer/Drawer';
import { AlertDialog } from '../feedback/AlertDialog/AlertDialog';
import { DatePicker } from '../data/Calendar/DatePicker';
import { AvatarGroup } from '../data/AvatarGroup/AvatarGroup';
import { Tabs } from '../nav/Tabs/Tabs';
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
  /**
   * WHICH KIND OF THING IT IS.
   *
   * WHICH KIND OF THING IT IS, and therefore which criteria apply.
   *
   *   input    something the reader types into or picks with.
   *            size · variant · disabled · error
   *   action   something the reader presses.
   *            size · variant · disabled — an `error` on a Button is a prop
   *            with no meaning, and demanding one pushes components to invent it
   *   surface  a container. role · tokens · fixture
   *
   * Defaults to 'surface', so only the controls have to say so.
   */
  kind?: 'input' | 'action' | 'surface';
  /** The category, for grouping on the page. */
  group: string;
  /** The sizes the component actually supports. Empty means it has none. */
  sizes: string[];
  /** The states it actually supports. */
  states: string[];
  /**
   * The variants it actually supports.
   *
   * Missing until a reader asked "does Button have variants?" and the studio
   * had no way to answer. A component with six variants and a control for none
   * of them is a component the tool cannot show.
   */
  variants?: string[];
  /** The states the system expects every interactive component to have. */
  expected: string[];
  /** One rendered example per state. */
  render: (state: string, size?: string, variant?: string) => React.ReactElement;
}

const noop = () => {};

/** The states every interactive component should have. */
const INTERACTIVE = ['default', 'hover', 'focus', 'disabled'];
const INPUT_STATES = [...INTERACTIVE, 'error', 'readonly'];
const FEEDBACK_STATES = ['info', 'success', 'warning', 'danger'];

export const FIXTURES: ComponentFixture[] = [
  {
    name: 'Button', kind: 'action', group: 'Atoms', sizes: ['sm', 'md', 'lg'], states: INTERACTIVE, expected: INTERACTIVE,
    variants: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'link'],
    render: (state, size, variant) => (
      <Button size={(size ?? 'md') as 'sm'} disabled={state === 'disabled'} variant={(variant ?? 'primary') as 'primary'}>
        {state === 'default' ? 'Button' : state}
      </Button>
    ),
  },
  {
    name: 'Input', kind: 'input', group: 'Inputs', sizes: ['sm', 'md', 'lg'], states: INPUT_STATES, expected: INPUT_STATES,
    render: (state, size) => (
      <Input
        size={(size ?? 'md') as 'sm'}
        label="Username"
        // `hint` is not an Input prop — it lives on `Field`. Recorded rather
        // than worked around: an input that cannot say what it wants is a gap.
        helperText={state === 'error' ? undefined : '3–20 characters'}
        error={state === 'error' ? 'That name is taken' : undefined}
        disabled={state === 'disabled'}
        readOnly={state === 'readonly'}
        defaultValue={state === 'default' ? '' : 'starli'}
      />
    ),
  },
  {
    name: 'Slider', kind: 'input', group: 'Inputs', sizes: ['sm', 'md', 'lg'], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state, size) => (
      <Slider
        value={40}
        onChange={noop}
        size={(size ?? 'md') as 'sm'}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Out of range' : undefined}
        label="Volume"
        showValue
      />
    ),
  },
  {
    name: 'Textarea', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Textarea
        label="About"
        error={state === 'error' ? 'Up to 200 characters' : undefined}
        disabled={state === 'disabled'}
        rows={2}
      />
    ),
  },
  {
    name: 'Select', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Select
        label="Route"
        options={[{ value: 'a', label: 'Tehran' }, { value: 'b', label: 'Shiraz' }]}
        error={state === 'error' ? 'Pick a route' : undefined}
        disabled={state === 'disabled'}
      />
    ),
  },
  {
    name: 'Checkbox', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'checked', 'disabled', 'error'], expected: INTERACTIVE,
    render: (state) => (
      <Checkbox
        checked={state === 'checked'}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'You must accept the terms' : undefined}
        onChange={noop}
        label="I accept"
      />
    ),
  },
  {
    name: 'Radio', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'checked', 'disabled', 'error'], expected: INTERACTIVE,
    render: (state) => (
      <Radio
        checked={state === 'checked'}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose one' : undefined}
        onChange={noop}
        name="m"
        value="a"
        label="Option"
      />
    ),
  },
  {
    name: 'Toggle', kind: 'action', group: 'Atoms', sizes: [], states: ['off', 'on', 'disabled'], expected: INTERACTIVE,
    render: (state) => (
      <Toggle checked={state === 'on'} disabled={state === 'disabled'} onChange={noop} aria-label="Enabled" />
    ),
  },
  {
    name: 'Badge', group: 'Atoms', sizes: [], states: ['neutral', 'success', 'warning', 'danger', 'info'], expected: [],
    variants: ['neutral', 'success', 'warning', 'danger', 'info'],
    render: (state) => <Badge semantic={state === 'neutral' ? undefined : (state as 'success')}>Badge</Badge>,
  },
  {
    name: 'Tag', group: 'Atoms', sizes: [], states: ['default'], expected: [],
    render: () => <Tag>Design</Tag>,
  },
  {
    name: 'AvatarGroup', group: 'Data', sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => (
      <AvatarGroup size={(size ?? 'md') as 'sm'}>
        <Avatar name="Starli" />
        <Avatar name="Trade" />
      </AvatarGroup>
    ),
  },
  {
    name: 'DatePicker', kind: 'input', group: 'Data', sizes: [], states: ['default', 'disabled', 'error'], expected: [],
    render: (state) => (
      <DatePicker
        label="Date"
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Pick a date' : undefined}
      />
    ),
  },
  {
    name: 'Tabs', kind: 'action', group: 'Navigation', sizes: ['sm', 'md'], states: ['default'], expected: [],
    render: (_s, size) => (
      <Tabs
        value="a"
        onChange={noop}
        size={(size ?? 'md') as 'sm'}
        items={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Settings' }]}
      />
    ),
  },
  {
    name: 'Alert', group: 'Feedback', sizes: [], states: FEEDBACK_STATES, expected: FEEDBACK_STATES,
    render: (state) => (
      <Alert semantic={state as 'info'} title={state} onClose={noop}>Message</Alert>
    ),
  },
  {
    name: 'Progress', group: 'Data', sizes: ['sm', 'md', 'lg'], states: ['default', 'success', 'warning', 'danger'], expected: [],
    render: (state, size) => (
      <Progress value={62} label="Upload" size={(size ?? 'md') as 'sm'} semantic={state === 'default' ? undefined : (state as 'success')} />
    ),
  },
  {
    name: 'Avatar', group: 'Data', // Avatar has three sizes, not the icon engine's five. Recorded as-is.
    sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Avatar name="Starli Trade" size={(size ?? 'md') as 'md'} />,
  },
  {
    name: 'Stat', group: 'Data', sizes: [], states: ['default'], expected: [],
    render: () => <Stat label="Requests" value="1,204" />,
  },
  {
    name: 'Card', group: 'Containers', sizes: [], states: ['default'], expected: [],
    render: () => <Card>Card content</Card>,
  },
  {
    name: 'Panel', group: 'Containers', sizes: [], states: ['default'], expected: [],
    render: () => <Panel title="Panel">Content</Panel>,
  },
  {
    name: 'Divider', group: 'Containers', sizes: [], states: ['default'], expected: [],
    render: () => <div style={{ width: 200 }}><Divider /></div>,
  },
  {
    name: 'Skeleton', group: 'Utilities', sizes: [], states: ['text', 'circle', 'rect'], expected: [],
    variants: ['text', 'circle', 'rect'],
    render: (state) => <Skeleton variant={state as 'text'} width={160} />,
  },
  {
    name: 'EmptyState', group: 'Utilities', sizes: [], states: ['default'], expected: [],
    render: () => <EmptyState title="Nothing here" />,
  },
  {
    name: 'Mist', group: 'Atoms', sizes: [], states: ['default'], expected: [],
    render: () => <Mist aria-label="Floating">Mist</Mist>,
  },
  {
    name: 'Pagination', group: 'Data', sizes: [], states: ['default'], expected: INTERACTIVE,
    // Pagination has no `disabled` prop — recorded as a gap rather than faked.
    render: () => <Pagination currentPage={2} totalPages={5} onPageChange={noop} />,
  },
  {
    name: 'NavItem', group: 'Navigation', sizes: [], states: ['default', 'active', 'disabled'], expected: INTERACTIVE,
    render: (state) => <NavItem active={state === 'active'} disabled={state === 'disabled'}>Dashboard</NavItem>,
  },
  {
    name: 'Breadcrumb', group: 'Navigation', sizes: [], states: ['default'], expected: [],
    render: () => <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Projects' }]} />,
  },
  // ── the rest of the library ──────────────────────────────────────────────
  {
    name: 'Modal', group: 'Containers', sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Modal open title="Dialog" size={(size ?? 'md') as 'sm'} onClose={noop}>Content</Modal>,
  },
  {
    name: 'Popover', group: 'Containers', sizes: [], states: ['closed', 'open'], expected: [],
    render: (state) => (
      // The closed state is UNCONTROLLED, so a reader can actually open it.
      // Passing `open={false}` would make the preview a picture of a popover
      // that cannot be opened — and the studio's whole job is that you can.
      <Popover
        trigger={<Button variant="secondary">Open</Button>}
        {...(state === 'open' ? { open: true } : {})}
        aria-label="Details"
      >
        <span>Popover content</span>
      </Popover>
    ),
  },
  {
    name: 'Drawer', group: 'Containers', sizes: ['sm', 'md', 'lg'], states: ['closed', 'open'], expected: [],
    render: (state, size) => (
      <Drawer open={state === 'open'} side="end" size={(size ?? 'md') as 'sm'} title="Filters">
        <span>Drawer content</span>
      </Drawer>
    ),
  },
  {
    name: 'HoverCard', group: 'Containers', sizes: [], states: ['closed', 'open'], expected: [],
    render: (state) => (
      // Uncontrolled when closed, so a reader can actually hover it open.
      <HoverCard
        trigger={<Button variant="secondary">Hover me</Button>}
        {...(state === 'open' ? { open: true } : {})}
        aria-label="Details"
      >
        <span>Hover card content</span>
      </HoverCard>
    ),
  },
  {
    name: 'Sheet', group: 'Containers', sizes: ['sm', 'md', 'lg'], states: ['default'], expected: [],
    render: (_s, size) => <Sheet open title="Sheet" size={(size ?? 'md') as 'sm'} onClose={noop}>Content</Sheet>,
  },
  {
    name: 'AlertDialog', group: 'Feedback', sizes: [], states: ['closed', 'open'], expected: [],
    render: (state) => (
      <AlertDialog
        open={state === 'open'}
        title="Delete this project?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
      />
    ),
  },
  {
    name: 'Toast', group: 'Feedback', sizes: [], states: FEEDBACK_STATES, expected: FEEDBACK_STATES,
    render: (state) => <Toast open title={state} message="Message" semantic={state as 'info'} onClose={noop} />,
  },
  {
    name: 'SimpleTooltip', group: 'Feedback', sizes: [], states: ['default'], expected: [],
    render: () => <SimpleTooltip content="Tooltip"><Button>Hover me</Button></SimpleTooltip>,
  },
  {
    name: 'Combobox', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <Combobox label="City" options={[{ value: 'a', label: 'Tehran' }]} onChange={noop}
        error={state === 'error' ? 'Choose one' : undefined} disabled={state === 'disabled'} />
    ),
  },
  {
    name: 'MultiSelect', kind: 'input', group: 'Inputs', sizes: [], states: ['default', 'disabled', 'error'], expected: INPUT_STATES,
    render: (state) => (
      <MultiSelect label="Labels" options={[{ value: 'a', label: 'Design' }]} onChange={noop}
        error={state === 'error' ? 'Choose one' : undefined} disabled={state === 'disabled'} />
    ),
  },
  {
    name: 'CommandPalette', group: 'Navigation', sizes: [], states: ['default'], expected: [],
    render: () => <CommandPalette isOpen onClose={noop} groups={[{ title: 'Commands', items: [{ id: 'a', label: 'Save', action: noop }] }]} />,
  },
  {
    name: 'Table', group: 'Data', sizes: [], states: ['default'], expected: [],
    render: () => (
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <tbody><TableRow><TableCell>Starli</TableCell><TableCell>Active</TableCell></TableRow></tbody>
      </Table>
    ),
  },
  {
    name: 'Calendar', group: 'Data', sizes: [], states: ['gregorian', 'jalali'], expected: [],
    render: (state) => state === 'jalali'
      ? <Calendar calendar="jalali" lang="fa" month={new Date(Date.UTC(2026, 9, 1))} />
      : <Calendar month={new Date(Date.UTC(2026, 9, 1))} />,
  },
  {
    name: 'FilterBar', group: 'Data', sizes: [], states: ['empty', 'active'], expected: [],
    render: (state) => (
      <FilterBar activeFilters={state === 'active' ? [{ id: 'a', label: 'Active', value: 'x' }] : []} onRemoveFilter={noop} onClearAll={noop}>
        <span />
      </FilterBar>
    ),
  },
  {
    name: 'AppShell', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <AppShell><span>Content</span></AppShell>,
  },
  {
    name: 'Sidebar', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <Sidebar><NavItem>Dashboard</NavItem></Sidebar>,
  },
  {
    name: 'Topbar', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <Topbar logo={<span>LIMINAL</span>} />,
  },
  {
    name: 'Footer', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <Footer />,
  },
  {
    name: 'PageHeader', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <PageHeader title="Page" />,
  },
  {
    name: 'PageSection', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <PageSection title="Section">Content</PageSection>,
  },
  {
    name: 'Grid', group: 'Layout', sizes: [], states: ['default'], expected: [],
    render: () => <Grid><GridCol col={6}>Half</GridCol><GridCol col={6}>Half</GridCol></Grid>,
  },
  {
    name: 'ErrorPage', group: 'Utilities', sizes: [], states: ['default'], expected: [],
    render: () => <ErrorPage code="404" title="Not found" />,
  },
  {
    name: 'FormLayout', group: 'Utilities', sizes: [], states: ['default'], expected: [],
    render: () => <FormLayout><FormLayout.Section title="Section"><FormLayout.Field label="Field"><Input /></FormLayout.Field></FormLayout.Section></FormLayout>,
  },
  {
    name: 'Form', group: 'Utilities', sizes: [], states: ['default', 'error'], expected: [],
    render: (state) => (
      <Form validators={{ n: (v) => (String(v ?? '').trim() ? undefined : 'Required') }}>
        <Field name="n" label="Name" required hint={state === 'error' ? undefined : 'Full name'}><Input /></Field>
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
