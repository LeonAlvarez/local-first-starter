import {
  LayoutDashboardIcon,
  LucideProps,
  ArrowRight,
  PieChart,
  Users,
  Wallet,
  MoonIcon,
  SunIcon,
  TrendingUp,
  Activity,
  DollarSign,
  AlertTriangle,
  Bell,
  CheckCircle,
  UserCheck,
  UserPlus,
} from "lucide-react";

export type IconsProps = LucideProps;

const SplitStream = ({ ...props }: IconsProps) => (
  <svg
    viewBox="149.62 124.15 260.629 102.788"
    width="260.629"
    height="102.788"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 149.62 207.73 C 211.276 36.861 318.093 309.432 410.249 139.676"
      stroke="#3498db"
      strokeWidth="8"
      fill="none"
      style={{ transformOrigin: "282.458px 203.34px" }}
    />
    <text
      x="185.829"
      y="209.311"
      fontFamily="Arial, sans-serif"
      fontSize="48"
      fontWeight="bold"
      fill="#27ae60"
      style={{
        whiteSpace: "pre",
        fontSize: "48px",
        transformOrigin: "298.54px 211.731px",
      }}
    >
      $
    </text>
    <line
      x1="239.255"
      y1="124.15"
      x2="239.255"
      y2="224.15"
      stroke="#e74c3c"
      strokeWidth="4"
      transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)"
    />
    <text
      style={{
        fill: "rgb(44, 62, 80)",
        fontFamily: "Arial, sans-serif",
        fontSize: "36px",
        fontWeight: 700,
        whiteSpace: "pre",
        transformOrigin: "266.413px 214.304px",
      }}
      x="233.702"
      y="219.438"
      dx="0 0 0 0 0 -26.212"
      dy="0 0 0 0 0 -12.554"
    >
      Stream
    </text>
    <text
      style={{
        fill: "rgb(44, 62, 80)",
        fontFamily: "Arial, sans-serif",
        fontSize: "36px",
        fontWeight: 700,
        whiteSpace: "pre",
        transformOrigin: "277.234px 141.395px",
      }}
      x="244.523"
      y="177.173"
      dx="0 0 0 0 0 -24.673"
      dy="0 0 0 0 0 -8.198"
    >
      Split
    </text>
  </svg>
);

export const Icons = {
  dashboard: LayoutDashboardIcon,
  splitStream: SplitStream,
  arrowRight: ArrowRight,
  pieChart: PieChart,
  users: Users,
  userPlus: UserPlus, 
  userCheck: UserCheck,
  wallet: Wallet,
  moon: MoonIcon,
  sun: SunIcon,
  dollar: DollarSign,
  trendingUp: TrendingUp,
  activity: Activity,
  bell: Bell,
  alert: AlertTriangle,
  checkCircle: CheckCircle,
};
