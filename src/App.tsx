import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { fetchSiteCounter, trackSiteVisit, trackStoryClick } from './client/analytics'
import {
  categoryLabels,
  categoryDescriptions,
  composeStoryFeed,
  getBrandStories,
  getChannelBrands,
  getStoryById,
  getStoriesByCategory,
  stories,
  subcategories,
  type CategoryId,
  type ContentCategory,
  type PublishedFeed,
  type Story,
} from './data/newsData'

type Route =
  | { view: 'home' }
  | { view: 'channel'; category: ContentCategory }
  | { view: 'brand'; brand: string }
  | { view: 'story'; storyId: string }

type StoryInteraction = {
  liked: boolean
  likes: number
  comments: string[]
}

type StoryInteractions = Record<string, StoryInteraction>

const INTERACTIONS_STORAGE_KEY = 'product-news-digest-interactions'
const RUNTIME_FEED_URL = '/runtime/published-feed.json'

function parseHash(hash: string): Route {
  const cleaned = hash.replace(/^#/, '')

  if (!cleaned || cleaned === '/') {
    return { view: 'home' }
  }

  const parts = cleaned.split('/').filter(Boolean)

  if (parts[0] === 'brand' && parts[1]) {
    return { view: 'brand', brand: decodeURIComponent(parts[1]) }
  }

  if (
    parts[0] === 'channel' &&
    parts[1] &&
    ['luxury', 'beauty', 'sports', 'digital'].includes(parts[1])
  ) {
    return { view: 'channel', category: parts[1] as ContentCategory }
  }

  if (parts[0] === 'story' && parts[1]) {
    return { view: 'story', storyId: decodeURIComponent(parts[1]) }
  }

  return { view: 'home' }
}

function buildBrandHash(brand: string) {
  return `#/brand/${encodeURIComponent(brand)}`
}

function buildStoryHash(storyId: string) {
  return `#/story/${encodeURIComponent(storyId)}`
}

function buildChannelHash(category: ContentCategory) {
  return `#/channel/${category}`
}

function formatDate(date: string) {
  return date
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.hash = '#/'
}

function buildInitialInteractions(sourceStories: Story[]) {
  return sourceStories.reduce<StoryInteractions>((acc, story) => {
    acc[story.id] = { liked: false, likes: 0, comments: [] }
    return acc
  }, {})
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [activeSubcategory, setActiveSubcategory] = useState<string>('全部')
  const [runtimeStories, setRuntimeStories] = useState<Story[]>([])
  const [siteVisitors, setSiteVisitors] = useState<number | null>(null)
  const allStories = useMemo(() => composeStoryFeed(runtimeStories), [runtimeStories])
  const [interactions, setInteractions] = useState<StoryInteractions>(() => {
    const initial = buildInitialInteractions(stories)

    try {
      const raw = window.localStorage.getItem(INTERACTIONS_STORAGE_KEY)

      if (!raw) {
        return initial
      }

      const parsed = JSON.parse(raw) as Partial<StoryInteractions>

      return Object.keys(initial).reduce<StoryInteractions>((acc, storyId) => {
        const saved = parsed[storyId]
        acc[storyId] =
          saved && Array.isArray(saved.comments) && typeof saved.likes === 'number'
            ? saved
            : initial[storyId]
        return acc
      }, {} as StoryInteractions)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadRuntimeFeed() {
      try {
        const response = await fetch(RUNTIME_FEED_URL, { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const feed = (await response.json()) as PublishedFeed
        if (!cancelled && Array.isArray(feed.stories)) {
          setRuntimeStories(feed.stories)
        }
      } catch {
        // Ignore runtime feed failures and keep static feed as fallback.
      }
    }

    void loadRuntimeFeed()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSiteCounter() {
      try {
        await trackSiteVisit()
        const summary = await fetchSiteCounter()
        if (!cancelled) {
          setSiteVisitors(summary.totalVisitors)
        }
      } catch {
        if (!cancelled) {
          setSiteVisitors(null)
        }
      }
    }

    void loadSiteCounter()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(interactions))
  }, [interactions])

  const visibleSubcategories = useMemo(() => {
    if (activeCategory === 'all') {
      return ['全部']
    }

    return ['全部', ...subcategories[activeCategory]]
  }, [activeCategory])

  const visibleStories = useMemo(() => {
    const byCategory =
      activeCategory === 'all'
        ? allStories
        : allStories.filter((story) => story.category === activeCategory)

    const bySubcategory =
      activeSubcategory === '全部'
        ? byCategory
        : byCategory.filter((story) => story.subcategory === activeSubcategory)

    return [...bySubcategory].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [activeCategory, activeSubcategory, allStories])

  const storyDetail = route.view === 'story' ? getStoryById(route.storyId, allStories) : null
  const brandDetailStories = route.view === 'brand' ? getBrandStories(route.brand, allStories) : []
  const previousStoryIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!storyDetail) {
      previousStoryIdRef.current = null
      return
    }

    if (previousStoryIdRef.current === storyDetail.id) {
      return
    }

    previousStoryIdRef.current = storyDetail.id
    void trackStoryClick(storyDetail)
  }, [storyDetail])

  const toggleLike = (storyId: string) => {
    setInteractions((current) => {
      const existing = current[storyId] ?? { liked: false, likes: 0, comments: [] }
      const nextLiked = !existing.liked

      return {
        ...current,
        [storyId]: {
          ...existing,
          liked: nextLiked,
          likes: Math.max(0, existing.likes + (nextLiked ? 1 : -1)),
        },
      }
    })
  }

  const addComment = (storyId: string, comment: string) => {
    const trimmed = comment.trim()

    if (!trimmed) {
      return
    }

    setInteractions((current) => {
      const existing = current[storyId] ?? { liked: false, likes: 0, comments: [] }

      return {
        ...current,
        [storyId]: {
          ...existing,
          comments: [...existing.comments, trimmed].slice(-6),
        },
      }
    })
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="logo-block logo-link" href="#/">
          <strong>News of Your Next Premium Gifts</strong>
          <span>新品新闻聚合</span>
          <small className="contact-line">商业合作联系 boni.sah@gmail.com</small>
        </a>
        <nav className="topnav">
          {(Object.keys(categoryLabels) as CategoryId[]).map((key) => (
            <button
              key={key}
              type="button"
              className={key === activeCategory ? 'active' : ''}
              onClick={() => {
                setActiveCategory(key)
                setActiveSubcategory('全部')
                window.location.hash = key === 'all' ? '/' : buildChannelHash(key)
              }}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </nav>
      </header>

      {route.view === 'home' && (
        <HomeView
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          setActiveSubcategory={setActiveSubcategory}
          visibleSubcategories={visibleSubcategories}
          visibleStories={visibleStories}
          interactions={interactions}
          onToggleLike={toggleLike}
          onAddComment={addComment}
        />
      )}

      {route.view === 'channel' && (
        <ChannelView
          category={route.category}
          activeSubcategory={activeSubcategory}
          setActiveSubcategory={setActiveSubcategory}
          sourceStories={allStories}
          interactions={interactions}
          onToggleLike={toggleLike}
          onAddComment={addComment}
        />
      )}

      {route.view === 'brand' && brandDetailStories.length > 0 && (
        <BrandDetailView brand={route.brand} brandStories={brandDetailStories} />
      )}

      {route.view === 'story' && storyDetail && (
        <StoryDetailView
          story={storyDetail}
          sourceStories={allStories}
          interaction={interactions[storyDetail.id] ?? { liked: false, likes: 0, comments: [] }}
          onToggleLike={toggleLike}
          onAddComment={addComment}
        />
      )}

      <footer className="site-footer">
        <span>累计访客 {siteVisitors ?? '--'} 人</span>
      </footer>
    </main>
  )
}

function ChannelView({
  category,
  activeSubcategory,
  setActiveSubcategory,
  sourceStories,
  interactions,
  onToggleLike,
  onAddComment,
}: {
  category: ContentCategory
  activeSubcategory: string
  setActiveSubcategory: (value: string) => void
  sourceStories: Story[]
  interactions: StoryInteractions
  onToggleLike: (storyId: string) => void
  onAddComment: (storyId: string, comment: string) => void
}) {
  const channelStories = useMemo(() => {
    const base = getStoriesByCategory(category, sourceStories)
    return activeSubcategory === '全部'
      ? base
      : base.filter((story) => story.subcategory === activeSubcategory)
  }, [category, activeSubcategory, sourceStories])

  const brands = useMemo(() => getChannelBrands(category, sourceStories), [category, sourceStories])
  const filters = ['全部', ...subcategories[category]]

  return (
    <section className="detail-layout">
      <div className="detail-hero">
        <button type="button" className="back-link back-button" onClick={goBack}>
          返回前页
        </button>
        <p className="eyebrow">Channel</p>
        <h1 className="detail-title">{categoryLabels[category]}频道</h1>
        <p className="detail-copy">{categoryDescriptions[category]}</p>
        <div className="detail-tag-list">
          {brands.map((brand) => (
            <a key={brand} className="brand-chip" href={buildBrandHash(brand)}>
              {brand}
            </a>
          ))}
        </div>
      </div>

      <section className="section-panel">
        <div className="subcategory-row">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={item === activeSubcategory ? 'active' : ''}
              onClick={() => setActiveSubcategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="story-grid">
          {channelStories.map((story) => (
            <article key={story.id} className="story-card">
              <a className="image-link" href={buildStoryHash(story.id)}>
                <img className="story-image" src={story.image} alt={story.brand} />
              </a>
              <div className="story-head">
                <div>
                  <a className="brand-name brand-link" href={buildBrandHash(story.brand)}>
                    {story.brand}
                  </a>
                  <p className="source-name">{story.subcategory}</p>
                </div>
                <span className="source-pill">{story.sourceType}</span>
              </div>
              <p className="story-date">
                {story.publishedAt} · {story.checkedAt}
              </p>
              <a className="story-title-link" href={buildStoryHash(story.id)}>
                <h3 className="story-title">{story.title}</h3>
              </a>
              <p className="story-summary">{story.summary}</p>
              <div className="product-row">
                {story.products.map((product) => (
                  <span key={`${story.id}-${product}`}>{product}</span>
                ))}
              </div>
              <StoryEngagement
                storyId={story.id}
                interaction={interactions[story.id] ?? { liked: false, likes: 0, comments: [] }}
                onToggleLike={onToggleLike}
                onAddComment={onAddComment}
              />
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function HomeView({
  activeCategory,
  activeSubcategory,
  setActiveSubcategory,
  visibleSubcategories,
  visibleStories,
  interactions,
  onToggleLike,
  onAddComment,
}: {
  activeCategory: CategoryId
  activeSubcategory: string
  setActiveSubcategory: (value: string) => void
  visibleSubcategories: string[]
  visibleStories: Story[]
  interactions: StoryInteractions
  onToggleLike: (storyId: string) => void
  onAddComment: (storyId: string, comment: string) => void
}) {
  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">News Feed</p>
          <h2>{categoryLabels[activeCategory]}新品资讯</h2>
        </div>
      </div>

      <div className="subcategory-row">
        {visibleSubcategories.map((item) => (
          <button
            key={item}
            type="button"
            className={item === activeSubcategory ? 'active' : ''}
            onClick={() => setActiveSubcategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="story-grid">
        {visibleStories.map((story) => (
          <article key={story.id} className="story-card">
            <a className="image-link" href={buildStoryHash(story.id)}>
              <img className="story-image" src={story.image} alt={story.brand} />
            </a>

            <div className="story-head">
              <div>
                <a className="brand-name brand-link" href={buildBrandHash(story.brand)}>
                  {story.brand}
                </a>
                <p className="source-name">
                  {categoryLabels[story.category]} · {story.subcategory}
                </p>
              </div>
              <span className="source-pill">{story.sourceType}</span>
            </div>

            <p className="story-date">
              {formatDate(story.publishedAt)} · {story.checkedAt}
            </p>
            <a className="story-title-link" href={buildStoryHash(story.id)}>
              <h3 className="story-title">{story.title}</h3>
            </a>
            <p className="story-summary">{story.summary}</p>

            <div className="product-row">
              {story.products.map((product) => (
                <span key={`${story.id}-${product}`}>{product}</span>
              ))}
            </div>

            <div className="card-actions">
              <a href={buildStoryHash(story.id)}>查看详情</a>
              <a href={story.sourceUrl} target="_blank" rel="noreferrer">
                官方来源
              </a>
            </div>
            <StoryEngagement
              storyId={story.id}
              interaction={interactions[story.id] ?? { liked: false, likes: 0, comments: [] }}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
            />
          </article>
        ))}
      </div>
    </section>
  )
}

function StoryEngagement({
  storyId,
  interaction,
  onToggleLike,
  onAddComment,
}: {
  storyId: string
  interaction: StoryInteraction
  onToggleLike: (storyId: string) => void
  onAddComment: (storyId: string, comment: string) => void
}) {
  const [draft, setDraft] = useState('')

  return (
    <div className="engagement-block">
      <form
        className="comment-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAddComment(storyId, draft)
          setDraft('')
        }}
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="写一句留言"
            maxLength={80}
          />
          <div className="comment-actions">
            <button type="submit">留言</button>
            <button
              type="button"
              className={`like-button${interaction.liked ? ' liked' : ''}`}
              onClick={() => onToggleLike(storyId)}
              aria-label="点赞"
            >
              <span aria-hidden="true">♥</span>
              <span>{interaction.likes}</span>
            </button>
          </div>
        </form>

      {interaction.comments.length > 0 && (
        <div className="comment-list">
          {interaction.comments.map((comment, index) => (
            <p key={`${storyId}-${index}`}>{comment}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandDetailView({
  brand,
  brandStories,
}: {
  brand: string
  brandStories: Story[]
}) {
  const latestStory = [...brandStories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]
  const [activeBrandSubcategory, setActiveBrandSubcategory] = useState('全部')
  const brandSubcategories = ['全部', ...Array.from(new Set(brandStories.map((story) => story.subcategory)))]
  const filteredBrandStories =
    activeBrandSubcategory === '全部'
      ? brandStories
      : brandStories.filter((story) => story.subcategory === activeBrandSubcategory)
  const latestFiltered = filteredBrandStories[0]
  const olderStories = filteredBrandStories.slice(1)

  return (
    <section className="detail-layout">
      <div className="detail-hero">
        <button type="button" className="back-link back-button" onClick={goBack}>
          返回前页
        </button>
        <p className="eyebrow">Brand Detail</p>
        <h1 className="detail-title">{brand}</h1>
        <p className="detail-copy">
          这个品牌当前共收录 {brandStories.length} 条新品新闻，最新一条属于
          {categoryLabels[latestStory.category]} · {latestStory.subcategory}。
        </p>
        <div className="subcategory-row brand-filter">
          {brandSubcategories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === activeBrandSubcategory ? 'active' : ''}
              onClick={() => setActiveBrandSubcategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <h2>最新新闻</h2>
          {latestFiltered ? (
            <article className="feature-story">
              <img className="detail-cover" src={latestFiltered.image} alt={latestFiltered.title} />
              <div>
                <p className="detail-meta">
                  {categoryLabels[latestFiltered.category]} · {latestFiltered.subcategory} ·{' '}
                  {latestFiltered.publishedAt}
                </p>
                <a className="detail-story-link" href={buildStoryHash(latestFiltered.id)}>
                  {latestFiltered.title}
                </a>
                <p className="detail-blurb">{latestFiltered.summary}</p>
              </div>
            </article>
          ) : null}
        </section>

        <aside className="detail-panel">
          <h2>当前重点产品</h2>
          <div className="detail-tag-list">
            {filteredBrandStories.flatMap((story) => story.products).map((product) => (
              <span key={`${brand}-${product}`}>{product}</span>
            ))}
          </div>
        </aside>
      </div>

      <div className="detail-grid">
        <section className="detail-panel">
          <h2>更多历史新闻</h2>
          <div className="detail-story-list">
            {olderStories.map((story) => (
              <article key={story.id} className="detail-story-item">
                <img src={story.image} alt={story.title} />
                <div>
                  <p className="detail-meta">
                    {categoryLabels[story.category]} · {story.subcategory} · {story.publishedAt}
                  </p>
                  <a className="detail-story-link" href={buildStoryHash(story.id)}>
                    {story.title}
                  </a>
                  <p className="detail-blurb">{story.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function StoryDetailView({
  story,
  sourceStories,
  interaction,
  onToggleLike,
  onAddComment,
}: {
  story: Story
  sourceStories: Story[]
  interaction: StoryInteraction
  onToggleLike: (storyId: string) => void
  onAddComment: (storyId: string, comment: string) => void
}) {
  const relatedStories = sourceStories
    .filter((item) => item.category === story.category && item.id !== story.id)
    .slice(0, 3)

  return (
    <section className="detail-layout">
      <div className="detail-hero">
        <button type="button" className="back-link back-button" onClick={goBack}>
          返回前页
        </button>
        <p className="eyebrow">Story Detail</p>
        <h1 className="detail-title">{story.title}</h1>
        <p className="detail-copy">
          {categoryLabels[story.category]} · {story.subcategory} · {story.brand} ·{' '}
          {story.publishedAt}
        </p>
      </div>

      <div className="detail-grid">
        <section className="detail-panel detail-article">
          <img className="detail-cover" src={story.image} alt={story.title} />
          <div className="detail-tag-list">
            {story.products.map((product) => (
              <span key={`${story.id}-${product}`}>{product}</span>
            ))}
          </div>
          <p className="detail-body">{story.summary}</p>
          <p className="detail-meta">来源类型：{story.sourceType}</p>
          <p className="detail-meta">来源栏目：{story.sourceLabel}</p>
          <p className="detail-meta">{story.checkedAt}</p>
          <div className="card-actions">
            <a href={buildBrandHash(story.brand)}>查看品牌页</a>
            <a href={story.sourceUrl} target="_blank" rel="noreferrer">
              官方来源
            </a>
          </div>
          <StoryEngagement
            storyId={story.id}
            interaction={interaction}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
          />
        </section>

        <aside className="detail-panel">
          <h2>相关推荐</h2>
          <div className="related-list">
            {relatedStories.map((item) => (
              <a key={item.id} className="related-item" href={buildStoryHash(item.id)}>
                <span>{item.brand}</span>
                <strong>{item.title}</strong>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

export default App
