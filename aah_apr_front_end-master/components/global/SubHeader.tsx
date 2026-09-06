import { ReactNode } from "react";

interface ComponentProps {
  pageTitle: string;
  children?: ReactNode;
}

const SubHeader: React.FC<ComponentProps> = ({ pageTitle, children }) => {
  return (
    <div className="flex flex-wrap items-center justify-between px-4 py-3 rounded-md shadow-lg border border-gray-200 mb-4">
      <h2 className="text-base md:text-lg font-semibold">
        {pageTitle}
      </h2>
      <div className="flex items-center gap-3 mt-2 md:mt-0">{children}</div>
    </div>
  );
};

export default SubHeader;
