import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Stat } from './Stat';
import { Table, TableHeader, TableRow, TableHead, TableCell } from './Table';
import { Pagination } from './Pagination';
import { FilterBar } from './FilterBar';
import { Calendar, DatePicker } from './Calendar';
import { Progress } from './Progress';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { Card } from '../containers/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Divider } from '../containers/Divider';
import { Checkbox } from '../inputs/Checkbox';
import {
  getTextStyle,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  Users,
  TrendUp,
  WarningOctagon,
  HardDrive,
  DotsThreeVertical,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { resolveSurface } from '../../engine/liminal-surface';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
}

export function DataDemo() {
  const [selectedRows, setSelectedRows] = useState<number[]>([0, 2]);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeFilters, setActiveFilters] = useState<Array<{ id: string; label: string; value: string }>>([
    { id: 'role', label: 'Role', value: 'System' },
    { id: 'status', label: 'Status', value: 'Online' },
  ]);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const containerStyle = resolveSurface({ role: 'chrome', interactive: false }).style;

  const users: UserRecord[] = [
    { id: 'u-1', name: 'Kaelen Vos', email: 'kaelen.vos@liminal.gateway', role: 'System Architect', status: 'online' },
    { id: 'u-2', name: 'Mira Rayne', email: 'mira.rayne@liminal.gateway', role: 'Security Lead', status: 'busy' },
    { id: 'u-3', name: 'Dmitri Vance', email: 'dmitri.vance@liminal.gateway', role: 'Edge Engineer', status: 'online' },
    { id: 'u-4', name: 'Elena Rostova', email: 'elena.rostova@liminal.gateway', role: 'Operations', status: 'offline' },
    { id: 'u-5', name: 'Clara O’Connor', email: 'clara.oconnor@liminal.gateway', role: 'Compliance', status: 'online' },
  ];

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  // Sorting logic
  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = (a as any)[sortColumn] || '';
    const valB = (b as any)[sortColumn] || '';
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = sortedUsers.length > 0 && selectedRows.length === sortedUsers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(sortedUsers.map((_, i) => i));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index: number, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, index]);
    } else {
      setSelectedRows((prev) => prev.filter((i) => i !== index));
    }
  };

  return (
    <div
      style={{
        ...containerStyle,
        borderRadius: `${RADIUS.container}px`,
        padding: `${SPACING[5]}px`,
        boxSizing: 'border-box',
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.06)` }}
      >
        <div>
          <h2
            style={{
              fontSize: `${TYPOGRAPHY[4].fs}px`,
              fontWeight: 600,
              color: getTextStyle('primary', 1).color,
              margin: 0,
            }}
          >
            LIMINAL Advanced Data Table &amp; Composites · v2.0
          </h2>
          <p
            style={{
              fontSize: `${TYPOGRAPHY[1].fs}px`,
              fontFamily: 'monospace',
              color: getTextStyle('secondary', 1).color,
              marginTop: '4px',
              margin: 0,
            }}
          >
            Table · FilterBar · Calendar · DatePicker · Pagination · Stat Cards
          </p>
        </div>

        <Badge semantic="success">Phase 2 All Steps Active</Badge>
      </div>

      {/* 1. STAT CARDS GRID */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          1. Metric Telemetry Stats
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="QUORUM REVENUE"
            value="$1,482,900"
            trend={{ direction: 'up', value: '+14.2%', semantic: 'success' }}
            subtitle="vs. preceding epoch window"
            prefix={<LiminalIcon icon={TrendUp} size="xs" weight="light" />}
          />

          <Stat
            label="ACTIVE SESSIONS"
            value="34,821"
            trend={{ direction: 'up', value: '+8.4%', semantic: 'info' }}
            subtitle="TLS 1.3 mutual auth verified"
            prefix={<LiminalIcon icon={Users} size="xs" weight="light" />}
          />

          <Stat
            label="INGRESS BANDWIDTH"
            value="892.4 MB/s"
            trend={{ direction: 'neutral', value: 'NOMINAL', semantic: 'info' }}
            subtitle="Anycast multi-region peering"
            prefix={<LiminalIcon icon={HardDrive} size="xs" weight="light" />}
          />

          <Stat
            label="PACKET RETRIES"
            value="0.002%"
            trend={{ direction: 'down', value: '-65.0%', semantic: 'success' }}
            subtitle="Zero jitter edge hop #1"
            prefix={<LiminalIcon icon={WarningOctagon} size="xs" weight="light" />}
          />
        </div>
      </div>

      <Divider spacing="md" />

      {/* 2. ADVANCED FILTER BAR */}
      <div className="mb-4">
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          2. Advanced Filter Bar
        </div>
        <FilterBar
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        >
          <span style={{ fontSize: '12px', color: getTextStyle('secondary', 1).color, fontFamily: 'monospace' }}>
            Query Active Scope: Enterprise Gateway
          </span>
        </FilterBar>
      </div>

      <Divider spacing="md" />

      {/* 3. CALENDAR & DATE PICKER */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          3. Calendar &amp; DatePicker Integration
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card padding="md" title="Interactive DatePicker Popup">
            <div className="space-y-4 pt-2">
              <DatePicker
                label="Epoch Audit Date"
                selectedDate={selectedDate}
                onSelectDate={(d) => { if (d instanceof Date || d === null) setSelectedDate(d); }}
                placeholder="Select date..."
              />
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color, fontFamily: 'monospace' }}>
                Selected ISO: {selectedDate instanceof Date ? selectedDate.toISOString() : 'None'}
              </div>
            </div>
          </Card>

          <Card padding="md" title="Standalone Calendar Grid">
            <div className="pt-2 flex justify-center">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={(d) => { if (d instanceof Date || d === null) setSelectedDate(d); }}
              />
            </div>
          </Card>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 4. ADVANCED TABLE WITH SORT & SELECT */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>4. User Directory Table (Sortable Columns · Row Selection · Avatar + Status)</span>
          <span style={{ color: getTextStyle('quaternary', 1).color }}>
            {selectedRows.length} of {sortedUsers.length} selected
          </span>
        </div>

        <Card padding="sm">
          <Table>
            <TableHeader>
              <tr role="row">
                <th
                  scope="col"
                  style={{
                    width: '44px',
                    padding: `${SPACING[3]}px ${SPACING[3]}px`,
                    textAlign: 'center',
                  }}
                >
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>

                <TableHead
                  align="right"
                  sortDirection={sortColumn === 'name' ? sortDirection : 'none'}
                  onSort={() => handleSort('name')}
                >
                  User Profile
                </TableHead>

                <TableHead
                  align="right"
                  sortDirection={sortColumn === 'role' ? sortDirection : 'none'}
                  onSort={() => handleSort('role')}
                >
                  Role &amp; Clearance
                </TableHead>

                <TableHead align="left">
                  Status
                </TableHead>

                <TableHead align="center" width="60px">
                  Actions
                </TableHead>
              </tr>
            </TableHeader>

            <tbody>
              {sortedUsers.map((user, index) => {
                const isSelected = selectedRows.includes(index);

                return (
                  <TableRow
                    key={user.id}
                    isSelected={isSelected}
                    onClick={() => handleSelectRow(index, !isSelected)}
                  >
                    {/* Checkbox Cell */}
                    <TableCell align="center" style={{ width: '44px' }} onClick={(e) => e?.stopPropagation?.()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(checked) => handleSelectRow(index, checked)}
                        aria-label={`Select row for ${user.name}`}
                      />
                    </TableCell>

                    {/* User Profile Cell */}
                    <TableCell isPrimary align="right">
                      <div className="flex items-center gap-3 justify-end">
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 500, color: getTextStyle('primary', 1).color }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color, fontFamily: 'monospace' }}>
                            {user.email}
                          </div>
                        </div>
                        <Avatar name={user.name} size="md" status={user.status} />
                      </div>
                    </TableCell>

                    {/* Role Cell */}
                    <TableCell align="right">
                      <Badge semantic={user.role.includes('Architect') ? 'success' : user.role.includes('Security') ? 'danger' : 'info'}>
                        {user.role}
                      </Badge>
                    </TableCell>

                    {/* Status Cell */}
                    <TableCell align="left">
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          textTransform: 'capitalize',
                          color:
                            user.status === 'online'
                              ? SEMANTICS.SUCCESS.text
                              : user.status === 'busy'
                              ? SEMANTICS.DANGER.text
                              : getTextStyle('tertiary', 1).color,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              user.status === 'online'
                                ? SEMANTICS.SUCCESS.solid
                                : user.status === 'busy'
                                ? SEMANTICS.DANGER.solid
                                : getTextStyle('tertiary', 1).color,
                          }}
                        />
                        {user.status}
                      </span>
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell align="center" onClick={(e) => e?.stopPropagation?.()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Opening actions for ${user.name}`)}
                        aria-label={`Actions for ${user.name}`}
                      >
                        <LiminalIcon icon={DotsThreeVertical} size="sm" weight="bold" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </Card>

        {/* Pagination Integration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <span style={{ fontSize: '12px', color: getTextStyle('secondary', 1).color }}>
            Page {currentPage} of 5 (Total records: 34)
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Divider spacing="md" />

      {/* 5. PROGRESS BARS */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          5. Linear Progress Gauges
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md">
            <div className="space-y-4">
              <Progress
                value={78}
                size="md"
                semantic="success"
                showLabel
                label="Primary Quorum Sync"
              />

              <Progress
                value={45}
                size="md"
                semantic="warning"
                showLabel
                label="Thermal Threshold Limit"
              />
            </div>
          </Card>

          <Card padding="md">
            <div className="space-y-4">
              <Progress
                value={92}
                size="md"
                semantic="danger"
                showLabel
                label="HSM Memory Quota Depletion"
              />

              <Progress
                value={64}
                size="md"
                showLabel
                label="Brand Primary Execution (#E9ECF2)"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DataDemo;
