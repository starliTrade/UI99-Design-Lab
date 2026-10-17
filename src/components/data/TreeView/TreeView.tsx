import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · TREE VIEW
 *
 * The hardest ARIA in the library, and the keyboard is the reason.
 *
 * A tree is not a list of nested divs. It is a single composite widget with ONE
 * tab stop and a keyboard contract:
 *
 *   Tab          in and out of the whole tree — one stop, not one per node
 *   ↑ ↓          previous and next VISIBLE node
 *   →            expand, or move into the first child
 *   ←            collapse, or move out to the parent
 *   Home / End   first and last visible node
 *   Enter/Space  select
 *
 * Every one of those is a promise the component makes, and a tree that only
 * handles ↑ ↓ has broken four of them. This one keeps all six.
 *
 *   role        `work` — a tree is a surface the reader works in.
 *   sizes       sm · md · lg.
 *   variants    none.
 *   states      expanded · collapsed · selected · disabled.
 *   tokens      zero raw values.
 *   a11y        `role="tree"`, `role="treeitem"`, `role="group"` for a nested
 *               set, `aria-expanded` only where there is something to expand,
 *               `aria-selected` where selection is on, and `aria-level` because
 *               a screen reader announces depth from it.
 *   RTL         indentation is a logical inset; the tree's structure is not
 *               mirrored, because a hierarchy is not a direction.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  /** Controlled expansion. Omit for uncontrolled. */
  expanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** The selected node, or null. */
  selected?: string | null;
  onSelect?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  label: string;
  className?: string;
  style?: CSSProperties;
}

const ROW = { sm: 24, md: 30, lg: 36 } as const;
const INDENT = { sm: 14, md: 18, lg: 22 } as const;

/** The visible nodes, in the order the reader sees them. */
function flatten(nodes: TreeNode[], expanded: Set<string>, depth = 1, out: { node: TreeNode; depth: number }[] = []) {
  for (const node of nodes) {
    out.push({ node, depth });
    if (node.children?.length && expanded.has(node.id)) flatten(node.children, expanded, depth + 1, out);
  }
  return out;
}

