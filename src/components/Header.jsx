import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logoImage from "../layouts/operately-logo.svg";

import { DiscordIcon, GitHubIcon, XIcon } from "./Icons";

const discordUrl = import.meta.env.DISCORD_URL;
const githubUrl = import.meta.env.GITHUB_URL;
const xUrl = import.meta.env.X_URL;

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Releases", href: "/releases" },
  { name: "Masterplan", href: "/masterplan" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-10">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              className="h-6 w-auto"
              src={logoImage.src}
              alt="Operately logo"
            />
            <span className="sr-only">Operately</span>
          </a>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-gray-900 hover:text-operately-blue"
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center space-x-6">
          <div className="flex items-center space-x-4 mr-1">
            {/*
              <a href="/jobs"
                className="bg-yellow-200 bg-opacity-50 px-2 py-1 rounded text-sm hover:underline flex items-center">
                We're hiring
              </a>
              */}
            <a
              href={discordUrl}
              className=" hover:text-operately-blue flex items-center"
            >
              <DiscordIcon className="h-6 w-6" />
            </a>
            <a
              href={githubUrl}
              className="hover:text-operately-blue flex items-center"
            >
              <GitHubIcon className="h-6 w-6" />
            </a>
            <a
              href={xUrl}
              className="hover:text-operately-blue flex items-center"
            >
              <XIcon className="h-6 w-6" />
            </a>
          </div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSebV6j1nIvyjvyLptZ95mHXoj42XrnBmd5znVnUzU_6ATAJgw/viewform"
            className="bg-operately-blue hover:bg-operately-dark-blue text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            Join the cloud waitlist
          </a>
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src={logoImage.src}
                alt="Operately logo"
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
                {/*<a
                  href="/jobs"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  We're hiring
                </a>*/}
              </div>
              <div className="py-6">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSebV6j1nIvyjvyLptZ95mHXoj42XrnBmd5znVnUzU_6ATAJgw/viewform"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Join the waitlist
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
