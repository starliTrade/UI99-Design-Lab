import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import React from 'react';

import { Button } from '../atoms/Button/Button';
import { Badge } from '../atoms/Badge/Badge';
import { Tag } from '../atoms/Tag/Tag';
import { Toggle } from '../atoms/Toggle/Toggle';
import { Mist } from '../atoms/Mist/Mist';
import { Card } from '../containers/Card/Card';
import { Panel } from '../containers/Panel/Panel';
import { Divider } from '../containers/Divider/Divider';
import { Stat } from '../data/Stat/Stat';
import { Progress } from '../data/Progress/Progress';
import { Avatar } from '../data/Avatar/Avatar';
import { AvatarGroup } from '../data/AvatarGroup/AvatarGroup';
import { Pagination } from '../data/Pagination/Pagination';
import { Input } from '../inputs/Input/Input';
import { Textarea } from '../inputs/Textarea/Textarea';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Radio } from '../inputs/Radio/Radio';
import { Select } from '../inputs/Select/Select';
import { Alert } from '../feedback/Alert/Alert';
import { EmptyState } from '../composites/EmptyState/EmptyState';
import { Skeleton } from '../composites/Skeleton/Skeleton';
import { ErrorPage } from '../composites/ErrorPage/ErrorPage';
import FormLayout from '../composites/FormLayout/FormLayout';
import { Grid, GridCol } from '../layout/Grid/Grid';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import { PageSection } from '../layout/PageSection/PageSection';
import { Footer } from '../layout/Footer/Footer';
import { NavItem } from '../nav/NavItem/NavItem';
import { Sidebar } from '../nav/Sidebar/Sidebar';
import { Topbar } from '../nav/Topbar/Topbar';
import { Tabs, TabPanel } from '../nav/Tabs/Tabs';
import { Breadcrumb } from '../nav/Breadcrumb/Breadcrumb';
import { Modal } from '../containers/Modal/Modal';
import { Sheet } from '../containers/Sheet/Sheet';
import { Toast } from '../feedback/Toast/Toast';
import { SimpleTooltip } from '../feedback/Tooltip/SimpleTooltip';
import { Combobox } from '../inputs/Combobox/Combobox';
import { MultiSelect } from '../inputs/MultiSelect/MultiSelect';
import { CommandPalette } from '../nav/CommandPalette/CommandPalette';
import { Table } from '../data/Table/Table';
import { TableHeader, TableRow, TableHead, TableCell } from '../data/Table';
import { FilterBar } from '../data/FilterBar/FilterBar';
import { AppShell } from '../layout/AppShell/AppShell';
import { Calendar } from '../data/Calendar/Calendar';

/**
 * ============================================================================
 * ACCESSIBILITY SWEEP
 * ============================================================================
 *
 * `accessibility.test.tsx` proved seven components. The library has forty-five.
 * The audit's finding was exact: "axe scans 7 of 74" — so the conformance claim
 * rested on a tenth of the surface.
 *
 * This renders every component with the minimum props it needs and runs axe on
 * each. It is a smoke test, not a proof: it catches missing labels, bad roles
 * and duplicate ids, which is what axe is for. It does not replace the
 * behavioural tests.
 *
 * `color-contrast` stays disabled — jsdom has no layout engine, so axe cannot
 * compute rendered colours. Contrast is proven exactly in
 * `src/engine/__tests__/contrast.test.ts` against the real ladder.
 */
afterEach(cleanup);

async function violations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.html).slice(0, 2),
  }));
}

