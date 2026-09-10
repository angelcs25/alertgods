import { useState, useEffect } from "react";
import LandingPage          from "./pages/LandingPage";
import SubscriberDashboard  from "./pages/SubscriberDashboard";
import AboutPage            from "./pages/AboutPage";
import AdminPanel           from "./pages/AdminPanel";
import AdminGate            from "./components/AdminGate";
import LearnPage            from "./pages/LearnPage";
import LessonViewer         from "./pages/LessonViewer";
import FreeSignupPage       from "./pages/FreeSignupPage";
import ProSignupPage        from "./pages/ProSignupPage";
import LoginPage            from "./pages/LoginPage";
import useAuth              from "./services/useAuth";

function getPage() {
  const hash = window.location.hash.replace("#", "").trim();
  return hash === "" ? "/" : hash;
}

export default function App() {
  const [page, setPage]             = useState(getPage);
  const [allSignals, setAllSignals] = useState([]);
  const { isLoggedIn }              = useAuth();

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(path) {
    window.location.hash = path;
    setPage(path);
    window.scrollTo(0, 0);
  }

  function handlePublish(signal) {
    setAllSignals(prev => [signal, ...prev]);
  }

  // ── Lesson routes — must be above switch ─────────────────────────────────
  if (page.startsWith("/learn/")) {
    const lessonId = page.replace("/learn/", "");
    return (
      <LessonViewer
        lessonId={lessonId}
        onBack={(id) => { if (id) navigate(`/learn/${id}`); else navigate("/learn"); }}
        onNavigate={navigate}
      />
    );
  }

  // ── Dashboard — requires login ────────────────────────────────────────────
  if (page === "/dashboard") {
    if (!isLoggedIn) return <LoginPage onNavigate={navigate} onLogin={() => navigate("/dashboard")} />;
    return <SubscriberDashboard onNavigate={navigate} />;
  }

  switch (page) {
    case "/":
    case "/home":
      return <LandingPage onNavigate={navigate} />;

    case "/about":
      return <AboutPage onNavigate={navigate} />;

    case "/learn":
    case "/learn-to-trade":
      return <LearnPage onNavigate={navigate} />;

    case "/login":
      if (isLoggedIn) { navigate("/dashboard"); return null; }
      return <LoginPage onNavigate={navigate} onLogin={() => navigate("/dashboard")} />;

    case "/signup/free":
      return <FreeSignupPage onNavigate={navigate} />;

    case "/signup/pro":
      return <ProSignupPage onNavigate={navigate} />;

    case "/signup/success":
      return (
        <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#050c18", color: "#c8d8e8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: "#e8f0f8", marginBottom: 12 }}>
              Welcome to Pro
            </h1>
            <p style={{ fontSize: 15, color: "#5a7a9a", marginBottom: 32, lineHeight: 1.8 }}>
              Your subscription is active. Log in with your email to access the signal dashboard.
            </p>
            <button onClick={() => navigate("/login")} style={{ background: "#00c97a", color: "#030f08", border: "none", padding: "14px 32px", borderRadius: 3, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      );

    case "/compose":
    case "/admin":
      return (
        <AdminGate>
          <AdminPanel
            onPublish={handlePublish}
            onNavigate={navigate}
            allSignals={allSignals}
          />
        </AdminGate>
      );

    default:
      return <LandingPage onNavigate={navigate} />;
  }
}