export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    nodes,
    expanded: controlledExpanded,
    onExpandedChange,
    selected = null,
    onSelect,
    size = 'md',
    label,
    className = '',
    style: customStyle,
  },
  forwardedRef,
) {
  const host = useHostSurface();
  const [uncontrolled, setUncontrolled] = useState<string[]>([]);
  const isControlled = controlledExpanded !== undefined;
  const expandedList = isControlled ? controlledExpanded : uncontrolled;
  const expanded = useMemo(() => new Set(expandedList), [expandedList]);

  const setExpanded = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolled(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const visible = useMemo(() => flatten(nodes, expanded), [nodes, expanded]);

  // ONE TAB STOP for the whole tree. `active` is where the keyboard is; it is
  // not the same as `selected`, because a reader can move through a tree without
  // choosing anything.
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  /**
   * Move the keyboard to a node.
   *
   * It sets the index and stops there. The FOCUS follows in an effect, and that
   * split is the fix for a real bug: calling `focus()` synchronously inside the
   * key handler made the state revert to where the browser already was, so
   * `→` on an open node expanded it and then left the keyboard behind. One
   * owner for the index; the DOM catches up afterwards.
   */
  const focusAt = useCallback(
    (index: number) => setActive(Math.max(0, Math.min(visible.length - 1, index))),
    [visible.length],
  );

  // The DOM follows the state, never the other way round.
  useEffect(() => {
    itemRefs.current[active]?.focus();
  }, [active]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const entry = visible[index];
      if (!entry) return;
      const { node } = entry;
      const hasChildren = Boolean(node.children?.length);
      const isOpen = expanded.has(node.id);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusAt(index + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusAt(index - 1);
          break;
        case 'Home':
          e.preventDefault();
          focusAt(0);
          break;
        case 'End':
          e.preventDefault();
          focusAt(visible.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          // Expand, or step into the first child if it is already open. Both
          // halves are the contract; only doing the first leaves a reader unable
          // to descend.
          if (hasChildren && !isOpen) setExpanded([...expandedList, node.id]);
          else if (hasChildren && isOpen) focusAt(index + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          // Collapse, or step out to the parent if it is already closed.
          if (hasChildren && isOpen) setExpanded(expandedList.filter((id) => id !== node.id));
          else {
            for (let i = index - 1; i >= 0; i--) {
              if (visible[i].depth < entry.depth) {
                focusAt(i);
                break;
              }
            }
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!node.disabled) onSelect?.(node.id);
          break;
        default:
          break;
      }
    },
    [visible, expanded, expandedList, setExpanded, focusAt, onSelect],
  );

  const surface = resolveSurface({ role: 'work', on: host });
  const rowHeight = ROW[size];
  const indent = INDENT[size];

  /**
   * The group goes INSIDE the treeitem, which is the shape the APG describes
   * and the shape a screen reader reads as nesting.
   *
   * The first version rendered the children as a SIBLING `<li role="none">`,
   * which needed an explicit `aria-level` to be understood at all — working
   * around the structure instead of building it. A tree is a tree.
   */
  const renderNodes = (list: TreeNode[], depth: number): React.ReactNode =>
    list.map((node) => {
      const index = visible.findIndex((v) => v.node.id === node.id);
      const hasChildren = Boolean(node.children?.length);
      const isOpen = expanded.has(node.id);
      const isSelected = selected === node.id;
      const isActive = index === active;
      const wellFill = resolveSurface({ role: 'well', on: host }).background;
      return (
        <li
          key={node.id}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          role="treeitem"
          aria-level={depth}
          // Present ONLY where there is something to expand: `aria-expanded` on
          // a leaf tells a screen reader a lie about the node.
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={onSelect ? isSelected : undefined}
          aria-disabled={node.disabled || undefined}
          // ROVING: one node is reachable by Tab and the rest are not.
          tabIndex={isActive ? 0 : -1}
          onKeyDown={(e) => onKeyDown(e, index)}
          onClick={() => {
            if (node.disabled) return;
            if (hasChildren) setExpanded(isOpen ? expandedList.filter((id) => id !== node.id) : [...expandedList, node.id]);
            onSelect?.(node.id);
          }}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          <div
            data-liminal-surface=""
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${L.SPACING[1]}px`,
              minHeight: rowHeight,
              paddingInlineStart: `${L.SPACING[2] + (depth - 1) * indent}px`,
              paddingInlineEnd: `${L.SPACING[2]}px`,
              borderRadius: `${L.RADIUS.chip}px`,
              cursor: node.disabled ? 'not-allowed' : 'pointer',
              opacity: node.disabled ? 0.5 : 1,
              transition: M.getTransition('background', 'fast'),
              ...resolveInteractionVars({
                role: 'control',
                on: host,
                // A SELECTED node keeps its fill in every state — the same rule
                // a checked control follows.
                idle: isSelected ? wellFill : 'transparent',
                frozen: isSelected ? wellFill : undefined,
              }),
            }}
          >
            <span aria-hidden style={{ width: 12, flexShrink: 0, color: getTextStyle('tertiary', 1).color, fontSize: 10 }}>
              {hasChildren ? (isOpen ? '▾' : '▸') : ''}
            </span>
            <span
              style={{
                ...L.getTypeStyle(2),
                color: isSelected ? getTextStyle('primary', 2).color : getTextStyle('secondary', 2).color,
                fontWeight: isSelected ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {node.label}
            </span>
          </div>
          {hasChildren && isOpen && (
            <ul role="group" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {renderNodes(node.children!, depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul
      ref={forwardedRef}
      role="tree"
      aria-label={label}
      className={className}
      style={{
        ...surface.style,
        listStyle: 'none',
        margin: 0,
        padding: 0,
        borderRadius: `${L.RADIUS.card}px`,
        paddingBlock: `${L.SPACING[1]}px`,
        ...customStyle,
      }}
    >
      {renderNodes(nodes, 1)}
    </ul>
  );
});

export default TreeView;
