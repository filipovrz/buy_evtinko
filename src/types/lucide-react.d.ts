declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };
  export type LucideIcon = FC<LucideProps>;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const User: LucideIcon;
  export const Search: LucideIcon;
  export const Shield: LucideIcon;
  export const Download: LucideIcon;
  export const CreditCard: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Zap: LucideIcon;
  export const Lock: LucideIcon;
  export const Headphones: LucideIcon;
  export const Check: LucideIcon;
  export const Monitor: LucideIcon;
  export const Package: LucideIcon;
  export const Minus: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Tags: LucideIcon;
  export const Users: LucideIcon;
  export const Settings: LucideIcon;
  export const Ticket: LucideIcon;
  export const MessageSquare: LucideIcon;
}
