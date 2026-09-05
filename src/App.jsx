import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AboutPage from "./pages/AboutPage";
import AdminPanel from "./pages/AdminPanel";
import AdminGate from "./components/AdminGate";
import LearnPage from "./pages/LearnPage";
import FreeSignupPage from "./pages/FreeSignupPage";
import ProSignupPage from "./pages/ProSignupPage";
import LessonViewer from "./pages/LessonViewer";

function getPage() {
  const hash = window.location.hash.replace("#", "").trim();
  return hash === "" ? "/" : hash;
}

export default function App() {
  const [page, setPage] = useState(getPage);
  const [allSignals, setAllSignals] = useState([]);

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(path) {
    window.location.hash = path;
    setPage(path);
  }

  function handlePublish(signal) {
    setAllSignals(prev => [signal, ...prev]);
  }

  
  if (page.startsWith("/learn/")) {
    const lessonId = page.replace("/learn/", "");
    return (
      <LessonViewer
        lessonId={lessonId}
        onBack={(id) => {
          if (id) navigate(`/learn/${id}`);
          else navigate("/learn");
        }}
        onNavigate={navigate}
      />
    );
  }

  
  switch (page) {
    case "/":
    case "/home":
      return <LandingPage onNavigate={navigate} />;

    case "/dashboard":
      return <Dashboard extraSignals={allSignals} onNavigate={navigate} />;

    case "/about":
      return <AboutPage onNavigate={navigate} />;

    case "/learn":
    case "/learn-to-trade":
      return <LearnPage onNavigate={navigate} />;

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
    case "/signup/free":
      return<FreeSignupPage onNavigate={navigate}/>;
    case "/signup/pro":
      return <ProSignupPage onNavigate={navigate}/>;
    default:
      return <LandingPage onNavigate={navigate} />;
  }
}
