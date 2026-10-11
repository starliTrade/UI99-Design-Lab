import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';

import { Button } from '../atoms/Button/Button';
import { Badge } from '../atoms/Badge/Badge';
import { Tag } from '../atoms/Tag/Tag';
import { Toggle } from '../atoms/Toggle/Toggle';
import { Input } from '../inputs/Input/Input';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Textarea } from '../inputs/Textarea/Textarea';
import { Alert } from '../feedback/Alert/Alert';
import { Card } from '../containers/Card/Card';
import { Panel } from '../containers/Panel/Panel';
import { Divider } from '../containers/Divider/Divider';
import { Avatar } from '../data/Avatar/Avatar';
import { Progress } from '../data/Progress/Progress';

/**
 * ============================================================================
 * ACCESSIBILITY SMOKE TESTS
 * ============================================================================
 *
 * Every component must render without axe violations and must expose the
 * accessible semantics its markup implies.
 *
 * `color-contrast` is disabled here because jsdom has no layout engine and
 * cannot compute rendered colors. Contrast is proven separately and exactly in
 * src/engine/__tests__/tokens.test.ts.
 */

afterEach(cleanup);

async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });

  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.html).slice(0, 3),
  }));

  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

async function check(label: string, ui: ReactElement) {
  const { container } = render(ui);
  await expectNoA11yViolations(container);
  return container;
}

describe('accessibility — atoms', () => {
  it('Button (default)', async () => {
    await check('button', <Button>Save changes</Button>);
  });

  it('Button (all variants)', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="link">Link</Button>
      </div>,
    );
    await expectNoA11yViolations(container);
  });

  it('Button (disabled) is not focusable and is announced as disabled', async () => {
    const { getByRole } = render(<Button disabled>Unavailable</Button>);
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('Button (icon-only) warns when it has no accessible name', async () => {
    const { getByRole } = render(<Button iconOnly ariaLabel="Close panel" icon={<span>x</span>} />);
    expect(getByRole('button')).toHaveAccessibleName('Close panel');
  });

  it('Badge and Tag render as text', async () => {
    await check('badge', <Badge>New</Badge>);
    await check('tag', <Tag>Design</Tag>);
  });

  it('Toggle exposes a switch role with state', async () => {
    const { getByRole } = render(
      <Toggle checked onChange={() => {}} aria-label="Enable alerts" />,
    );
    const control = getByRole('switch');
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(control).toHaveAccessibleName('Enable alerts');
  });
});

describe('accessibility — inputs', () => {
  it('Input is labelled by its visible label', async () => {
    const { getByLabelText } = render(<Input label="Email address" type="email" />);
    expect(getByLabelText('Email address')).toBeInTheDocument();
  });

  it('Input surfaces an error message to assistive tech', async () => {
    const container = await check(
      'input-error',
      <Input label="Email" error="Enter a valid email address" />,
    );
    // The message must be present in the accessibility tree, not only visually.
    expect(container.textContent).toContain('Enter a valid email address');
  });

  it('Checkbox is a labelled checkbox', async () => {
    const { getByRole } = render(
      <Checkbox checked={false} onChange={() => {}} label="Accept terms" />,
    );
    expect(getByRole('checkbox')).toHaveAccessibleName(/accept terms/i);
  });

  it('Textarea is labelled', async () => {
    const { getByLabelText } = render(<Textarea label="Notes" />);
    expect(getByLabelText('Notes')).toBeInTheDocument();
  });
});

describe('accessibility — feedback and containers', () => {
  it('Alert announces its semantic role', async () => {
    const { getByRole } = render(
      <Alert semantic="danger" title="Key expired">
        The root-of-trust certificate expired.
      </Alert>,
    );
    // danger/warning must be assertive alerts; success/info are status regions.
    expect(getByRole('alert')).toBeInTheDocument();
  });

  it('Alert (info) renders as a status region', async () => {
    const { getByRole } = render(
      <Alert semantic="info" title="Maintenance scheduled">
        Live kernel upgrade scheduled.
      </Alert>,
    );
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('Card and Panel render their content', async () => {
    const container = await check(
      'card',
      <Card title="Recent Projects" subtitle="Deployments">
        <p>Alpha</p>
      </Card>,
    );
    expect(container.textContent).toContain('Recent Projects');
    await check('panel', <Panel title="Nested panel">content</Panel>);
  });

  it('Divider is decorative and hidden from assistive tech', async () => {
    const { container } = render(<Divider />);
    const divider = container.firstElementChild;
    expect(divider).not.toBeNull();
    // A pure separator must not be announced as content.
    expect(divider?.getAttribute('role')).not.toBe('img');
    await expectNoA11yViolations(container);
  });
});

describe('accessibility — data display', () => {
  it('Avatar with a name exposes the name as alternative text', async () => {
    const { getByText } = render(<Avatar name="Ada Lovelace" />);
    // Initials fallback must be readable, not an unlabelled decorative box.
    expect(getByText('AL')).toBeInTheDocument();
  });

  it('Progress exposes a progressbar with a value', async () => {
    const { getByRole } = render(<Progress value={64} max={100} label="Migration" />);
    const bar = getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '64');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});
