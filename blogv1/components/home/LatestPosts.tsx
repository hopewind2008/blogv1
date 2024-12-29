'use client'

import { memo } from 'react'

interface Post {
  id: number
  date: string
  title: string
  excerpt: string
}

const posts: Post[] = [
  {
    id: 1,
    date: '2023年12月23日',
    title: '人工智能的未来：下一步是什么？',
    excerpt: '探索人工智能技术的最新发展，以及它将如何改变我们的未来生活方式...',
  },
  {
    id: 2,
    date: '2023年12月23日',
    title: '人工智能的未来：下一步是什么？',
    excerpt: '探索人工智能技术的最新发展，以及它将如何改变我们的未来生活方式...',
  },
  {
    id: 3,
    date: '2023年12月23日',
    title: '人工智能的未来：下一步是什么？',
    excerpt: '探索人工智能技术的最新发展，以及它将如何改变我们的未来生活方式...',
  },
]

interface PostCardProps {
  post: Post
}

const PostCard = memo(({ post }: PostCardProps) => (
  <article
    className="group cursor-pointer space-y-3 md:space-y-4 rounded-lg border border-gray-800 p-4 md:p-6 transition-colors hover:border-gray-700 hover:bg-white/5"
  >
    <time className="text-sm text-gray-400">{post.date}</time>
    <h3 className="text-lg md:text-xl font-semibold group-hover:text-blue-400 transition-colors">
      {post.title}
    </h3>
    <p className="text-sm md:text-base text-gray-400">
      {post.excerpt}
    </p>
  </article>
))

PostCard.displayName = 'PostCard'

const LatestPosts = () => {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <h2 className="mb-6 md:mb-8 text-xl md:text-2xl font-semibold">最新文章</h2>
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

export default memo(LatestPosts) 