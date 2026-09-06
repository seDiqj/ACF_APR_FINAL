"use client";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import StringHelper from "@/helpers/StringHelpers/StringHelper";

const BreadcrumbWithCustomSeparator = () => {
  const currentPathName = usePathname();
  const pathSegments = currentPathName.split("/").filter(Boolean);

  const breadcrumbs = pathSegments
    .map((segment, index) => {
      if (Number.parseInt(pathSegments[index])) {
        return null;
      }
      const href =
        "/" +
        (Number.parseInt(pathSegments[index + 1])
          ? pathSegments.slice(0)
          : pathSegments.slice(0, index + 1)
        ).join("/");
      let label = StringHelper.normalize(segment);
      return { href, label };
    })
    .filter((b) => b != null);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, i) => (
          <BreadcrumbItem key={i}>
            <BreadcrumbLink asChild>
              <Link href={crumb.href}>{crumb.label}</Link>
            </BreadcrumbLink>
            <BreadcrumbPage></BreadcrumbPage>
            {breadcrumbs.length - 1 != i ? (
              <BreadcrumbSeparator></BreadcrumbSeparator>
            ) : null}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbWithCustomSeparator;
