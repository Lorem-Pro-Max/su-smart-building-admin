import { HeaderButton } from "@components/utils";

function ElectricGraphPageHeader({
  pageIcon,
  pageTitle,
  children,
  multiTabs,
  onSwitchPage,
  currentPage,
  headerActions = null,
}) {
  const getButtonStyle = (isActive) => ({
    bgColor: isActive ? "#36CFC9" : "#FFFFFF",
    color: isActive ? "#FFFFFF" : "#08979C",
    borderColor: "#36CFC9",
  });

  return (
    <div className="h-full flex flex-col bg-page-mint overflow-y-auto items-center">
      <div className="w-full bg-white flex flex-col items-center">
        <div className="flex items-start justify-between h-22 bg-white pt-content-layout-y px-content-layout-x shrink-0 gap-4 w-full max-w-max-page-content">
          <div className="w-max font-medium flex flex-row gap-2 items-center">
            {pageIcon}
            <h3 className="text-page-title leading-page-title">{pageTitle}</h3>
          </div>

          <div className="w-max gap-4 h-10 flex flex-row">
            {headerActions}
            {multiTabs ? (
              <>
                <div
                  onClick={() => onSwitchPage("dashboard")}
                  className="cursor-pointer h-full"
                >
                  <HeaderButton
                    text="Dashboard"
                    {...getButtonStyle(currentPage === "dashboard")}
                  />
                </div>

                <div
                  onClick={() => onSwitchPage("control")}
                  className="cursor-pointer h-full"
                >
                  <HeaderButton
                    text={`ควบคุม${pageTitle}`}
                    {...getButtonStyle(currentPage === "control")}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-full w-full max-w-max-page-content bg-transparent pt-content-layout-y px-content-layout-x min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

export default ElectricGraphPageHeader;
