import Icon from "@ant-design/icons";
import { CalendarIcon, SignalTowerIcon, BurgerIcon } from "@assets/icons";

const wrapIcon = (Component) => (props) =>
  <Icon component={Component} {...props} />;

export const CalendarAntdIcon = wrapIcon(CalendarIcon);
export const SignalTowerAntdIcon = wrapIcon(SignalTowerIcon);
export const BurgerAntdIcon = wrapIcon(BurgerIcon);
