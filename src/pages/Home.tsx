import LeetCodeDashboard from '../components/LeetCodeDashboard'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/projects'

export default function Home() {
  return (
    <div className="page">
      <div className="column">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Tristan Nguyen</h1>
        {/* The tagline is a run of short credentials rather than prose, so it reads
            fine across the full column even though body copy would not. */}
        <p className="mt-3 text-lg text-neutral-400">
          Software Engineer | Computer Science Graduate, TMU '26<br></br>
          TypeScript • React • Node.js • Python • AWS • Docker
        </p>

        <div className="mt-16 space-y-10">
          <section>
            <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-tomorrow-purple" />
              Projects
            </h2>

            {/* Two across, so a card keeps enough width for a legible 16:9 capture
                and a full stack row. Single column below sm. */}
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.slug} className="flex">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>

          <LeetCodeDashboard />
        </div>

      </div>
    </div>
  )
}
