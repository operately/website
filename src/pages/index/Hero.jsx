import { GitHubStarButton } from '../../components/Buttons';

export default function Hero({ latestRelease }) {
  return (
    <div className="bg-white">
      <div className="relative isolate x-4 sm:px-6 pt-10 sm:pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3185FF] to-[#FF6F61] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

        <div className="mx-auto max-w-2xl py-8 sm:py-16 lg:py-32">
          <LatestReleaseBadge release={latestRelease} />

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              The Startup OS You've Been Missing
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 px-4 sm:px-0">
              Open-source company management. Projects, goals, and processes <span className="hidden lg:inline"><br /></span> in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-y-4 sm:gap-y-0 gap-x-6">
              <JoinWaitlist />
              <Install />
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#E3F2FF] to-[#3185FF] opacity-60 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function LatestReleaseBadge({ release }) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col items-center justify-center space-y-3 sm:space-y-4">
      <GitHubStarButton username="operately" repo="operately" />
      <div className="text-center rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
        <span className="inline-flex items-center flex-wrap justify-center">
          🚀 Operately {release.version} now available - 
          <span className="sm:hidden"><br /></span>
          <a href={`/releases/${release.slug}`} className="text-operately-blue hover:text-operately-dark-blue ml-1">
            See what's new →
          </a>
        </span>
      </div>
      
    </div>
  );
}

function JoinWaitlist() {
  return (
    <a
      href="https://docs.google.com/forms/d/e/1FAIpQLSebV6j1nIvyjvyLptZ95mHXoj42XrnBmd5znVnUzU_6ATAJgw/viewform"
      className="rounded-md bg-operately-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-operately-dark-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-auto inline-block"
    >
      Join the cloud waitlist
    </a>
  )
}

function Install() {
  return (
    <a href="/install" className="text-sm font-semibold leading-6 text-gray-900">
      Self-Host in 5 minutes <span aria-hidden="true">→</span>
    </a>
  )
}