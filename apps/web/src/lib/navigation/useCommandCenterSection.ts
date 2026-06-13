"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type CommandCenterSectionId,
  DEFAULT_COMMAND_CENTER_SECTION,
  getCommandCenterSection,
  parseCommandCenterSection
} from "./sections";

export function useCommandCenterSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeSection = useMemo(
    () => parseCommandCenterSection(searchParams.get("section")),
    [searchParams]
  );

  const activeSectionMeta = useMemo(() => getCommandCenterSection(activeSection), [activeSection]);

  const setActiveSection = useCallback(
    (sectionId: CommandCenterSectionId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sectionId === DEFAULT_COMMAND_CENTER_SECTION) {
        params.delete("section");
      } else {
        params.set("section", sectionId);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { activeSection, activeSectionMeta, setActiveSection };
}
