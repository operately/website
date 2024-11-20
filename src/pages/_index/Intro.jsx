import {
  FolderKanban,
  Target,
  ChartNoAxesCombined,
  BookCheck,
} from "lucide-react";
import { Image } from "astro:assets";
import screenshotImage from "./operately-v3-screenshot.png";

export default function Intro() {
  return (
    <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
          />
        </svg>
      </div>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                You don't need a COO. You need Operately.
              </h2>
              <p className="mt-6 text-xl leading-8 text-gray-700">
                Running your startup with project management tools and Notion
                documents? Must be a massive headache. We've been there with{" "}
                <a
                  href="https://semaphoreci.com"
                  className="text-operately-blue hover:text-operately-dark-blue underline"
                  target="_blank"
                >
                  Semaphore
                </a>
                . Figuring out the right systems was tough and keeping them in
                order, even tougher.
              </p>
            </div>
          </div>
        </div>
        <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <img
            src={screenshotImage.src}
            alt="operately alpha screenshot"
            className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
          />
        </div>
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
              <p>
                Truth is, every startup needs to do the same things in order to
                win.
              </p>

              <ul role="list" className="mt-8 space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <FolderKanban className="mt-1 h-5 w-5 flex-none text-operately-blue" />
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Projects
                    </strong>{" "}
                    Standardize project management across groups with a
                    ready-to-go structure with built-in accountability and
                    feedback loops.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <Target className="mt-1 h-5 w-5 flex-none text-operately-blue" />
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Goals
                    </strong>{" "}
                    Connect your long-term vision to short-term goals and all
                    the way to daily tasks and milestones. It'll be clear if
                    your ship is moving in the right direction and what
                    distractions to avoid.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ChartNoAxesCombined className="mt-1 h-5 w-5 flex-none text-operately-blue" />
                  <span>
                    <strong className="font-semibold text-gray-900">
                      KPIs
                    </strong>{" "}
                    <span className="uppercase text-xs mr-2" aria-hidden="true">
                      soon
                    </span>{" "}
                    Track your Key Performance Indicators in correlation with
                    ongoing work. Understand your team's performance at a glance
                    and make data-driven decisions to drive your startup
                    forward.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <BookCheck className="mt-1 h-5 w-5 flex-none text-operately-blue" />
                  <span>
                    <strong className="font-semibold text-gray-900">
                      Playbook
                    </strong>{" "}
                    <span className="uppercase text-xs mr-2" aria-hidden="true">
                      soon
                    </span>{" "}
                    No more dead letters. Your playbook will be made of
                    actionable procedures connected to every role and
                    responsibility. As a bonus, you'll get a system to onboard
                    new team members in no time.
                  </span>
                </li>
              </ul>

              <p className="mt-12">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSebV6j1nIvyjvyLptZ95mHXoj42XrnBmd5znVnUzU_6ATAJgw/viewform"
                  className="rounded-md bg-operately-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-operately-dark-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Join the cloud waitlist
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
