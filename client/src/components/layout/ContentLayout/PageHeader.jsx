function PageHeader({ pageIcon, pageTitle, children }) {
  return (
    <div className="h-full flex flex-col ">
      <div className="w-full bg-white flex justify-center">
        <div className="flex flex-col h-32 bg-white pt-doors-control-y px-doors-control-x shrink-0 gap-4 w-full max-w-max-page-content">
          <div className="w-max font-medium flex flex-row gap-2 items-center">
            {pageIcon}
            <h3 className="text-page-title leading-page-title">{pageTitle}</h3>
          </div>
          {children}
        </div>
      </div>
      <div className="bg-page-mint h-screen"></div>
    </div>
  );
}

export default PageHeader;
