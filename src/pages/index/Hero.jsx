export default function Hero() {

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-16 lg:py-32">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              100% Open Source
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            The missing startup operating system
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
            Run your projects, goals, and processes like a high performance startup.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-operately-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-operately-dark-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Join the waitlist
              </a>
              <a href="/blueprint" className="text-sm font-semibold leading-6 text-gray-900">
                Read blueprint <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
