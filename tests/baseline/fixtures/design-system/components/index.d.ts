import type * as React from 'react';
export type IconName = 'plus' | 'check' | 'x' | 'search' | 'bell' | 'settings' | 'calendar' | 'user' | 'users' | 'folder' | 'more' | 'chevron-down' | 'chevron-right' | 'chevron-left' | 'alert' | 'info' | 'check-circle' | 'x-circle' | 'loader' | 'trash' | 'inbox' | 'filter' | 'message' | 'paperclip' | 'star' | 'clock' | 'arrow' | 'logout' | 'home' | 'grid' | 'list' | 'flag' | 'lock' | 'mail' | 'eye' | 'sun' | 'moon' | 'sparkles' | 'chart' | 'link' | 'upload' | 'edit' | 'tag' | 'target';
export type Tone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; trailingIcon?: IconName; iconOnly?: boolean; loading?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconProps { name: IconName; size?: number; spin?: boolean; 'aria-label'?: string }
export declare function Icon(props: IconProps): React.ReactElement | null;
export interface AvatarProps { name: string; size?: number; status?: 'online' | 'away' | 'offline' }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface BadgeProps { tone?: Tone; dot?: boolean; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface TextFieldProps { label?: string; placeholder?: string; defaultValue?: string; hint?: string; error?: string; icon?: IconName; type?: string; multiline?: boolean; rows?: number; disabled?: boolean; onChange?: (value: string) => void }
export declare function TextField(props: TextFieldProps): React.ReactElement;
export interface CheckboxProps { label?: React.ReactNode; defaultChecked?: boolean; checked?: boolean; strike?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }
export declare function Checkbox(props: CheckboxProps): React.ReactElement;
export interface SwitchProps { label?: string; description?: string; defaultChecked?: boolean; checked?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }
export declare function Switch(props: SwitchProps): React.ReactElement;
export interface TabItem { value: string; label: string; icon?: IconName; count?: number }
export interface TabsProps { items: TabItem[]; variant?: 'line' | 'pill'; defaultValue?: string; value?: string; onChange?: (value: string) => void }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface CardProps { title?: string; description?: string; action?: React.ReactNode; footer?: React.ReactNode; interactive?: boolean; children?: React.ReactNode }
export declare function Card(props: CardProps): React.ReactElement;
export interface DialogProps { title: string; description?: string; open?: boolean; inline?: boolean; width?: number; footer?: React.ReactNode; onClose?: () => void; children?: React.ReactNode }
export declare function Dialog(props: DialogProps): React.ReactElement | null;
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; action?: React.ReactNode; dismissible?: boolean; children?: React.ReactNode }
export declare function Alert(props: AlertProps): React.ReactElement | null;
export interface ProgressProps { value: number; label?: string; tone?: 'accent' | 'info' | 'warning' | 'danger' }
export declare function Progress(props: ProgressProps): React.ReactElement;
export interface EmptyStateProps { title: string; description?: string; icon?: IconName; action?: React.ReactNode }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;
export interface SkeletonProps { width?: number | string; height?: number | string; circle?: boolean }
export declare function Skeleton(props: SkeletonProps): React.ReactElement;
declare global { interface Window { Pine: { Button: typeof Button; Icon: typeof Icon; Avatar: typeof Avatar; Badge: typeof Badge; TextField: typeof TextField; Checkbox: typeof Checkbox; Switch: typeof Switch; Tabs: typeof Tabs; Card: typeof Card; Dialog: typeof Dialog; Alert: typeof Alert; Progress: typeof Progress; EmptyState: typeof EmptyState; Skeleton: typeof Skeleton } } }
