import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@components/ui/sidebar";
import type { ReactElement, FC } from "react";

export default function MobileNavigation(): ReactElement<FC> {
  return (
    <SidebarProvider>
      <Sidebar side="right" variant="sidebar" collapsible="offcanvas">
        <SidebarContent></SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
