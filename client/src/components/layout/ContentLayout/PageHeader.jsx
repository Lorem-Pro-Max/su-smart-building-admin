function PageHeader({
  pageIcon,
  pageTitle,
  children,
  alternatePageTitle,
  buildingControl = null,
  headerActions = null,
}) {
  return (
    <div className="h-full flex flex-col bg-page-mint overflow-y-auto">
      <div className="w-full bg-white flex justify-center ">
        <div
          className={`flex flex-col ${buildingControl ? "h-[180px]" : "h-32"} bg-white pt-content-layout-y px-content-layout-x shrink-0 gap-4 w-full max-w-max-page-content`}
        >
          <div className="w-full flex items-center justify-between">
            <div className="w-max font-medium flex flex-row gap-2 items-center">
              {pageIcon}
              <h3 className="text-page-title leading-page-title">
                {alternatePageTitle ? alternatePageTitle : pageTitle}
              </h3>
            </div>
            {(headerActions || buildingControl) && (
              <div className="flex items-center gap-4">
                {headerActions}
                {buildingControl}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
