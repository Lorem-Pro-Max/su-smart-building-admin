export const SideBarMenuConfig = {
  token: {
    fontFamily: "var(--font-main)",
  },
  components: {
    Menu: {
      subMenuItemBg: "transparent",
      subMenuItemSelectedColor: "var(--color-sidebar-selected-arrow)",

      itemBg: "tranparent",
      itemColor: "var(--color-sidebar-children-color)",
      itemBorderRadius: 0,

      itemMarginInline: 0,

      activeBarBorderWidth: 0,
      activeBarWidth: 4,

      itemHoverColor: "var(--color-sidebar-selected-children-text)",
      itemHoverBg: "var(--color-sidebar-selected-children-bg-hover)",
      itemSelectedBg: "var(--color-sidebar-selected-children-bg)",
      itemSelectedColor: "var(--color-sidebar-selected-children-text)",
    },
  },
};

export const SideBarTitleStyle =
  "font-main text-sidebar-menu-font-size font-medium text-sidebar-menu-title tracking-figma";

export const SideBarChildrenStyle =
  "ml-4 font-normal text-sidebar-menu-font-size";
