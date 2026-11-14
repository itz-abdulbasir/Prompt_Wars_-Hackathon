import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card } from "../components/ui";
export default function LandingPage() {
  return (
    <div className="landing">
      <div className="hero">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> INTERACTIVE PROTOTYPE
          </span>
          <h1>
            Care doesn’t end
            <br />
            at the <em>consultation.</em>
          </h1>
          <p className="hero-copy">
            Continuity of care, beyond the consultation. One shared place for
            daily care, recovery check-ins, and the follow-ups that matter.
          </p>
          <a href="#choose" className="button primary">
            Explore CareLoop <ArrowRight size={18} />
          </a>
          <div className="trust">
            <ShieldCheck size={17} /> Fictional patients. Real possibilities.
          </div>
        </div>
        <div className="journey">
          <div className="journey-top">
            <HeartPulse size={24} />
            <span>THE CARELOOP APPROACH</span>
            <span className="pill">Connected care</span>
          </div>
          <h2>
            A little follow-up.
            <br />A stronger connection.
          </h2>
          <div className="journey-step">
            <span>01</span>
            <div>
              <b>A clear plan</b>
              <p>Keep daily care and appointments together.</p>
            </div>
            <CalendarDays />
          </div>
          <div className="journey-step">
            <span>02</span>
            <div>
              <b>A simple check-in</b>
              <p>Make recovery updates easier to share.</p>
            </div>
            <ClipboardCheck />
          </div>
          <div className="journey-step">
            <span>03</span>
            <div>
              <b>A complete picture</b>
              <p>Help providers see recorded follow-up gaps.</p>
            </div>
            <Users />
          </div>
          <div className="journey-note">
            Designed to connect the moments between visits.
          </div>
        </div>
      </div>
      <section id="choose" className="choose">
        <div className="section-title">
          <div>
            <span className="eyebrow">TWO PERSPECTIVES. ONE CARE JOURNEY.</span>
            <h2>Choose your demo experience</h2>
          </div>
          <span className="stage-chip">Interactive demo · 8 patients</span>
        </div>
        <div className="role-grid">
          <Link to="/patient" className="role-card">
            <span className="role-icon">
              <HeartPulse />
            </span>
            <div>
              <h3>For patients</h3>
              <p>
                A clearer view of your daily care, appointments, and recovery
                updates.
              </p>
              <span className="role-link">
                Continue as Patient <ArrowRight size={17} />
              </span>
            </div>
            <ArrowUpRight className="corner" />
          </Link>
          <Link to="/provider" className="role-card">
            <span className="role-icon">
              <Users />
            </span>
            <div>
              <h3>For providers</h3>
              <p>
                A shared view of patient activity and the follow-ups that need a
                closer look.
              </p>
              <span className="role-link">
                Continue as Provider <ArrowRight size={17} />
              </span>
            </div>
            <ArrowUpRight className="corner" />
          </Link>
        </div>
      </section>
      <Card className="scope-note">
        <ShieldCheck />
        <p>
          <b>A thoughtful prototype, with clear boundaries.</b> This prototype
          uses synthetic data. Patient and provider experiences share the same
          recorded activity. CareGap Radar highlights recorded follow-up gaps;
          it does not diagnose conditions or predict medical risk.
        </p>
      </Card>
    </div>
  );
}
