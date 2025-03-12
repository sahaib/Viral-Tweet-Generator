"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Navbar as NextUINavbar,
  NavbarBrand as NextUINavbarBrand,
  NavbarContent as NextUINavbarContent,
  NavbarItem as NextUINavbarItem,
  NavbarMenu as NextUINavbarMenu,
  NavbarMenuItem as NextUINavbarMenuItem,
  NavbarMenuToggle as NextUINavbarMenuToggle,
} from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import { motion } from "framer-motion";

import { siteConfig } from "../config/site";
import { ThemeSwitch } from "./theme-switch";
import { TwitterIcon, GithubIcon, SearchIcon } from "./icons";
import { TweetLogo } from "./tweet-logo";
import { KofiButton } from "./kofi-button";
import { KofiButtonSmall } from "./kofi-button-small";

const navItems = [
  {
    label: "Tech Tweets",
    href: "/tweet-generator",
  },
  {
    label: "Casual Tweets",
    href: "/casual-tweets",
  },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-background/70 backdrop-blur-md"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NextUINavbarContent>
        <NextUINavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NextUINavbarBrand className="gap-3">
          <Link href="/" className="flex items-center gap-2">
            <TweetLogo />
            <p className="font-bold text-inherit">Tweet Generator</p>
          </Link>
        </NextUINavbarBrand>
      </NextUINavbarContent>

      <NextUINavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NextUINavbarItem key={item.href}>
              <Link
                className={`relative px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10 font-medium shadow-sm"
                    : "text-default-600 hover:text-primary hover:bg-primary/5"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            </NextUINavbarItem>
          );
        })}
      </NextUINavbarContent>

      <NextUINavbarContent justify="end">
        <NextUINavbarItem className="hidden sm:flex">
          <Link
            isExternal
            href={siteConfig.links.github}
            className="text-default-600 hover:text-primary transition-colors"
          >
            <GithubIcon className="text-default-600" />
          </Link>
        </NextUINavbarItem>
        <NextUINavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NextUINavbarItem>
        <NextUINavbarItem className="hidden sm:flex">
          <KofiButton username="sahaib" />
        </NextUINavbarItem>
      </NextUINavbarContent>

      <NextUINavbarMenu>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NextUINavbarMenuItem key={item.href}>
              <Link
                className={`w-full text-lg py-2 ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-default-600 hover:text-primary"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            </NextUINavbarMenuItem>
          );
        })}
        <NextUINavbarMenuItem>
          <Link
            isExternal
            href={siteConfig.links.github}
            className="text-default-600 hover:text-primary w-full text-lg py-2"
          >
            GitHub
          </Link>
        </NextUINavbarMenuItem>
        <NextUINavbarMenuItem className="mt-3">
          <KofiButtonSmall username="sahaib" />
        </NextUINavbarMenuItem>
      </NextUINavbarMenu>
    </NextUINavbar>
  );
};
