import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Pin, 
  ThumbsUp, 
  MessageCircle, 
  Eye,
  Search,
  Plus,
  X,
  Send,
  Calendar,
  CheckCircle,
  Award,
  Zap,
  Sparkles,
  ChevronRight,
  Flame,
  Bookmark,
  Share2,
} from 'lucide-react';
import './ForumPage.css'; // Import the separate CSS file

// Mock Data - Enhanced with more diverse content
const initialThreads = [
  {
    id: 1,
    title: "🔥 The Ultimate React 2026 Roadmap: From Zero to Expert",
    content: "After 6 months of intensive learning, I've compiled the most effective path to master React. Starting from fundamentals to advanced patterns, here's what actually works...",
    author: { name: "Sarah Chen", role: "Senior Mentor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", image: true, isVerified: true },
    category: "Learning Paths",
    tags: ["react", "roadmap", "career"],
    replies: 47,
    views: 1243,
    likes: 289,
    isPinned: true,
    isHot: true,
    lastActivity: "2026-05-31T08:23:00Z",
    createdAt: "2026-05-25T09:15:00Z",
  },
  {
    id: 2,
    title: "💻 Understanding JavaScript Closures - Visual Explanation",
    content: "I created an interactive visualization to help understand lexical scoping and closures. Check it out and let me know your thoughts!",
    author: { name: "Alex Rivera", role: "Teaching Assistant", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", image: true, isVerified: true },
    category: "Technical Deep Dive",
    tags: ["javascript", "visualization"],
    replies: 23,
    views: 567,
    likes: 145,
    isPinned: false,
    isHot: true,
    lastActivity: "2026-05-30T22:05:00Z",
    createdAt: "2026-05-29T20:30:00Z",
  },
  {
    id: 3,
    title: "🚀 Showcase: Real-time AI Dashboard with Next.js 15",
    content: "Just launched my first SaaS product! Built with Next.js, Tailwind, and OpenAI API. Would love feedback from the community.",
    author: { name: "Maya Johnson", role: "Pro Developer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", image: true, isVerified: true },
    category: "Project Showcase",
    tags: ["nextjs", "ai", "showcase"],
    replies: 34,
    views: 892,
    likes: 312,
    isPinned: false,
    isHot: true,
    lastActivity: "2026-05-31T00:45:00Z",
    createdAt: "2026-05-27T12:00:00Z",
  },
  {
    id: 4,
    title: "💡 Feature Request: Advanced DSA Module with LeetCode Integration",
    content: "Would love to see more graph algorithms and dynamic programming problems with built-in code testing.",
    author: { name: "Daniel Kim", role: "Student", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", image: true, isVerified: false },
    category: "Feedback",
    tags: ["dsa", "feature"],
    replies: 12,
    views: 234,
    likes: 67,
    isPinned: false,
    isHot: false,
    lastActivity: "2026-05-30T18:10:00Z",
    createdAt: "2026-05-29T14:45:00Z",
  },
  {
    id: 5,
    title: "🎯 How I Landed a FAANG Job Using Course Projects",
    author: { name: "Emily Watson", role: "Career Coach", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", image: true, isVerified: true },
    content: "Complete breakdown of how I positioned my capstone projects to get interviews at Google, Meta, and Amazon.",
    category: "Career Success",
    tags: ["career", "interview", "faang"],
    replies: 89,
    views: 2341,
    likes: 567,
    isPinned: true,
    isHot: true,
    lastActivity: "2026-05-31T09:30:00Z",
    createdAt: "2026-05-24T11:20:00Z",
  },
  {
    id: 6,
    title: "🤔 Best Practices for State Management in Large Apps",
    content: "Zustand vs Redux vs Context - what are you using in production and why? Let's discuss!",
    author: { name: "Marcus Zhang", role: "Tech Lead", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", image: true, isVerified: true },
    category: "Technical Deep Dive",
    tags: ["react", "state-management"],
    replies: 56,
    views: 789,
    likes: 234,
    isPinned: false,
    isHot: true,
    lastActivity: "2026-05-30T15:20:00Z",
    createdAt: "2026-05-28T10:00:00Z",
  },
];

const categoriesList = [
  { name: "All", icon: "🔥", color: "gray" },
  { name: "Learning Paths", icon: "📚", color: "blue" },
  { name: "Technical Deep Dive", icon: "🔬", color: "purple" },
  { name: "Project Showcase", icon: "🎨", color: "green" },
  { name: "Career Success", icon: "💼", color: "amber" },
  { name: "Feedback", icon: "💡", color: "orange" },
];

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ForumPage = () => {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "", category: "Learning Paths", tags: "" });
  const [likedThreads, setLikedThreads] = useState({});
  const [savedThreads, setSavedThreads] = useState({});

  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === "All" || thread.category === selectedCategory;
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isHot && !b.isHot) return -1;
    if (!a.isHot && b.isHot) return 1;
    return new Date(b.lastActivity) - new Date(a.lastActivity);
  });

  const handleLike = (threadId) => {
    setLikedThreads(prev => ({ ...prev, [threadId]: !prev[threadId] }));
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.id === threadId
          ? { ...thread, likes: thread.likes + (likedThreads[threadId] ? -1 : 1) }
          : thread
      )
    );
  };

  const handleSave = (threadId) => {
    setSavedThreads(prev => ({ ...prev, [threadId]: !prev[threadId] }));
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) return;
    
    const newId = Math.max(...threads.map(t => t.id)) + 1;
    const tagArray = newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const threadToAdd = {
      id: newId,
      title: newThread.title,
      content: newThread.content,
      author: { name: "You", role: "Community Member", avatar: null, image: false, isVerified: false },
      category: newThread.category,
      tags: tagArray.length ? tagArray : ["general"],
      replies: 0,
      views: 0,
      likes: 0,
      isPinned: false,
      isHot: false,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setThreads([threadToAdd, ...threads]);
    setIsModalOpen(false);
    setNewThread({ title: "", content: "", category: "Learning Paths", tags: "" });
  };

  return (
    <div className="forum-container">
      {/* Hero Section with Gradient */}
      <div className="forum-hero">
        <div className="forum-hero-overlay"></div>
        <div className="forum-hero-blur-1"></div>
        <div className="forum-hero-blur-2"></div>
        
        <div className="forum-hero-content">
          <div className="forum-hero-inner">
            <div>
              <div className="forum-hero-badge">
                <Sparkles className="forum-hero-badge-icon" />
                <span className="forum-hero-badge-text">Community Hub</span>
              </div>
              <h1 className="forum-hero-title">
                CourseForge <span className="forum-hero-title-highlight">Forum</span>
              </h1>
              <p className="forum-hero-description">
                Connect with 10,000+ learners, share knowledge, and accelerate your tech career
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="forum-hero-button"
            >
              <Plus size={20} />
              Start a Discussion
            </button>
          </div>
        </div>
      </div>

      <div className="forum-main">
        {/* Stats Bar */}
        <div className="forum-stats-grid">
          <div className="forum-stat-card">
            <div className="forum-stat-content">
              <div className="forum-stat-icon forum-stat-icon-indigo">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="forum-stat-value">{threads.reduce((acc, t) => acc + t.replies, 0)}</p>
                <p className="forum-stat-label">Total Replies</p>
              </div>
            </div>
          </div>
          <div className="forum-stat-card">
            <div className="forum-stat-content">
              <div className="forum-stat-icon forum-stat-icon-emerald">
                <Users size={20} />
              </div>
              <div>
                <p className="forum-stat-value">10.2k</p>
                <p className="forum-stat-label">Active Members</p>
              </div>
            </div>
          </div>
          <div className="forum-stat-card">
            <div className="forum-stat-content">
              <div className="forum-stat-icon forum-stat-icon-amber">
                <Flame size={20} />
              </div>
              <div>
                <p className="forum-stat-value">+342</p>
                <p className="forum-stat-label">New Posts (Week)</p>
              </div>
            </div>
          </div>
          <div className="forum-stat-card">
            <div className="forum-stat-content">
              <div className="forum-stat-icon forum-stat-icon-purple">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="forum-stat-value">#1</p>
                <p className="forum-stat-label">Learning Community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="forum-search-section">
          <div className="forum-search-wrapper">
            <Search className="forum-search-icon" />
            <input
              type="text"
              placeholder="Search discussions, tags, or topics..."
              className="forum-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="forum-categories">
            {categoriesList.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`forum-category-btn ${
                  selectedCategory === cat.name
                    ? "forum-category-btn-active"
                    : "forum-category-btn-inactive"
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Threads Grid */}
        <div className="forum-threads">
          {sortedThreads.length === 0 ? (
            <div className="forum-empty-state">
              <MessageSquare className="forum-empty-icon" />
              <h3 className="forum-empty-title">No discussions found</h3>
              <p className="forum-empty-text">Try a different search or start a new conversation</p>
            </div>
          ) : (
            sortedThreads.map((thread) => (
              <div key={thread.id} className="forum-thread-card">
                <div className="forum-thread-card-inner">
                  <div className="forum-thread-header">
                    {/* Avatar */}
                    <div className="forum-avatar">
                      {thread.author.image ? (
                        <img src={thread.author.avatar} alt={thread.author.name} className="forum-avatar-img" />
                      ) : (
                        <div className="forum-avatar-placeholder">
                          {thread.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="forum-thread-content">
                      <div className="forum-thread-badges">
                        {thread.isPinned && (
                          <span className="forum-badge-pinned">
                            <Pin size={12} /> Pinned
                          </span>
                        )}
                        {thread.isHot && (
                          <span className="forum-badge-hot">
                            <Flame size={12} /> Hot
                          </span>
                        )}
                        <span className="forum-badge-category">
                          {thread.category}
                        </span>
                        {thread.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="forum-badge-tag">#{tag}</span>
                        ))}
                      </div>
                      
                      <h2 className="forum-thread-title">
                        {thread.title}
                      </h2>
                      <p className="forum-thread-excerpt">{thread.content}</p>
                      
                      {/* Author and Meta */}
                      <div className="forum-thread-meta">
                        <div className="forum-meta-author">
                          <span className="forum-meta-name">{thread.author.name}</span>
                          {thread.author.isVerified && <CheckCircle className="forum-meta-verified" />}
                          <span className="forum-meta-role">• {thread.author.role}</span>
                        </div>
                        <div className="forum-meta-item">
                          <Calendar size={12} />{formatRelativeTime(thread.createdAt)}
                        </div>
                        <div className="forum-meta-item">
                          <MessageCircle size={12} />{thread.replies} replies
                        </div>
                        <div className="forum-meta-item">
                          <Eye size={12} />{thread.views} views
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="forum-thread-actions">
                      <button
                        onClick={() => handleLike(thread.id)}
                        className={`forum-like-btn ${
                          likedThreads[thread.id] ? "forum-like-btn-active" : ""
                        }`}
                      >
                        <ThumbsUp className={likedThreads[thread.id] ? "forum-like-icon-active" : ""} size={16} />
                        <span className="text-sm font-medium">{thread.likes}</span>
                      </button>
                      <button
                        onClick={() => handleSave(thread.id)}
                        className={`forum-save-btn ${
                          savedThreads[thread.id] ? "forum-save-btn-active" : ""
                        }`}
                      >
                        <Bookmark size={16} />
                      </button>
                      <button className="forum-share-btn">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="forum-thread-footer">
                  <div className="forum-footer-activity">
                    <MessageCircle size={14} />
                    <span>Last activity {formatRelativeTime(thread.lastActivity)}</span>
                  </div>
                  <button className="forum-footer-link">
                    Join Discussion <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Sidebar Widgets */}
        <div className="forum-widgets">
          <div className="forum-widget-colspan">
            <div className="forum-widget-contributors">
              <h3 className="forum-widget-title">
                <Award size={20} className="text-amber-500" /> 🏆 Top Contributors - May 2026
              </h3>
              <div className="forum-contributors-list">
                {[
                  { name: "Sarah Chen", points: 1247, badge: "🥇", contributions: 45 },
                  { name: "Emily Watson", points: 1098, badge: "🥈", contributions: 38 },
                  { name: "Maya Johnson", points: 956, badge: "🥉", contributions: 32 },
                  { name: "Alex Rivera", points: 823, badge: "⭐", contributions: 28 },
                ].map((user, idx) => (
                  <div key={idx} className="forum-contributor-item">
                    <div className="forum-contributor-info">
                      <span className="forum-contributor-badge">{user.badge}</span>
                      <div>
                        <p className="forum-contributor-name">{user.name}</p>
                        <p className="forum-contributor-stats">{user.contributions} helpful answers</p>
                      </div>
                    </div>
                    <span className="forum-contributor-points">{user.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="forum-widget-tips">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} className="text-amber-600" />
              <h3 className="font-bold text-gray-800">⚡ Quick Tips</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">Get the most out of the community:</p>
            <ul className="forum-tips-list">
              <li>• Use search before posting</li>
              <li>• Be detailed in your questions</li>
              <li>• Upvote helpful answers</li>
              <li>• Share your projects for feedback</li>
            </ul>
            <button className="forum-guidelines-btn">Community Guidelines →</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="forum-modal-overlay">
          <div className="forum-modal">
            <div className="forum-modal-header">
              <h2 className="forum-modal-title">
                <Sparkles size={20} className="text-indigo-600" /> Start a new discussion
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="forum-modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateThread}>
              <div className="forum-modal-form">
                <input 
                  type="text" 
                  required 
                  placeholder="Discussion title *" 
                  className="forum-modal-input" 
                  value={newThread.title} 
                  onChange={(e) => setNewThread({...newThread, title: e.target.value})} 
                />
                <textarea 
                  rows={4} 
                  required 
                  placeholder="Share your thoughts, question, or project... *" 
                  className="forum-modal-textarea" 
                  value={newThread.content} 
                  onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                />
                <div className="forum-modal-grid">
                  <select 
                    value={newThread.category} 
                    onChange={(e) => setNewThread({...newThread, category: e.target.value})} 
                    className="forum-modal-select"
                  >
                    {categoriesList.filter(c => c.name !== "All").map(cat => (
                      <option key={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Tags (comma separated)" 
                    className="forum-modal-input" 
                    value={newThread.tags} 
                    onChange={(e) => setNewThread({...newThread, tags: e.target.value})} 
                  />
                </div>
              </div>
              <div className="forum-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="forum-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="forum-modal-submit">
                  <Send size={16} /> Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;