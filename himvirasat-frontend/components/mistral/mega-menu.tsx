"use client";

import { NavigationMenu } from "radix-ui";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { ArrowRow } from "./arrow-row";
import { Eyebrow } from "./eyebrow";
import { PixelIcon } from "./pixel-icon";

export type MenuLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type MenuGroup = {
  heading: string;
  nativeEcho?: string;
  links: MenuLink[];
};

export type MenuPanel = {
  label: string;
  groups: MenuGroup[];
};

/**
 * Desktop navigation. Each trigger opens a ruled panel of grouped links;
 * rows carry the same pixel-arrow hover as every other list in the system.
 *
 * Radix `Content` is rendered in place rather than through a shared
 * `Viewport`, so each panel is positioned under its own trigger and no
 * width/height animation variables are needed.
 */
export function MegaMenu({
  panels,
  className,
}: {
  panels: MenuPanel[];
  className?: string;
}) {
  // Root is controlled so the open panel is known to React, which keeps
  // the trigger's tint and chevron flip as ordinary conditional classes
  // instead of `data-[state=open]:` variants.
  const [openPanel, setOpenPanel] = useState("");

  return (
    <NavigationMenu.Root
      delayDuration={80}
      value={openPanel}
      onValueChange={setOpenPanel}
      className={cn("hidden h-full md:flex", className)}
    >
      <NavigationMenu.List className="flex h-full items-stretch">
        {panels.map((panel) => {
          const isOpen = openPanel === panel.label;
          return (
          <NavigationMenu.Item
            key={panel.label}
            value={panel.label}
            className="relative flex"
          >
            <NavigationMenu.Trigger
              className={cn(
                "text-nav border-border hover:bg-secondary flex items-center gap-1.5 border-r px-5 transition-colors",
                isOpen && "bg-secondary",
              )}
            >
              {panel.label}
              <PixelIcon
                name="chevron-down"
                className={cn(
                  "text-muted-foreground size-3.5 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </NavigationMenu.Trigger>

            <NavigationMenu.Content className="animate-unroll-in bg-popover border-border absolute top-full left-0 z-50 w-[min(92vw,36rem)] border-x border-b">
              <div
                className={cn(
                  "bg-border grid gap-px",
                  panel.groups.length > 1 ? "sm:grid-cols-2" : "grid-cols-1",
                )}
              >
                {panel.groups.map((group) => (
                  <div key={group.heading} className="ruled-cell">
                    <Eyebrow nativeEcho={group.nativeEcho} className="px-4 pt-4">
                      {group.heading}
                    </Eyebrow>
                    <ul className="mt-2 flex flex-col">
                      {group.links.map((link) => (
                        <li key={link.href + link.label}>
                          <NavigationMenu.Link asChild>
                            <ArrowRow
                              href={link.href}
                              label={link.label}
                              description={link.description}
                              external={link.external}
                            />
                          </NavigationMenu.Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
