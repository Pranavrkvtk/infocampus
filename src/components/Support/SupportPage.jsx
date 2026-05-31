import { useState, useEffect } from "react";
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Search,
  Send,
  FileText,
  Video,
  BookOpen,
  Users,
  Globe,
  Award,
  Shield,
  Zap,
  MessageSquare,
  ExternalLink,
  Download,
  CreditCard,
  UserCheck,
  Lock,
  FileQuestion
} from 'lucide-react';

// ==================== ANIMATED SECTION COMPONENT ====================
function AnimatedSection({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`animated-section ${isVisible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
      <style>{`
        .animated-section {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animated-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

// ==================== FAQ ACCORDION COMPONENT ====================
function FAQItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div 
      className={`faq-item ${isOpen ? "open" : ""}`}
      style={{
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: isOpen ? "#f9fafb" : "transparent",
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={onToggle}
        className="faq-question"
        style={{
          width: "100%",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
          color: "#1f2937",
          textAlign: "left",
          transition: "all 0.2s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#4f46e5", fontWeight: 700 }}>{String(index + 1).padStart(2, '0')}.</span>
          {question}
        </span>
        <span style={{ 
          fontSize: "24px", 
          color: "#4f46e5",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease"
        }}>
          ↓
        </span>
      </button>
      <div 
        className="faq-answer"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <p style={{ paddingBottom: "20px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
          {answer}
        </p>
      </div>
      <style>{`
        .faq-item:hover {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}

// ==================== SUPPORT CARD COMPONENT ====================
function SupportCard({ icon: Icon, title, description, actionText, onClick, color = "#4f46e5" }) {
  return (
    <div 
      className="support-card"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        textAlign: "center",
        transition: "all 0.3s ease",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #f3f4f6",
        height: "100%",
      }}
      onClick={onClick}
    >
      <div 
        className="support-card-icon"
        style={{
          width: "60px",
          height: "60px",
          background: `${color}10`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          transition: "all 0.3s ease",
        }}
      >
        <Icon size={28} color={color} />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "10px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.6" }}>
        {description}
      </p>
      <span 
        style={{
          color: color,
          fontWeight: 600,
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {actionText} <ChevronRight size={14} />
      </span>
      <style>{`
        .support-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -12px rgba(0,0,0,0.15);
          border-color: ${color}40;
        }
        .support-card:hover .support-card-icon {
          transform: scale(1.1);
          background: ${color}20;
        }
      `}</style>
    </div>
  );
}

// ==================== RESOURCE CARD COMPONENT ====================
function ResourceCard({ icon: Icon, title, description, link, color = "#4f46e5" }) {
  return (
    <div 
      className="resource-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: "white",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        border: "1px solid #f3f4f6",
      }}
    >
      <div style={{ 
        width: "48px", 
        height: "48px", 
        background: `${color}10`, 
        borderRadius: "12px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1f2937", marginBottom: "4px" }}>
          {title}
        </h4>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          {description}
        </p>
      </div>
      <ChevronRight size={18} color="#9ca3af" />
      <style>{`
        .resource-card:hover {
          transform: translateX(8px);
          border-color: ${color}40;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
}

// ==================== MAIN SUPPORT PAGE ====================
export default function SupportPage({ isMobile, onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I access my purchased courses?",
      answer: "After purchase, your courses will appear instantly in your dashboard under 'My Courses'. You can access them anytime by logging into your account and clicking on the course title."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee for all courses. If you're not satisfied, contact our support team within 30 days of purchase for a full refund."
    },
    {
      question: "How long do I have access to the course materials?",
      answer: "You get lifetime access to all purchased courses. This includes all future updates and additions to the course content at no extra cost."
    },
    {
      question: "Are there any prerequisites for the courses?",
      answer: "Each course has its own prerequisites listed in the description. Most beginner courses require basic computer knowledge, while advanced courses may need prior certification knowledge."
    },
    {
      question: "Do you provide certificates upon completion?",
      answer: "Yes! Upon completing a course, you'll receive a verified certificate that you can share on LinkedIn and include in your resume."
    },
    {
      question: "How can I contact an instructor?",
      answer: "Each course has a discussion forum where you can ask questions. Instructors typically respond within 24-48 hours. For urgent matters, contact our support team."
    },
    {
      question: "Can I download videos for offline viewing?",
      answer: "Yes, our mobile app allows you to download course videos for offline viewing. The desktop version requires an internet connection."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise purchases."
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      actionText: "Start Chat →",
      color: "#3b82f6",
      onClick: () => window.open("https://tawk.to/chat", "_blank")
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get response within 24 hours",
      actionText: "Send Email →",
      color: "#8b5cf6",
      onClick: () => setShowContactForm(true)
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "24/7 priority support line",
      actionText: "Call Now →",
      color: "#10b981",
      onClick: () => window.location.href = "tel:+18005551234"
    },
    {
      icon: FileQuestion,
      title: "Knowledge Base",
      description: "Browse articles and tutorials",
      actionText: "Browse Articles →",
      color: "#f59e0b",
      onClick: () => window.open("/knowledge-base", "_blank")
    }
  ];

  const resources = [
    { icon: FileText, title: "Getting Started Guide", description: "Learn how to navigate the platform", color: "#4f46e5", link: "/guides/getting-started" },
    { icon: Video, title: "Video Tutorials", description: "Watch step-by-step guides", color: "#ec4899", link: "/tutorials" },
    { icon: BookOpen, title: "Documentation", description: "Detailed technical documentation", color: "#06b6d4", link: "/docs" },
    { icon: Users, title: "Community Forum", description: "Ask questions and share knowledge", color: "#10b981", link: "/forum" },
    { icon: Download, title: "Resource Library", description: "Downloadable materials and tools", color: "#f59e0b", link: "/resources" },
    { icon: CreditCard, title: "Billing & Invoices", description: "Manage payments and subscriptions", color: "#ef4444", link: "/billing" },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setShowContactForm(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
        padding: isMobile ? "60px 20px" : "80px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", top: "-100px", right: "-100px" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", bottom: "-50px", left: "-50px" }} />
        
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "50px", marginBottom: "24px" }}>
            <HelpCircle size={16} color="white" />
            <span style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>24/7 Support Available</span>
          </div>
          <h1 style={{ color: "white", fontSize: isMobile ? "36px" : "56px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.02em" }}>
            How Can We Help?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: isMobile ? "16px" : "18px", lineHeight: "1.6", marginBottom: "32px" }}>
            Get instant answers to your questions, access resources, or contact our dedicated support team.
          </p>
          
          {/* Search Bar */}
          <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto" }}>
            <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search FAQs, guides, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 20px 14px 48px",
                borderRadius: "50px",
                border: "none",
                fontSize: "16px",
                outline: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 40px" }}>
        
        {/* Support Channels */}
        <AnimatedSection delay={100}>
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 700, color: "#1f2937", textAlign: "center", marginBottom: "12px" }}>
              Get Support
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "40px" }}>
            Choose the best way to reach us
          </p>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", 
            gap: "24px" 
          }}>
            {supportChannels.map((channel, idx) => (
              <SupportCard key={idx} {...channel} />
            ))}
          </div>
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection delay={200}>
          <div style={{ 
            background: "white", 
            borderRadius: "24px", 
            padding: isMobile ? "24px" : "40px",
            marginBottom: "60px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: 700, color: "#1f2937", marginBottom: "12px" }}>
                Frequently Asked Questions
              </h2>
              <p style={{ color: "#6b7280" }}>
                Find quick answers to common questions
              </p>
            </div>
            
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#9ca3af" }}>No FAQs found matching your search.</p>
              </div>
            ) : (
              <div>
                {filteredFaqs.map((faq, idx) => (
                  <FAQItem
                    key={idx}
                    index={idx}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === idx}
                    onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Resources Section */}
        <AnimatedSection delay={300}>
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: 700, color: "#1f2937", textAlign: "center", marginBottom: "12px" }}>
              Helpful Resources
            </h2>
            <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "40px" }}>
              Everything you need to succeed
            </p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
              gap: "16px" 
            }}>
              {resources.map((resource, idx) => (
                <ResourceCard key={idx} {...resource} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Status & Stats */}
        <AnimatedSection delay={400}>
          <div style={{ 
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            borderRadius: "24px",
            padding: isMobile ? "32px 20px" : "48px",
            textAlign: "center",
            color: "white",
            marginBottom: "60px"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>99.9%</div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Uptime Guarantee</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>&lt;24h</div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Response Time</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>50K+</div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Happy Students</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>4.9★</div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Customer Rating</div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowContactForm(false);
            }}
          >
            <div style={{
              background: "white",
              borderRadius: "24px",
              maxWidth: "500px",
              width: "100%",
              overflow: "hidden",
              animation: "fadeIn 0.2s ease-out",
            }}>
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <CheckCircle size={64} color="#10b981" style={{ marginBottom: "20px" }} />
                  <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>Message Sent!</h3>
                  <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setShowContactForm(false)}
                    style={{
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Contact Support</h3>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>Fill out the form and we'll respond shortly</p>
                  </div>
                  <form onSubmit={handleFormSubmit} style={{ padding: "24px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Message *</label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        style={{ padding: "10px 20px", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <Send size={16} /> Send Message
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#1f2937", padding: "40px 20px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
        <p>© 2025 CourseForge — All rights reserved</p>
        <p style={{ marginTop: "8px" }}>
          <span style={{ margin: "0 12px" }}>Privacy Policy</span>
          <span>Terms of Service</span>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}