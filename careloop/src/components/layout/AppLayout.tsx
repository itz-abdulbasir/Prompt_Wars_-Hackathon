import { Link, Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { getStorageNotice, resetDemo } from "../../services/storage";
export function AppLayout() {
  const { pathname } = useLocation();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    document.title = `${pathname.startsWith("/provider") ? "Provider" : pathname === "/patient" ? "Patient" : "Overview"} | CareLoop`;
    document.getElementById("main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  function restart() {
    if (window.confirm("Reset all saved demo activity in this browser? This restores eight fictional patients with dates relative to today.")) {
      resetDemo();
      setRevision((value) => value + 1);
    }
  }
  const notice = getStorageNotice();
  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <HeartPulse size={23} />
          </span>
          CareLoop<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/patient">Patient</NavLink>
          <NavLink to="/provider">Provider</NavLink>
        </nav>
        <span className="demo-label">SYNTHETIC DATA</span>
      </header>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet key={revision} />
      </main>
      <footer>
        <span>CareLoop · Continuity, connected.</span>
        <button className="button secondary reset-demo" onClick={restart}>Reset demo data</button>
        <span>
          Hackathon prototype · Not a medical device or diagnostic system.
        </span>
      </footer>
    </>
  );
}
