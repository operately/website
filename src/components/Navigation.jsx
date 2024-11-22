"use client";

const cloudWaitlistUrl = import.meta.env.PUBLIC_CLOUD_WAITLIST_URL;
const bookaDemoUrl = import.meta.env.PUBLIC_BOOK_A_DEMO_URL;
const discordUrl = import.meta.env.PUBLIC_DISCORD_URL;
const blogUrl = import.meta.env.PUBLIC_BLOG_URL;

import logoImage from "../layouts/operately-logo.svg";
import squareLogoImage from "../layouts/square-logo.png";

import { useState } from "react";

import {
  Dialog,
  DialogPanel,
  Disclosure,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import {
  ArrowUp,
  ChevronDown,
  Layout,
  PackageCheck,
  Binoculars,
  CalendarDays,
  Mail,
  Menu,
  X,
} from "lucide-react";

const products = [
  {
    name: "Features",
    description: "See what's possible with Operately",
    href: "/features",
    icon: Layout,
  },
  {
    name: "Releases",
    description: "The latest updates and improvements",
    href: "/releases",
    icon: PackageCheck,
  },
  {
    name: "Roadmap",
    description: "See what we have planned for the future",
    href: "/roadmap",
    icon: Binoculars,
  },
  {
    name: "Book a demo",
    description: "Get a personalized walkthrough",
    href: bookaDemoUrl,
    icon: CalendarDays,
  },
];

const about = [
  { name: "Masterplan", href: "/masterplan" },
  {
    name: (
      <>
        Open source <span className="text-red-500">❤️</span>
      </>
    ),
    href: "/open-source",
  },
  { name: "Jobs", href: "/jobs" },
  { name: "Blog", href: blogUrl },
  { name: "Discord", href: discordUrl },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative isolate z-10">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Operately</span>
            <img alt="" src={logoImage.src} className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          {/* Product menu */}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
              Product
              <ChevronDown
                aria-hidden="true"
                className="size-5 flex-none text-gray-400"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="p-4">
                {products.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon
                        aria-hidden="true"
                        className="size-6 text-gray-600 group-hover:text-edgy-blue"
                      />
                    </div>
                    <div className="flex-auto">
                      <a
                        href={item.href}
                        className="block font-semibold text-gray-900"
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

          <a href="/pricing" className="text-sm/6 font-semibold text-gray-900">
            Pricing
          </a>

          {/* About menu */}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
              About
              <ChevronDown
                aria-hidden="true"
                className="size-5 flex-none text-gray-400"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              {about.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </a>
              ))}
            </PopoverPanel>
          </Popover>
        </PopoverGroup>

        {/* CTAs */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-6">
          <a
            href={bookaDemoUrl}
            rel="nofollow"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Book a demo
          </a>
          <a
            href={cloudWaitlistUrl}
            rel="nofollow"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-edgy-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-operately-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edgy-blue"
          >
            Join cloud waitlist
            <Mail aria-hidden="true" className="size-5 -mr-0.5" />
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Operately</span>
              <img
                alt="Operately square logo"
                src={squareLogoImage.src}
                className="h-12 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    Product
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 flex-none group-data-[open]:rotate-180"
                    />
                  </DisclosureButton>

                  <DisclosurePanel className="mt-2 space-y-2">
                    {products.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <a
                  href="/pricing"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Pricing
                </a>

                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    About
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 flex-none group-data-[open]:rotate-180"
                    />
                  </DisclosureButton>

                  <DisclosurePanel className="mt-2 space-y-2">
                    {about.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
              </div>
              <div className="py-6">
                <a
                  href={bookaDemoUrl}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Book a demo
                </a>
                <a
                  href={cloudWaitlistUrl}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Join cloud waitlist
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
