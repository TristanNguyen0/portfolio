import { useEffect, type ReactElement } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { getPost } from './lib/posts'
import { usePathname } from './lib/router'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const SITE_NAME = 'Tristan Nguyen'
const POST_PREFIX = '/blog/'

function resolve(pathname: string): { title: string; page: ReactElement } {
  if (pathname === '/') return { title: `${SITE_NAME} — Software Engineer`, page: <Home /> }
  if (pathname === '/blog') return { title: `Blog — ${SITE_NAME}`, page: <BlogIndex /> }

  if (pathname.startsWith(POST_PREFIX)) {
    const post = getPost(pathname.slice(POST_PREFIX.length))
    if (post) return { title: `${post.title} — ${SITE_NAME}`, page: <BlogPost post={post} /> }
  }

  return { title: `Not found — ${SITE_NAME}`, page: <NotFound /> }
}

export default function App() {
  const { title, page } = resolve(usePathname())

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <Header />

      <main className="flex-1">{page}</main>

      <Footer />
    </div>
  )
}
