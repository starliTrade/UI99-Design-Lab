export {
  ContextMenu,
  ContextMenuTrigger,
  useContextMenuContext,
} from './ContextMenu';

export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContextValue,
} from './ContextMenu';

export {
  ContextMenuContent,
} from './ContextMenuContent';

export type {
  ContextMenuContentProps,
} from './ContextMenuContent';

// Re-export items directly from DropdownMenu items for 100% DRY compliance
export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuShortcut as ContextMenuShortcut,
} from '../DropdownMenu';

export type {
  DropdownMenuItemProps as ContextMenuItemProps,
  DropdownMenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  DropdownMenuRadioItemProps as ContextMenuRadioItemProps,
  DropdownMenuSeparatorProps as ContextMenuSeparatorProps,
  DropdownMenuLabelProps as ContextMenuLabelProps,
  DropdownMenuShortcutProps as ContextMenuShortcutProps,
} from '../DropdownMenu';