/** Every component, with the minimum props it needs to render. */
const FIXTURES: Array<[string, ReactElement]> = [
  ['Button', <Button>Save</Button>],
  ['Button (icon only)', <Button iconOnly ariaLabel="Close">x</Button>],
  ['Badge', <Badge>New</Badge>],
  ['Tag', <Tag>Design</Tag>],
  ['Toggle', <Toggle checked={false} onChange={() => {}} aria-label="Enable" />],
  ['Mist', <Mist aria-label="Floating">Mist</Mist>],
  ['Card', <Card>Content</Card>],
  ['Panel', <Panel title="Panel">Content</Panel>],
  ['Divider', <Divider />],
  ['Stat', <Stat label="Requests" value="1,204" />],
  ['Progress', <Progress value={40} label="Upload" />],
  ['Avatar', <Avatar name="Clara O'Connor" />],
  ['AvatarGroup', <AvatarGroup><Avatar name="A" /><Avatar name="B" /></AvatarGroup>],
  ['Pagination', <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />],
  ['Input', <Input label="Name" />],
  ['Textarea', <Textarea label="Notes" />],
  ['Checkbox', <Checkbox checked={false} onChange={() => {}} label="Agree" />],
  ['Radio', <Radio checked={false} onChange={() => {}} name="g" value="a" label="One" />],
  ['Select', <Select label="Pick" options={[{ value: 'a', label: 'A' }]} />],
  ['Alert', <Alert semantic="info" title="Heads up">Message</Alert>],
  ['EmptyState', <EmptyState title="Nothing here" />],
  ['Skeleton', <Skeleton />],
  ['ErrorPage', <ErrorPage code="404" title="Not found" />],
  ['FormLayout', <FormLayout><FormLayout.Section title="S"><FormLayout.Field label="F"><Input label="F" /></FormLayout.Field></FormLayout.Section></FormLayout>],
  ['Grid', <Grid><GridCol col={6}>A</GridCol></Grid>],
  ['PageHeader', <PageHeader title="Page" />],
  ['PageSection', <PageSection title="Section">Content</PageSection>],
  ['Footer', <Footer />],
  ['NavItem', <NavItem>Dashboard</NavItem>],
  ['Sidebar', <Sidebar><NavItem>Dashboard</NavItem></Sidebar>],
  ['Topbar', <Topbar logo={<span>App</span>} />],
  ['Tabs', <Tabs items={[{ id: 'a', label: 'A' }]} value="a" onChange={() => {}}><TabPanel value="a">A</TabPanel></Tabs>],
  ['Breadcrumb', <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Now' }]} />],

  // ── the hard half ────────────────────────────────────────────────────────
  //
  // The sweep proved 33 components and skipped every one where axe has
  // something to find: the overlays, the composite inputs, the grid. That is
  // the half a conformance claim actually rests on.
  ['Modal', <Modal open title="Dialog" onClose={() => {}}>Body</Modal>],
  ['Sheet', <Sheet open title="Sheet" onClose={() => {}}>Body</Sheet>],
  ['Toast', <Toast open title="Saved" message="Done" semantic="success" onClose={() => {}} />],
  ['SimpleTooltip', <SimpleTooltip content="Help"><Button>Hover</Button></SimpleTooltip>],
  ['Combobox', <Combobox label="Pick" options={[{ value: 'a', label: 'A' }]} onChange={() => {}} />],
  ['MultiSelect', <MultiSelect label="Pick" options={[{ value: 'a', label: 'A' }]} onChange={() => {}} />],
  ['CommandPalette', <CommandPalette isOpen onClose={() => {}} groups={[{ title: 'G', items: [{ id: 'a', label: 'A', action: () => {} }] }]} />],
  ['Table', <Table><TableHeader><TableRow><TableHead>H</TableHead></TableRow></TableHeader><tbody><TableRow><TableCell>C</TableCell></TableRow></tbody></Table>],
  ['FilterBar', <FilterBar activeFilters={[]} onRemoveFilter={() => {}} onClearAll={() => {}}><span>f</span></FilterBar>],
  ['AppShell', <AppShell><span>content</span></AppShell>],
  ['Calendar', <Calendar month={new Date(Date.UTC(2026, 9, 1))} />],
  ['Calendar (jalali)', <Calendar calendar="jalali" lang="fa" month={new Date(Date.UTC(2026, 9, 1))} />],
];

describe('accessibility sweep — every component renders without axe violations', () => {
  for (const [name, ui] of FIXTURES) {
    it(name, async () => {
      const { container } = render(ui);
      expect(await violations(container), name).toEqual([]);
    });
  }
});
