import { DiscordIcon, GitHubIcon, LinkedInIcon, XIcon, YouTubeIcon } from './Icons'

const discordUrl = import.meta.env.DISCORD_URL;
const githubUrl = import.meta.env.GITHUB_URL;
const linkedinUrl = import.meta.env.LINKEDIN_URL;
const xUrl = import.meta.env.X_URL;
const youtubeUrl = import.meta.env.YOUTUBE_URL;

const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Masterplan', href: '/masterplan' },
      { name: 'Operations Handbook', href: '/blueprint' },
      { name: 'KPI Examples', href: 'https://kpiexamples.operately.com' },
      { name: 'Jobs', href: '/jobs' },
      { name: 'Employee Handbook', href: '/handbook' },
      { name: 'Blog', href: 'https://blog.operately.com' },
    ],
    social: [
      {
        name: 'Discord',
        href: discordUrl,
        icon: (props) => ( DiscordIcon(props) )
      },
      {
        name: 'GitHub',
        href: githubUrl,
        icon: (props) => ( GitHubIcon(props) )
      },
      {
        name: 'LinkedIn',
        href: linkedinUrl,
        icon: (props) => ( LinkedInIcon(props) )
      },
      {
        name: 'X',
        href: xUrl,
        icon: (props) => ( XIcon(props) )
      },
      {
        name: 'YouTube',
        href: youtubeUrl,
        icon: (props) => ( YouTubeIcon(props) )
      }
    ],
  }
  
  export default function Footer() {
    return (
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
            {navigation.main.map((item) => (
              <div key={item.name} className="pb-6">
                <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-operately-blue">
                  {item.name}
                </a>
              </div>
            ))}
          </nav>
          <div className="mt-10 flex justify-center space-x-10">
            {navigation.social.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-400 hover:text-operately-blue">
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-10 text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Operately doo All rights reserved.
          </p>
        </div>
      </footer>
    )
  }
  