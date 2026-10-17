import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  UsersRound,
  LayoutDashboard,
  Compass,
  PlusCircle,
  Users,
  GitCompareArrows,
  UserRound,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  Layers3,
  UserPlus,
  UserMinus,
  CirclePlus,
  SlidersHorizontal,
  Code2,
  Clock3,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Menu,
  X,
  Sparkles,
  Cpu,
  Trash2,
  RefreshCw,
  Pencil,
  ShieldCheck,
  Activity,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import {
  authApi,
  studentApi,
  skillApi,
  teamApi,
  matchmakingApi,
  queueApi,
  friendlyError,
  unwrapList,
  API_BASE,
} from "./api.js";

const demoTeams = [
  {
    id: 1,
    name: "Campus Navigation AI",
    projectTitle: "Smart Campus Navigator",
    description:
      "A campus navigation and accessibility assistant powered by data and machine learning.",
    maxMembersCount: 5,
    membersCount: 3,
    joiningMode: "MANUAL",
    requiredSkills: ["Java", "Spring Boot", "React", "Machine Learning"],
    leaderName: "Riya Sharma",
    status: "OPEN",
  },
  {
    id: 2,
    name: "EcoTrack",
    projectTitle: "Sustainable Campus Tracker",
    description:
      "Track campus waste, energy and sustainability initiatives in one place.",
    maxMembersCount: 4,
    membersCount: 2,
    joiningMode: "MANUAL",
    requiredSkills: ["Python", "Data Analytics", "UI/UX"],
    leaderName: "Kabir Singh",
    status: "OPEN",
  },
  {
    id: 3,
    name: "SecureStack",
    projectTitle: "Student Security Toolkit",
    description:
      "A practical toolkit for improving application security awareness.",
    maxMembersCount: 4,
    membersCount: 4,
    joiningMode: "INVITE_ONLY",
    requiredSkills: ["Cybersecurity", "Java", "SQL"],
    leaderName: "Ananya Rao",
    status: "FULL",
  },
  {
    id: 4,
    name: "StudySync",
    projectTitle: "Collaborative Study Planner",
    description:
      "A study planner for coordinating assignments and peer learning.",
    maxMembersCount: 5,
    membersCount: 2,
    joiningMode: "MANUAL",
    requiredSkills: ["React", "Node.js", "UI/UX"],
    leaderName: "Dev Mehta",
    status: "OPEN",
  },
];
const skills = [
  "Java",
  "Spring Boot",
  "React",
  "MySQL",
  "Python",
  "Machine Learning",
  "UI/UX",
  "Cybersecurity",
  "Data Analytics",
  "REST APIs",
  "Docker",
  "C++",
];
const getName = (x) =>
  x?.name || x?.teamName || x?.projectTitle || "Untitled team";
const getMembers = (x) =>
  Number(x?.membersCount ?? x?.currentMembers ?? x?.members?.length ?? 0);
const getMax = (x) =>
  Number(x?.maxMembersCount ?? x?.maxMembers ?? x?.capacity ?? 4);
const getRequired = (x) =>
  x?.requiredSkills?.map?.((s) => (typeof s === "string" ? s : s.name)) ||
  x?.skills?.map?.((s) => (typeof s === "string" ? s : s.name)) ||
  [];
const getId = (x) => x?.id ?? x?.teamId;
const getCreatedTeamId = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.team,
    response?.data?.team,
    response?.data?.data,
    response?.data?.data?.team,
  ];
  const id = candidates.map(getId).find((value) => value !== undefined && value !== null && String(value).trim());
  return id === undefined ? null : String(id);
};
const personIdentifiers = (person) =>
  [
    ...(typeof person === "string" || typeof person === "number"
      ? [person]
      : []),
    person?.id,
    person?.studentId,
    person?.userId,
    person?.email,
    person?.student?.id,
    person?.student?.studentId,
    person?.user?.id,
    person?.user?.studentId,
    person?.user?.email,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map((value) => String(value).trim().toLowerCase());
const samePerson = (first, second) => {
  const identifiers = new Set(personIdentifiers(first));
  return personIdentifiers(second).some((value) => identifiers.has(value));
};
const isAdminUser = (user) =>
  [
    user?.role,
    user?.user?.role,
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(user?.authorities) ? user.authorities : []),
  ].some(
    (role) =>
      String(role?.authority || role || "")
        .toUpperCase()
        .replace(/^ROLE_/, "") === "ADMIN",
  );
const getMemberStudent = (member) =>
  member?.student ||
  member?.user?.student ||
  member?.user ||
  member?.studentProfile ||
  member ||
  {};
const getStudentProfile = (response) =>
  response?.student ||
  response?.data?.student ||
  response?.data?.data?.student ||
  response?.data?.data ||
  response?.data ||
  response;
const getMemberStudentId = (member) => {
  const nestedStudent = member?.student || member?.user?.student || member?.user;
  return (
    nestedStudent?.id ??
    nestedStudent?.studentId ??
    member?.studentId ??
    member?.userId ??
    member?.id ??
    null
  );
};
const getStudentDisplayName = (member, index) => {
  const student = getMemberStudent(member);
  const name =
    student.name ||
    student.fullName ||
    student.studentName ||
    member?.name ||
    member?.fullName ||
    member?.studentName;
  if (name) return name;
  const firstName = student.firstName || member?.firstName;
  const lastName = student.lastName || member?.lastName;
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(" ");
  }
  const studentId = getMemberStudentId(member);
  return studentId ? `Student #${studentId}` : `Student ${index + 1}`;
};
const getTeamLeader = (team) =>
  team?.leader ||
  (team?.leaderId !== undefined ||
  team?.leaderStudentId !== undefined ||
  team?.leaderEmail
    ? {
        id: team.leaderId ?? team.leaderStudentId,
        studentId: team.leaderStudentId,
        email: team.leaderEmail,
      }
    : null);
const getTeamFromResponse = (response) =>
  response?.team ||
  response?.data?.team ||
  response?.data?.data?.team ||
  response?.data?.data ||
  response?.data ||
  response;
const isTeamLeader = (team, user) => {
  const leader = getTeamLeader(team);
  return Boolean(leader && samePerson(leader, user));
};
const tokenExists = () => Boolean(localStorage.getItem("fmt_token"));

function App() {
  const [token, setToken] = useState(tokenExists());
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fmt_user") || "null");
    } catch {
      return null;
    }
  });
  const [demoMode, setDemoMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  function onLogin(data, email) {
    const jwt =
      data?.token || data?.accessToken || data?.jwt || data?.data?.token;
    if (jwt) localStorage.setItem("fmt_token", jwt);
    const nextUser = data?.user ||
      data?.data?.user || {
        id: data?.userId,
        studentId: data?.studentId,
        student: data?.student,
        role: data?.role,
        email: data?.email || email,
        name: data?.name || email?.split("@")[0] || "Student",
      };
    localStorage.setItem("fmt_user", JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(Boolean(jwt));
    setDemoMode(false);
    navigate("/");
  }
  function logout() {
    localStorage.removeItem("fmt_token");
    localStorage.removeItem("fmt_user");
    setToken(false);
    setUser(null);
    setDemoMode(false);
    navigate("/login");
  }
  const authProps = { onLogin };
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" {...authProps} />} />
      <Route
        path="/register"
        element={<AuthPage mode="register" {...authProps} />}
      />
      <Route
        path="*"
        element={
          token || demoMode ? (
            <Shell
              user={user}
              demoMode={demoMode}
              logout={logout}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            >
              <Routes>
                <Route path="/" element={<Dashboard demoMode={demoMode} />} />
                <Route
                  path="/teams"
                  element={<ExploreTeams demoMode={demoMode} />}
                />
                <Route
                  path="/teams/new"
                  element={<CreateTeam demoMode={demoMode} />}
                />
                <Route
                  path="/teams/:teamId"
                  element={<TeamDetails user={user} demoMode={demoMode} />}
                />
                <Route
                  path="/my-teams"
                  element={<MyTeams user={user} demoMode={demoMode} />}
                />
                <Route
                  path="/matchmaking"
                  element={<Matchmaking user={user} demoMode={demoMode} />}
                />
                <Route
                  path="/profile"
                  element={<Profile user={user} demoMode={demoMode} />}
                />
                <Route
                  path="/queue"
                  element={<RequestQueue demoMode={demoMode} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Shell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function AuthPage({ mode, onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    studentId: "",
    phone: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";
  const nav = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || "");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!form.email.trim() || !form.password)
      return setError("Please enter your email and password.");
    if (isRegister && !form.name.trim())
      return setError("Please enter your full name.");
    setBusy(true);
    try {
      const payload = isRegister
        ? {
            name: form.name,
            email: form.email.trim(),
            password: form.password,
            studentId: form.studentId,
            phone: form.phone,
          }
        : { email: form.email.trim(), password: form.password };
      const res = isRegister
        ? await authApi.register(payload)
        : await authApi.login(payload);
      if (isRegister)
        nav("/login", {
          state: {
            notice: "Account created. Please sign in with your details.",
          },
        });
      else onLogin(res.data, form.email);
    } catch (err) {
      if (!isRegister && err?.response?.status === 401) {
        setError("Incorrect email or password. Please check your details and try again.");
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <section className="auth-brand">
        <div className="brand">
          <span className="brand-mark">
            <UsersRound size={21} />
          </span>
          <span>
            <b>Find My Team</b>
            <small>Campus collaboration</small>
          </span>
        </div>
        <div className="brand-copy">
          <span className="eyebrow">BUILD BETTER, TOGETHER</span>
          <h1>Turn complementary skills into exceptional college projects.</h1>
          <ul>
            <li>Discover teams aligned with your interests</li>
            <li>Match students by practical skills</li>
            <li>Plan project teams with confidence</li>
          </ul>
        </div>
        <p className="brand-foot">
          A focused workspace for project-based learning.
        </p>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">
            {isRegister ? "GET STARTED" : "WELCOME BACK"}
          </span>
          <h2>
            {isRegister ? "Create your account" : "Sign in to your workspace"}
          </h2>
          <p className="muted">
            {isRegister
              ? "Join your campus project community."
              : "Enter your college account details to continue."}
          </p>
          {isRegister && (
            <>
              <label>
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                Student ID <span className="optional">if required</span>
                <input
                  name="studentId"
                  value={form.studentId}
                  onChange={change}
                  placeholder="College student ID"
                />
              </label>
              <label>
                Phone <span className="optional">optional</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  placeholder="Phone number"
                />
              </label>
            </>
          )}
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              placeholder="you@college.edu"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              placeholder="Enter your password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </label>
          {error && (
            <div className="alert error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {notice && (
            <div className="alert success">
              <CheckCircle2 size={16} />
              {notice}
            </div>
          )}
          <button className="btn primary full" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={17} /> : null}
            {isRegister ? "Create account" : "Sign in"} <ArrowRight size={16} />
          </button>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Find My Team?"}{" "}
            <button
              type="button"
              className="text-btn"
              onClick={() => nav(isRegister ? "/login" : "/register")}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="tiny center">API base: {API_BASE}</p>
        </form>
      </section>
    </div>
  );
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teams", label: "Explore teams", icon: Compass },
  { to: "/teams/new", label: "Create team", icon: CirclePlus },
  { to: "/my-teams", label: "My teams", icon: Users },
  { to: "/matchmaking", label: "Matchmaking", icon: GitCompareArrows },
  { to: "/queue", label: "Request queue", icon: ListChecks },
  { to: "/profile", label: "My profile", icon: UserRound },
];
function Shell({
  children,
  user,
  demoMode,
  logout,
  sidebarOpen,
  setSidebarOpen,
}) {
  const location = useLocation();
  const title =
    navItems.find((n) => n.to === location.pathname)?.label ||
    (location.pathname.includes("/teams/") ? "Team details" : "Workspace");
  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand sidebar-brand">
          <span className="brand-mark">
            <UsersRound size={21} />
          </span>
          <span>
            <b>Find My Team</b>
            <small>Campus collaboration</small>
          </span>
          <button
            className="icon-btn mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={17} />
          </button>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <n.icon size={17} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {(user?.name || user?.email || "S").slice(0, 1).toUpperCase()}
            </div>
            <div className="user-mini-copy">
              <b>{user?.name || user?.email || "Student"}</b>
              <small>Student workspace</small>
            </div>
            <button className="icon-btn" onClick={logout} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
          <p className="tiny">Find your people. Build something great.</p>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div>
              <span className="tiny crumb">Find My Team / </span>
              <b>{title}</b>
            </div>
          </div>
          <div className="topbar-right">
            {demoMode ? (
              <span className="demo-pill">
                <span /> Demo preview
              </span>
            ) : (
              <span className="api-pill">
                <span /> API configured
              </span>
            )}
            <button
              className="icon-btn"
              title="Refresh page"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
            </button>
            <div className="avatar">
              {(user?.name || user?.email || "S").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
        <footer className="app-footer">
          <span>© 2026 Find My Team</span>
          <span>Built for better collaboration</span>
        </footer>
      </main>
    </div>
  );
}

function useTeams(demoMode) {
  const [teams, setTeams] = useState(demoMode ? demoTeams : []);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState("");
  const refresh = async () => {
    if (demoMode) {
      setTeams(demoTeams);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await teamApi.list({ page: 0, size: 50 });
      setTeams(unwrapList(res.data));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, [demoMode]);
  return { teams, setTeams, loading, error, refresh };
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function StatCard({ label, value, detail, icon: Icon, tone = "" }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}
function Status({ children }) {
  const cls = String(children || "OPEN")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return (
    <span className={`status status-${cls}`}>
      {String(children || "OPEN").replaceAll("_", " ")}
    </span>
  );
}
function SkillPills({ items = [], expandable = false }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = expandable && !showAll ? items.slice(0, 5) : items;
  return (
    <div className={`skill-list ${expandable ? "skill-list-expandable" : ""}`}>
      {items.length ? (
        visibleItems.map((s, i) => (
          <span className="skill" key={`${s}-${i}`}>
            {s}
          </span>
        ))
      ) : (
        <span className="muted tiny">Skills not specified</span>
      )}
      {expandable && items.length > 5 && (
        <button
          className="skill-list-toggle"
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((visible) => !visible)}
        >
          {showAll ? "Show less" : `Show all skills (${items.length})`}
        </button>
      )}
      {!expandable && items.length > 5 && (
        <span className="skill">+{items.length - 5}</span>
      )}
    </div>
  );
}
function ErrorBox({ message, retry }) {
  return (
    <div className="state-box error-state">
      <AlertCircle size={23} />
      <b>We couldn't load this data</b>
      <p>{message}</p>
      {retry && (
        <button className="btn secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
function EmptyState({ icon: Icon = Layers3, title, description, action }) {
  return (
    <div className="state-box">
      <span className="empty-icon">
        <Icon size={23} />
      </span>
      <b>{title}</b>
      <p>{description}</p>
      {action}
    </div>
  );
}
function TeamCard({ team, onJoin, demoMode }) {
  const count = getMembers(team),
    max = getMax(team),
    open = (team.status || "").toUpperCase() !== "CLOSED" && count < max;
  return (
    <article className="team-card">
      <div className="team-card-top">
        <div className="team-logo">
          <Code2 size={20} />
        </div>
        <Status>{team.status || (open ? "OPEN" : "FULL")}</Status>
      </div>
      <h3>{getName(team)}</h3>
      <p className="team-project">{team.projectTitle || "College project"}</p>
      <p className="team-desc">
        {team.description ||
          "A team looking for students with complementary skills."}
      </p>
      <SkillPills items={getRequired(team)} />
      <div className="team-card-foot">
        <span className="member-count">
          <Users size={15} />
          {count}/{max} members
        </span>
        <button
          className="btn small primary"
          onClick={() => onJoin(team)}
        >
          View team <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}
function Dashboard({ demoMode }) {
  const { teams, loading, error, refresh } = useTeams(demoMode);
  const open = teams.filter(
    (t) =>
      getMembers(t) < getMax(t) &&
      String(t.status || "OPEN").toUpperCase() !== "CLOSED",
  ).length;
  const members = teams.reduce((n, t) => n + getMembers(t), 0);
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        eyebrow="STUDENT WORKSPACE"
        title="Welcome back."
        description="Find the right people and turn your next college project into something great."
        action={
          <button
            className="btn primary"
            onClick={() => navigate("/teams/new")}
          >
            <PlusCircle size={16} /> Create a team
          </button>
        }
      />
      <div className="welcome-banner">
        <div className="welcome-orb">
          <Sparkles size={23} />
        </div>
        <div>
          <span className="eyebrow">YOUR NEXT PROJECT STARTS HERE</span>
          <h2>Great teams are built on complementary skills.</h2>
          <p>
            Explore campus teams, share what you're good at, and find the people
            who complete your skill set.
          </p>
        </div>
        <button className="btn white" onClick={() => navigate("/teams")}>
          Explore teams <ArrowRight size={15} />
        </button>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Available teams"
          value={loading ? "—" : open}
          detail="Teams with open positions"
          icon={Layers3}
        />
        <StatCard
          label="Teams loaded"
          value={loading ? "—" : teams.length}
          detail="From the current workspace"
          icon={UsersRound}
          tone="purple"
        />
        <StatCard
          label="Open positions"
          value={
            loading
              ? "—"
              : teams.reduce(
                  (n, t) => n + Math.max(0, getMax(t) - getMembers(t)),
                  0,
                )
          }
          detail="Room for new collaborators"
          icon={UserPlus}
          tone="green"
        />
        <StatCard
          label="Members across teams"
          value={loading ? "—" : members}
          detail="Current team membership"
          icon={Activity}
          tone="orange"
        />
      </div>
      <div className="section-heading">
        <div>
          <h2>Recently created teams</h2>
          <p>Fresh opportunities from across campus.</p>
        </div>
        <button className="text-btn" onClick={() => navigate("/teams")}>
          View all <ArrowRight size={15} />
        </button>
      </div>
      {error ? (
        <ErrorBox message={error} retry={refresh} />
      ) : loading ? (
        <LoadingState label="Loading teams…" />
      ) : teams.length ? (
        <div className="team-grid">
          {teams.slice(0, 3).map((t) => (
            <TeamCard
              key={getId(t)}
              team={t}
              onJoin={(t) => navigate(`/teams/${getId(t)}`)}
              demoMode={demoMode}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No teams yet"
          description="Be the first to create a project team."
          action={
            <button
              className="btn primary"
              onClick={() => navigate("/teams/new")}
            >
              Create a team
            </button>
          }
        />
      )}
      <div className="tip-banner">
        <div className="tip-icon">
          <Sparkles size={19} />
        </div>
        <div>
          <b>Make your skills count</b>
          <p>
            Add your skills to your profile to get better matchmaking
            recommendations.
          </p>
        </div>
        <button className="text-btn" onClick={() => navigate("/profile")}>
          Update profile <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}
function LoadingState({ label = "Loading…" }) {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}

function ExploreTeams({ demoMode }) {
  const { teams, loading, error, refresh } = useTeams(demoMode);
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("ALL");
  const [availability, setAvailability] = useState("AVAILABLE");
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sort, setSort] = useState("NEWEST");
  const [createdNotice] = useState(location.state?.teamCreatedNotice || "");
  const nav = useNavigate();
  function addSkill() {
    const skill = skillQuery.trim();
    if (
      skill &&
      !selectedSkills.some((selected) => selected.toLowerCase() === skill.toLowerCase())
    ) {
      setSelectedSkills((current) => [...current, skill]);
    }
    setSkillQuery("");
  }
  function removeSkill(skill) {
    setSelectedSkills((current) => current.filter((item) => item !== skill));
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return teams
      .filter((t) => {
        const id = String(getId(t) ?? "").toLowerCase();
        const searchable =
          `${getName(t)} ${t.projectTitle || ""} ${t.description || ""} ${getRequired(t).join(" ")}`.toLowerCase();
        const queryMatch =
          !q || searchable.includes(q) || id === q || `#${id}` === `#${q}`;
        const requiredSkills = getRequired(t).map((skill) =>
          String(skill).toLowerCase(),
        );
        const skillMatch =
          !selectedSkills.length ||
          selectedSkills.some((skill) =>
            requiredSkills.some((required) =>
              required.includes(skill.toLowerCase()),
            ),
          );
        const modeMatch =
          mode === "ALL" ||
          String(t.joiningMode || "MANUAL").toUpperCase() === mode;
        const count = getMembers(t),
          max = getMax(t);
        const availabilityMatch =
          availability === "ALL" ||
          (availability === "AVAILABLE"
            ? count < max &&
              String(t.status || "OPEN").toUpperCase() !== "CLOSED"
            : count >= max || String(t.status || "").toUpperCase() === "FULL");
        return queryMatch && skillMatch && modeMatch && availabilityMatch;
      })
      .sort((a, b) =>
        sort === "NAME"
          ? getName(a).localeCompare(getName(b))
          : sort === "MOST_SPACE"
            ? getMax(b) - getMembers(b) - (getMax(a) - getMembers(a))
            : Number(getId(b) || 0) - Number(getId(a) || 0),
      );
  }, [teams, query, selectedSkills, mode, availability, sort]);
  const hasFilters =
    Boolean(query || selectedSkills.length || mode !== "ALL" ||
      availability !== "AVAILABLE" || sort !== "NEWEST");
  function clearFilters() {
    setQuery("");
    setSkillQuery("");
    setSelectedSkills([]);
    setMode("ALL");
    setAvailability("AVAILABLE");
    setSort("NEWEST");
  }
  return (
    <>
      <PageHeader
        eyebrow="DISCOVER"
        title="Explore teams"
        description="Search by team name, project, skill, or shareable team ID."
        action={
          <button className="btn primary" onClick={() => nav("/teams/new")}>
            <PlusCircle size={16} /> Create team
          </button>
        }
      />
      <div className="filters-panel">
        <div className="searchbox team-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team name, project, or #team ID…"
          />
          <span className="search-hint">Enter</span>
        </div>
        <div className="advanced-filters">
          <label>
            <span>
              <SlidersHorizontal size={14} /> Joining mode
            </span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="ALL">All modes</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTO">Auto matchmaking</option>
            </select>
          </label>
          <label>
            <span>
              <Users size={14} /> Team status
            </span>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="AVAILABLE">Has open positions</option>
              <option value="FULL">Full teams</option>
              <option value="ALL">Any status</option>
            </select>
          </label>
          <label>
            <span>
              <Sparkles size={14} /> Skills to find
            </span>
            <div className="skill-filter-input">
              <input
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill, e.g. Python"
                aria-label="Skill to add to team search"
              />
              <button
                className="btn secondary small"
                type="button"
                onClick={addSkill}
                disabled={!skillQuery.trim()}
              >
                <PlusCircle size={13} /> Add
              </button>
            </div>
            <small className="skill-filter-hint">
              Match teams with any selected skill
            </small>
            {selectedSkills.length > 0 && (
              <div className="filter-skill-chips" aria-label="Selected skills">
                {selectedSkills.map((skill) => (
                  <button
                    className="filter-skill-chip"
                    key={skill}
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill} filter`}
                    title={`Remove ${skill}`}
                  >
                    {skill} <X size={12} />
                  </button>
                ))}
              </div>
            )}
          </label>
          <label>
            <span>Sort results</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="NEWEST">Team ID (newest)</option>
              <option value="NAME">Team name A–Z</option>
              <option value="MOST_SPACE">Most open positions</option>
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <span className="result-count">
            {filtered.length} matching team{filtered.length === 1 ? "" : "s"}
          </span>
          <button
            className="btn secondary small"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <X size={14} /> Clear filters
          </button>
          <button className="btn secondary small" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>
      {createdNotice && <div className="alert success">{createdNotice}</div>}
      {error ? (
        <ErrorBox message={error} retry={refresh} />
      ) : loading ? (
        <LoadingState label="Finding campus teams…" />
      ) : filtered.length ? (
        <div className="team-grid">
          {filtered.map((t) => (
            <TeamCard
              key={getId(t)}
              team={t}
              onJoin={(t) => nav(`/teams/${getId(t)}`)}
              demoMode={demoMode}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching teams"
          description="Try a different team ID, skill, or filter. You can also clear all filters."
          action={
            <button
              className="btn secondary"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          }
        />
      )}
    </>
  );
}
function CreateTeam({ demoMode }) {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    projectTitle: "",
    description: "",
    maxMembersCount: 4,
    joiningMode: "MANUAL",
    requiredSkillIds: [],
  });
  const [skillOptions, setSkillOptions] = useState([]);
  const [skillsError, setSkillsError] = useState("");
  useEffect(() => {
    if (demoMode) {
      setSkillOptions(
        skills.map((name, index) => ({ id: String(index + 1), name })),
      );
      return;
    }
    skillApi
      .list()
      .then((r) =>
        setSkillOptions(
          unwrapList(r.data).map((x) => ({ id: String(x.id), name: x.name })),
        ),
      )
      .catch(() =>
        setSkillsError(
          "Could not load skill records from the backend. Make sure /api/skills is available and skills are inserted in MySQL.",
        ),
      );
  }, [demoMode]);
  const [skillSearch, setSkillSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const visibleSkills = skillOptions.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.trim().toLowerCase()),
  );
  const toggleSkill = (id) =>
    setForm((f) => ({
      ...f,
      requiredSkillIds: f.requiredSkillIds.includes(id)
        ? f.requiredSkillIds.filter((x) => x !== id)
        : [...f.requiredSkillIds, id],
    }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const maxMembersCount = Number(form.maxMembersCount);
    if (!Number.isInteger(maxMembersCount) || maxMembersCount < 2)
      return setError("Maximum members must be a whole number of at least 2.");
    if (!form.requiredSkillIds.length)
      return setError("Choose at least one required skill.");
    if (demoMode) {
      setSuccess(
        "Demo preview: your team details are valid, but nothing is saved to the backend.",
      );
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        maxMembersCount,
        requiredSkillIds: form.requiredSkillIds
          .map(Number)
          .filter(Number.isFinite),
      };
      const res = await teamApi.create(payload);
      const createdTeamId = getCreatedTeamId(res.data);
      if (createdTeamId) {
        nav(`/teams/${encodeURIComponent(createdTeamId)}`, {
          replace: true,
          state: { teamCreatedNotice: "Team created successfully." },
        });
      } else {
        nav("/teams", {
          replace: true,
          state: {
            teamCreatedNotice:
              "Team created successfully. It may take a moment to appear in the team list.",
          },
        });
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="BUILD YOUR CREW"
        title="Create a team"
        description="Define your project, capacity, and the skills your teammates should bring."
      />
      <form className="form-card" onSubmit={submit}>
        <div className="form-section-title">
          <span className="step-number">01</span>
          <div>
            <h3>Project details</h3>
            <p>Give your team a clear identity.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Team name
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="e.g. Campus Innovators"
              required
              maxLength={80}
            />
          </label>
          <label>
            Project title
            <input
              name="projectTitle"
              value={form.projectTitle}
              onChange={change}
              placeholder="e.g. Smart Campus Platform"
              required
              maxLength={120}
            />
          </label>
          <label className="span-two">
            Project description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              placeholder="What are you building? What problem will it solve?"
              rows={4}
              required
              maxLength={1000}
            />
          </label>
        </div>
        <div className="form-section-title section-gap">
          <span className="step-number">02</span>
          <div>
            <h3>Team setup</h3>
            <p>Choose the team size and how students can join.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Maximum members
            <input
              type="number"
              name="maxMembersCount"
              value={form.maxMembersCount}
              onChange={change}
              min="2"
              step="1"
              required
            />
          </label>
          <label>
            Joining mode
            <select
              name="joiningMode"
              value={form.joiningMode}
              onChange={change}
            >
              <option value="MANUAL">Manual — leader reviews requests</option>
              <option value="AUTO">Auto — queue and match teammates</option>
            </select>
          </label>
        </div>
        <div className="form-section-title section-gap">
          <span className="step-number">03</span>
          <div>
            <h3>Required skills</h3>
            <p>Search and select the skills your project needs.</p>
          </div>
        </div>
        <div className="skill-picker-search">
          <Search size={17} />
          <input
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search skills: Java, React, MySQL…"
          />
          <span>{form.requiredSkillIds.length} selected</span>
        </div>
        <div className="selectable-skills">
          {visibleSkills.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`select-skill ${form.requiredSkillIds.includes(s.id) ? "selected" : ""}`}
              onClick={() => toggleSkill(s.id)}
            >
              {form.requiredSkillIds.includes(s.id) && (
                <CheckCircle2 size={14} />
              )}{" "}
              {s.name}
            </button>
          ))}
          {!visibleSkills.length && (
            <p className="muted">No skills match that search.</p>
          )}
        </div>
        {form.requiredSkillIds.length > 0 && (
          <div className="selected-skill-summary">
            <b>Selected skills</b>
            <div>
              {form.requiredSkillIds.map((id) => {
                const item = skillOptions.find((x) => x.id === id);
                return (
                  <button
                    type="button"
                    className="selected-skill-chip"
                    key={id}
                    onClick={() => toggleSkill(id)}
                  >
                    {item?.name || `Skill #${id}`} <X size={12} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {skillsError && (
          <div className="alert error">
            <AlertCircle size={16} />
            {skillsError}
          </div>
        )}
        <div className="alert info">
          <AlertCircle size={16} /> Skills load from your backend's /api/skills
          endpoint and are submitted using their actual database IDs.
        </div>
        {error && (
          <div className="alert error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="alert success">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <PlusCircle size={16} />
            )}{" "}
            Create team
          </button>
        </div>
      </form>
    </>
  );
}
function TeamDetails({ user, demoMode }) {
  const { teamId } = useParams();
  const location = useLocation();
  const [team, setTeam] = useState(
    demoMode ? demoTeams.find((t) => String(t.id) === teamId) : null,
  );
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersLoading, setMembersLoading] = useState(!demoMode);
  const [membersError, setMembersError] = useState("");
  const [memberProfilesError, setMemberProfilesError] = useState("");
  const [memberActionError, setMemberActionError] = useState("");
  const [memberActionMessage, setMemberActionMessage] = useState("");
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    location.state?.teamCreatedNotice || "",
  );
  const [selectedMember, setSelectedMember] = useState(null);
  const [busy, setBusy] = useState(false);
  const [membershipOverride, setMembershipOverride] = useState(null);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamEditForm, setTeamEditForm] = useState(null);
  const [teamEditError, setTeamEditError] = useState("");
  const [teamEditBusy, setTeamEditBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    if (demoMode) {
      setTeam(demoTeams.find((t) => String(t.id) === teamId) || null);
      setMembers([]);
      setMembersError("");
      setMemberProfilesError("");
      setMembersLoading(false);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      setMembersError("");
      setMemberProfilesError("");
      setMembersLoading(true);
      try {
        const [teamResponse, membersResponse] = await Promise.all([
          teamApi.get(teamId),
          teamApi.members(teamId),
        ]);
        setTeam(getTeamFromResponse(teamResponse.data));
        const roster = unwrapList(membersResponse.data);
        setMembers(roster);
        const membersNeedingProfile = roster.filter((member) => {
          const student = getMemberStudent(member);
          const hasName =
            student.name ||
            student.fullName ||
            student.studentName ||
            member?.name ||
            member?.fullName ||
            member?.studentName ||
            student.firstName ||
            student.lastName ||
            member?.firstName ||
            member?.lastName;
          return !hasName && Boolean(getMemberStudentId(member));
        });
        if (membersNeedingProfile.length) {
          const profileResults = await Promise.allSettled(
            membersNeedingProfile.map((member) =>
              studentApi.get(getMemberStudentId(member)),
            ),
          );
          const profiles = new Map();
          let failedProfiles = 0;
          profileResults.forEach((result, index) => {
            if (result.status === "fulfilled") {
              profiles.set(
                String(getMemberStudentId(membersNeedingProfile[index])),
                getStudentProfile(result.value.data),
              );
            } else {
              failedProfiles += 1;
            }
          });
          if (profiles.size) {
            setMembers((current) =>
              current.map((member) => {
                const profile = profiles.get(
                  String(getMemberStudentId(member)),
                );
                return profile
                  ? {
                      ...member,
                      student: { ...getMemberStudent(member), ...profile },
                    }
                  : member;
              }),
            );
          }
          if (failedProfiles) {
            setMemberProfilesError(
              `Could not load profile names for ${failedProfiles} team member${failedProfiles === 1 ? "" : "s"}.`,
            );
          }
        }
      } catch (e) {
        if (e?.config?.url?.includes("/members")) {
          setMembersError(friendlyError(e));
          setMembers([]);
          try {
            const r = await teamApi.get(teamId);
            setTeam(getTeamFromResponse(r.data));
          } catch (teamError) {
            setError(friendlyError(teamError));
          }
        } else {
          setError(friendlyError(e));
        }
      } finally {
        setLoading(false);
        setMembersLoading(false);
      }
    })();
  }, [teamId, demoMode]);
  const isMember = demoMode
    ? String(teamId) === "1"
    : (membershipOverride ??
      (samePerson(team?.leader || { id: team?.leaderId }, user) ||
        members.some((member) => samePerson(member, user))));
  const isLeader =
    samePerson(team?.leader, user) ||
    samePerson(
      {
        id: team?.leaderId ?? team?.leaderStudentId,
        studentId: team?.leaderStudentId,
      },
      user,
    ) ||
    members.some(
      (member) =>
        String(member.role || "").toUpperCase().includes("LEADER") &&
        samePerson(member, user),
    );
  const canManageMembers = isLeader || isAdminUser(user);
  const teamLeader = getTeamLeader(team);
  function startEditingTeam() {
    setTeamEditError("");
    setTeamEditForm({
      name: team.name || team.teamName || "",
      projectTitle: team.projectTitle || "",
      description: team.description || "",
      maxMembersCount: getMax(team),
      joiningMode: team.joiningMode || "MANUAL",
      status: team.status || "OPEN",
    });
    setEditingTeam(true);
  }
  async function saveTeamDetails(event) {
    event.preventDefault();
    if (!teamEditForm) return;
    const maxMembersCount = Number(teamEditForm.maxMembersCount);
    if (!Number.isInteger(maxMembersCount) || maxMembersCount < Math.max(2, count)) {
      setTeamEditError(
        `Maximum members must be a whole number of at least ${Math.max(2, count)}.`,
      );
      return;
    }
    setTeamEditBusy(true);
    setTeamEditError("");
    try {
      const changes = [];
      if (
        teamEditForm.name.trim() !== (team.name || team.teamName || "") ||
        teamEditForm.projectTitle.trim() !== (team.projectTitle || "") ||
        teamEditForm.description.trim() !== (team.description || "")
      ) {
        changes.push({
          label: "team details",
          save: () =>
            teamApi.update(teamId, {
              name: teamEditForm.name.trim(),
              projectTitle: teamEditForm.projectTitle.trim(),
              description: teamEditForm.description.trim(),
            }),
        });
      }
      if (maxMembersCount !== getMax(team)) {
        changes.push({
          label: "team capacity",
          save: () => teamApi.updateCapacity(teamId, maxMembersCount),
        });
      }
      if (teamEditForm.joiningMode !== (team.joiningMode || "MANUAL")) {
        changes.push({
          label: "joining mode",
          save: () =>
            teamApi.updateJoiningMode(teamId, teamEditForm.joiningMode),
        });
      }
      if (teamEditForm.status !== (team.status || "OPEN")) {
        changes.push({
          label: "team status",
          save: () => teamApi.updateStatus(teamId, teamEditForm.status),
        });
      }
      const results = await Promise.allSettled(
        changes.map((change) => change.save()),
      );
      const refreshResult = await teamApi.get(teamId);
      setTeam(getTeamFromResponse(refreshResult.data));
      const failedChanges = results
        .map((result, index) =>
          result.status === "rejected" ? changes[index].label : null,
        )
        .filter(Boolean);
      if (failedChanges.length) {
        setTeamEditError(
          `Could not save ${failedChanges.join(", ")}. The latest saved team details have been reloaded.`,
        );
        return;
      }
      setEditingTeam(false);
      setMessage(
        changes.length
          ? "Team details updated successfully."
          : "No team details were changed.",
      );
    } catch (e) {
      setTeamEditError(friendlyError(e));
      try {
        const response = await teamApi.get(teamId);
        setTeam(getTeamFromResponse(response.data));
      } catch (refreshError) {
        setTeamEditError(
          `${friendlyError(e)} The latest team details could not be reloaded: ${friendlyError(refreshError)}`,
        );
      }
    } finally {
      setTeamEditBusy(false);
    }
  }
  async function updateMembership(action) {
    setMessage("");
    if (demoMode) {
      setMessage(
        `Demo preview: ${action === "join" ? "joining" : "leaving"} is disabled because no backend is connected.`,
      );
      return;
    }
    setBusy(true);
    try {
      if (action === "join") {
        await teamApi.join(teamId);
      } else {
        await teamApi.leave(teamId);
      }
      setMembershipOverride(action === "join");
      setMessage(
        action === "join" ? "You joined the team." : "You left the team.",
      );
      setMembersError("");
      const [teamResult, membersResult] = await Promise.allSettled([
        teamApi.get(teamId),
        teamApi.members(teamId),
      ]);
      if (teamResult.status === "fulfilled") {
        setTeam(getTeamFromResponse(teamResult.value.data));
      } else {
        setError(friendlyError(teamResult.reason));
      }
      if (membersResult.status === "fulfilled") {
        setMembers(unwrapList(membersResult.value.data));
      } else {
        setMembersError(friendlyError(membersResult.reason));
      }
    } catch (e) {
      setMessage(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  async function removeTeamMember(member) {
    const studentId = getMemberStudentId(member);
    const isTeamLeader =
      String(member.role || "").toUpperCase().includes("LEADER") ||
      (teamLeader && samePerson(member, teamLeader));
    if (demoMode || !canManageMembers || !studentId || isTeamLeader) return;
    setMemberActionError("");
    setMemberActionMessage("");
    setRemovingMemberId(String(studentId));
    try {
      await teamApi.removeMember(teamId, studentId);
    } catch (e) {
      const status = e?.response?.status;
      setMemberActionError(
        status === 403
          ? "You are not permitted to remove this team member."
          : status === 404
            ? "The team or member could not be found. Refresh the page and try again."
            : status === 409
              ? "Team leaders cannot be removed here. The leader must leave using the Leave team action."
              : friendlyError(e),
      );
      setRemovingMemberId(null);
      return;
    }
    try {
      const response = await teamApi.members(teamId);
      const refreshedMembers = unwrapList(response.data);
      setMembers(refreshedMembers);
      setTeam((current) =>
        current ? { ...current, membersCount: refreshedMembers.length } : current,
      );
      setMemberActionMessage(
        `${getStudentDisplayName(member, 0)} was removed from the team.`,
      );
    } catch (e) {
      setMemberActionError(
        `${getStudentDisplayName(member, 0)} was removed, but the team member list could not be refreshed: ${friendlyError(e)}`,
      );
    } finally {
      setRemovingMemberId(null);
    }
  }
  if (loading) return <LoadingState label="Loading team details…" />;
  if (error) return <ErrorBox message={error} />;
  if (!team)
    return (
      <EmptyState
        title="Team not found"
        description="This team may have been removed or the ID is invalid."
        action={
          <button className="btn secondary" onClick={() => nav("/teams")}>
            Back to teams
          </button>
        }
      />
    );
  const count = getMembers(team),
    max = getMax(team);
  const demoMembers =
    team.id === 1
      ? [
          {
            id: 101,
            name: team.leaderName,
            email: "riya.sharma@campus.edu",
            program: "B.Tech",
            branch: "Computer Science",
            semester: 6,
            skills: ["React", "Java", "Machine Learning"],
            role: "Team leader",
          },
          {
            id: 102,
            name: "Aarav Patel",
            email: "aarav.patel@campus.edu",
            program: "B.Tech",
            branch: "Information Technology",
            semester: 5,
            skills: ["React", "JavaScript", "CSS"],
            role: "Frontend developer",
          },
          {
            id: 103,
            name: "Meera Iyer",
            email: "meera.iyer@campus.edu",
            program: "B.Tech",
            branch: "Computer Science",
            semester: 6,
            skills: ["Python", "Machine Learning", "Data Analytics"],
            role: "ML engineer",
          },
        ]
      : [
          {
            id: 100 + team.id,
            name: team.leaderName || "Team leader",
            role: "Team leader",
          },
        ];
  const displayMembers = demoMode ? demoMembers : members;
  const visibleMembers = displayMembers.filter((member, index) => {
    const student = getMemberStudent(member);
    const skills = Array.isArray(student.skills)
      ? student.skills.map((skill) =>
          typeof skill === "string" ? skill : skill?.name,
        )
      : [];
    return [
      getStudentDisplayName(member, index),
      student.email,
      member.email,
      member.role,
      student.program,
      student.branch,
      ...skills,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(memberSearch.trim().toLowerCase());
  });
  return (
    <>
      <button className="back-link" onClick={() => nav("/teams")}>
        ← Back to teams
      </button>
      <div className="detail-hero">
        <div className="team-logo large">
          <Code2 size={26} />
        </div>
        <div className="detail-title">
          <div className="eyebrow">TEAM DETAILS</div>
          <h1>{getName(team)}</h1>
          <p>{team.projectTitle || "College project"}</p>
          <div className="detail-badges">
            <Status>{team.status || "OPEN"}</Status>
            <span className="subtle-badge">
              {team.joiningMode === "AUTO"
                ? "Auto matchmaking"
                : "Manual approval"}
            </span>
          </div>
        </div>
        {isMember ? (
          <button
            className="btn secondary"
            disabled={busy || membersLoading}
            onClick={() => updateMembership("leave")}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <UserMinus size={16} />
            )}{" "}
            Leave team
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={
              busy ||
              membersLoading ||
              Boolean(membersError) ||
              count >= max
            }
            onClick={() => updateMembership("join")}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <UserPlus size={16} />
            )}{" "}
            Join team
          </button>
        )}
        {isLeader && !demoMode && (
          <button
            className="btn secondary"
            disabled={teamEditBusy}
            onClick={editingTeam ? () => setEditingTeam(false) : startEditingTeam}
          >
            {teamEditBusy && !editingTeam ? (
              <LoaderCircle className="spin" size={16} />
            ) : editingTeam ? (
              <X size={16} />
            ) : (
              <Pencil size={16} />
            )}
            {editingTeam ? "Close editor" : "Edit team"}
          </button>
        )}
      </div>
      {message && <div className="alert info">{message}</div>}
      {teamEditError && !editingTeam && (
        <div className="alert error">
          <AlertCircle size={16} />
          {teamEditError}
        </div>
      )}
      {membersError && (
        <div className="alert error">
          <AlertCircle size={16} />
          Couldn't load team membership: {membersError}
        </div>
      )}
      {memberActionError && (
        <div className="alert error">
          <AlertCircle size={16} />
          {memberActionError}
        </div>
      )}
      {memberActionMessage && (
        <div className="alert success">
          <CheckCircle2 size={16} />
          {memberActionMessage}
        </div>
      )}
      <div className="detail-grid">
        <section className="panel">
          {editingTeam && teamEditForm ? (
            <form className="team-edit-form" onSubmit={saveTeamDetails}>
              <div>
                <h2>Edit team details</h2>
                <p className="muted">
                  Update the project information and requirements for your team.
                </p>
              </div>
              <div className="form-grid">
                <label>
                  Team name
                  <input
                    name="name"
                    value={teamEditForm.name}
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    maxLength={80}
                    required
                  />
                </label>
                <label>
                  Project title
                  <input
                    name="projectTitle"
                    value={teamEditForm.projectTitle}
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        projectTitle: event.target.value,
                      }))
                    }
                    maxLength={120}
                    required
                  />
                </label>
                <label className="span-two">
                  Project description
                  <textarea
                    name="description"
                    value={teamEditForm.description}
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={1000}
                    required
                  />
                </label>
                <label>
                  Maximum members
                  <input
                    type="number"
                    name="maxMembersCount"
                    value={teamEditForm.maxMembersCount}
                    min={Math.max(2, count)}
                    step="1"
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        maxMembersCount: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Joining mode
                  <select
                    name="joiningMode"
                    value={teamEditForm.joiningMode}
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        joiningMode: event.target.value,
                      }))
                    }
                  >
                    <option value="MANUAL">
                      Manual — leader reviews requests
                    </option>
                    <option value="AUTO">
                      Auto — queue and match teammates
                    </option>
                  </select>
                </label>
                <label>
                  Team status
                  <select
                    name="status"
                    value={teamEditForm.status}
                    onChange={(event) =>
                      setTeamEditForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>
              </div>
              <div className="team-edit-skills">
                <div className="section-heading compact">
                  <div>
                    <h3>Required skills</h3>
                    <p>Skills currently selected for this project.</p>
                  </div>
                </div>
                <SkillPills items={getRequired(team)} expandable />
                <p className="muted team-edit-note">
                  Skill updates are not available in the backend team update
                  API yet.
                </p>
              </div>
              {teamEditError && (
                <div className="alert error">
                  <AlertCircle size={16} />
                  {teamEditError}
                </div>
              )}
              <div className="form-actions">
                <button
                  className="btn secondary"
                  type="button"
                  disabled={teamEditBusy}
                  onClick={() => setEditingTeam(false)}
                >
                  Cancel
                </button>
                <button className="btn primary" disabled={teamEditBusy}>
                  {teamEditBusy ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2>About this project</h2>
              <p>{team.description || "No description provided yet."}</p>
              <div className="section-heading compact">
                <div>
                  <h3>Skills needed</h3>
                  <p>Skills the team is looking for</p>
                </div>
              </div>
              <SkillPills items={getRequired(team)} expandable />
              <div className="detail-stats">
                <div>
                  <span>Team capacity</span>
                  <b>
                    {count} / {max}
                  </b>
                </div>
                <div>
                  <span>Open positions</span>
                  <b>{Math.max(0, max - count)}</b>
                </div>
              </div>
              <div className="progress">
                <span
                  style={{
                    width: `${Math.min(100, (count / max) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </section>
        <section className="panel">
          <div className="section-heading compact">
            <div>
              <h2>Team members</h2>
              <p>People working on this project</p>
            </div>
            <span className="count-bubble">
              {demoMode ? count : members.length}
            </span>
          </div>
          {memberProfilesError && (
            <div className="alert info member-profile-warning">
              <AlertCircle size={15} /> {memberProfilesError} Names may be
              unavailable until profile access is restored.
            </div>
          )}
          {!membersLoading && displayMembers.length > 0 && (
            <label className="member-search">
              <Search size={15} />
              <input
                type="search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search teammates by name, skill, or program"
                aria-label="Search team members"
              />
              {memberSearch && (
                <button
                  type="button"
                  className="member-search-clear"
                  onClick={() => setMemberSearch("")}
                  aria-label="Clear team member search"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          )}
          {!demoMode && membersLoading ? (
            <LoadingState label="Loading team members…" />
          ) : visibleMembers.length ? (
            <div className="member-list-scroll">
              {visibleMembers.map((m, i) => {
                const student = getMemberStudent(m);
                const name = getStudentDisplayName(m, i);
                const studentId = getMemberStudentId(m);
                const isTeamLeader =
                  String(m.role || "").toUpperCase().includes("LEADER") ||
                  (teamLeader && samePerson(m, teamLeader));
                const details = [
                  student.program,
                  student.branch,
                  student.semester ? `Semester ${student.semester}` : "",
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    className="member-row"
                    key={studentId || m.id || i}
                  >
                    <button
                      className="member-row-button"
                      type="button"
                      onClick={() =>
                        setSelectedMember({
                          studentId,
                          student,
                          role: m.role || "Member",
                        })
                      }
                      aria-label={`View ${name}'s profile`}
                    >
                      <div className="avatar">{name.slice(0, 1)}</div>
                      <div>
                        <b>{name}</b>
                        <small>
                          {m.role || "Member"}
                          {student.email ? ` · ${student.email}` : ""}
                        </small>
                        {details && <small>{details}</small>}
                      </div>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                    {canManageMembers &&
                      !demoMode &&
                      !isTeamLeader &&
                      studentId && (
                      <button
                        className="btn danger small member-remove-button"
                        type="button"
                        disabled={Boolean(removingMemberId)}
                        onClick={() => removeTeamMember(m)}
                        aria-label={`Remove ${name} from team`}
                      >
                        {removingMemberId === String(studentId) ? (
                          <LoaderCircle className="spin" size={14} />
                        ) : (
                          <UserMinus size={14} />
                        )}
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : displayMembers.length ? (
            <p className="muted member-search-empty">
              No teammates match “{memberSearch}”.
            </p>
          ) : (
            <p className="muted">Member details are not available.</p>
          )}
        </section>
      </div>
      {selectedMember && (
        <MemberProfileDialog
          member={selectedMember}
          demoMode={demoMode}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}

function MemberProfileDialog({ member, demoMode, onClose }) {
  const [student, setStudent] = useState(member.student || {});
  const [loading, setLoading] = useState(
    !demoMode && Boolean(member.studentId),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (demoMode || !member.studentId) return;
    let cancelled = false;
    studentApi
      .get(member.studentId)
      .then((response) => {
        const data =
          response.data?.student ||
          response.data?.data?.student ||
          response.data?.data ||
          response.data;
        if (!cancelled) setStudent(data || {});
      })
      .catch((requestError) => {
        if (!cancelled) setError(friendlyError(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [demoMode, member.studentId]);

  const name =
    student.name ||
    student.fullName ||
    student.studentName ||
    "Team member";
  const profileSkills = Array.isArray(student.skills)
    ? student.skills.map((skill) =>
        typeof skill === "string" ? skill : skill.name,
      ).filter(Boolean)
    : [];
  const profileFields = [
    ["Email", student.email],
    ["Phone", student.phoneNumber || student.phone],
    ["Program", student.program],
    ["Branch", student.branch],
    ["Semester", student.semester],
    ["Section", student.section],
    ["Role", member.role],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div
      className="profile-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="panel member-profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-profile-title"
      >
        <button
          className="icon-btn member-profile-close"
          type="button"
          onClick={onClose}
          aria-label="Close profile"
        >
          <X size={18} />
        </button>
        <div className="member-profile-heading">
          <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="eyebrow">TEAMMATE PROFILE</div>
            <h2 id="member-profile-title">{name}</h2>
            <p>{member.role || "Team member"}</p>
          </div>
        </div>
        {loading && <LoadingState label="Loading profile details…" />}
        {error && (
          <div className="alert error">
            <AlertCircle size={16} />
            Couldn't load the latest profile details: {error}
          </div>
        )}
        <div className="member-profile-fields">
          {profileFields.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>
        {profileSkills.length > 0 && (
          <div className="member-profile-skills">
            <b>Skills</b>
            <SkillPills items={profileSkills} />
          </div>
        )}
        {!loading && profileFields.length === 0 && profileSkills.length === 0 && (
          <p className="muted">
            No additional profile details have been provided.
          </p>
        )}
      </section>
    </div>
  );
}
function MyTeams({ user, demoMode }) {
  const { teams, loading, error, refresh } = useTeams(demoMode);
  const nav = useNavigate();
  const [owned, setOwned] = useState([]);
  const [membershipLoading, setMembershipLoading] = useState(!demoMode);
  const [membershipError, setMembershipError] = useState("");
  useEffect(() => {
    if (demoMode) {
      setOwned(demoTeams.slice(0, 1));
      setMembershipLoading(false);
      setMembershipError("");
      return;
    }
    if (loading) return;
    const studentId = user?.studentId || user?.student?.id || user?.id;
    if (!studentId && !user?.email) {
      setMembershipError(
        "Your account details are missing, so team membership cannot be verified. Please sign in again.",
      );
      setMembershipLoading(false);
      return;
    }
    (async () => {
      setMembershipLoading(true);
      setMembershipError("");
      const results = await Promise.all(
        teams.map(async (team) => {
          const leaderMatch = samePerson(team.leader || { id: team.leaderId }, user);
          try {
            const response = await teamApi.members(getId(team));
            const members = unwrapList(response.data);
            return {
              team,
              isMember: leaderMatch || members.some((member) => samePerson(member, user)),
            };
          } catch (e) {
            if (leaderMatch) return { team, isMember: true };
            return { team, error: friendlyError(e) };
          }
        }),
      );
      setOwned(
        results
          .filter((result) => result.isMember)
          .map((result) => result.team),
      );
      const failed = results.filter((result) => result.error);
      if (failed.length) {
        setMembershipError(
          `Membership could not be verified for ${failed.length} team${failed.length === 1 ? "" : "s"}. Refresh to try again.`,
        );
      }
      setMembershipLoading(false);
    })();
  }, [demoMode, loading, teams, user]);
  return (
    <>
      <PageHeader
        eyebrow="YOUR COLLABORATION"
        title="My teams"
        description="Keep track of projects you're leading or contributing to."
        action={
          <button className="btn primary" onClick={() => nav("/teams/new")}>
            <PlusCircle size={16} /> Create team
          </button>
        }
      />
      {error ? (
        <ErrorBox message={error} retry={refresh} />
      ) : loading ? (
        <LoadingState />
      ) : membershipLoading ? (
        <LoadingState label="Checking your team memberships…" />
      ) : owned.length ? (
        <>
          {membershipError && (
            <div className="alert error">{membershipError}</div>
          )}
          <div className="team-grid">
            {owned.map((t) => (
              <TeamCard
                key={getId(t)}
                team={t}
                onJoin={(t) => nav(`/teams/${getId(t)}`)}
                demoMode={demoMode}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {membershipError && (
            <ErrorBox message={membershipError} retry={refresh} />
          )}
          {!membershipError && (
            <EmptyState
              icon={Users}
              title="Your teams will show up here"
              description="Create a team or explore projects to find your next collaboration."
              action={
                <button className="btn primary" onClick={() => nav("/teams")}>
                  Explore teams
                </button>
              }
            />
          )}
        </>
      )}
    </>
  );
}
function Matchmaking({ user, demoMode }) {
  const { teams, loading, error, refresh } = useTeams(demoMode);
  const [goal, setGoal] = useState("TEAM"); // TEAM = find a team; PEOPLE = find teammates
  const [teamId, setTeamId] = useState("");
  const [leaderTeams, setLeaderTeams] = useState([]);
  const [leaderTeamsLoading, setLeaderTeamsLoading] = useState(!demoMode);
  const [leaderTeamsError, setLeaderTeamsError] = useState("");
  const [leaderTeamsRetry, setLeaderTeamsRetry] = useState(0);
  const [minimum, setMinimum] = useState(60);
  const [result, setResult] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (demoMode) return;
    let cancelled = false;
    queueApi
      .mine()
      .then((response) => {
        if (cancelled) return;
        const pendingRequests = unwrapList(response.data)
          .filter((request) =>
            ["PENDING", "PROCESSING"].includes(
              String(request.status || "").toUpperCase(),
            ),
          )
          .sort(
            (left, right) =>
              new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
          );
        const request = pendingRequests[0];
        const requestId = request?.id ?? request?.requestId;
        if (requestId === undefined || requestId === null) return;
        setGoal(request.requestType === "FIND_TEAMMATES" ? "PEOPLE" : "TEAM");
        setTeamId(
          request.teamId === undefined || request.teamId === null
            ? ""
            : String(request.teamId),
        );
        setActiveRequest({ ...request, id: requestId });
        setResult({ kind: "queued", request });
        setMessage("An existing matchmaking request is still being processed.");
      })
      .catch((requestError) => {
        if (!cancelled) setMessage(friendlyError(requestError));
      });
    return () => {
      cancelled = true;
    };
  }, [demoMode]);
  useEffect(() => {
    if (!activeRequest || demoMode) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await queueApi.mine();
        if (cancelled) return;
        const candidates = unwrapList(response.data);
        const matchingRequests = activeRequest.id
          ? candidates.filter(
              (candidate) =>
                String(candidate.id ?? candidate.requestId) ===
                String(activeRequest.id),
            )
          : candidates
              .filter(
                (candidate) =>
                  candidate.requestType === activeRequest.requestType &&
                  String(candidate.teamId ?? "") ===
                    String(activeRequest.teamId ?? "") &&
                  Number(candidate.minimumScore) ===
                    Number(activeRequest.minimumScore) &&
                  ["PENDING", "PROCESSING", "MATCHED", "CANCELLED", "EXPIRED"].includes(
                    String(candidate.status || "").toUpperCase(),
                  ),
              )
              .sort(
                (left, right) =>
                  new Date(right.createdAt || 0) -
                  new Date(left.createdAt || 0),
              );
        const request = matchingRequests[0];
        if (!request) return;
        const currentRequest = {
          ...request,
          id: request.id ?? request.requestId,
        };
        setActiveRequest(currentRequest);
        setResult({ kind: "queued", request: currentRequest });
        const status = String(request.status || "").toUpperCase();
        if (!["PENDING", "PROCESSING"].includes(status)) {
          setActiveRequest(null);
          if (status === "MATCHED") {
            setMessage("A match was found. See the result details below.");
          } else if (status === "CANCELLED") {
            setMessage("The matchmaking request was cancelled.");
          } else if (status === "EXPIRED") {
            setMessage("The matchmaking request expired without a match.");
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setMessage(`Could not refresh matchmaking status: ${friendlyError(requestError)}`);
        }
      }
    };
    const timer = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    activeRequest?.id,
    activeRequest?.requestType,
    activeRequest?.teamId,
    activeRequest?.minimumScore,
    demoMode,
  ]);
  useEffect(() => {
    if (demoMode) {
      setLeaderTeams(demoTeams.slice(0, 1));
      setLeaderTeamsError("");
      setLeaderTeamsLoading(false);
      return;
    }
    if (loading) return;
    let cancelled = false;
    setLeaderTeams([]);
    setLeaderTeamsError("");
    setLeaderTeamsLoading(true);
    (async () => {
      const results = await Promise.all(
        teams.map(async (team) => {
          const leader = getTeamLeader(team);
          if (leader && personIdentifiers(leader).length) {
            return { team, isLeader: isTeamLeader(team, user) };
          }
          try {
            const response = await teamApi.get(getId(team));
            const details = getTeamFromResponse(response.data);
            return {
              team: { ...team, ...details },
              isLeader: isTeamLeader(details, user),
            };
          } catch (requestError) {
            return { team, error: friendlyError(requestError) };
          }
        }),
      );
      if (cancelled) return;
      setLeaderTeams(
        results
          .filter((result) => result.isLeader)
          .map((result) => result.team),
      );
      const failures = results.filter((result) => result.error).length;
      if (failures) {
        setLeaderTeamsError(
          `Could not verify team leadership for ${failures} team${failures === 1 ? "" : "s"}. Refresh to try again.`,
        );
      }
      setLeaderTeamsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [demoMode, loading, teams, user, leaderTeamsRetry]);
  function changeGoal(value) {
    if (activeRequest) return;
    setGoal(value);
    setResult(null);
    setMessage("");
    setTeamId("");
  }
  async function run() {
    if (activeRequest) return;
    setMessage("");
    setResult(null);
    if (demoMode) {
      setMessage("Demo preview only. Sign in to submit a real queue request.");
      return;
    }
    if (
      goal === "PEOPLE" &&
      !leaderTeams.some((team) => String(getId(team)) === String(teamId))
    ) {
      setMessage("You can only find teammates for a team you lead.");
      return;
    }
    setBusy(true);
    try {
      const payload =
        goal === "TEAM"
          ? {
              requestType: "FIND_TEAM",
              minimumScore: minimum,
            }
          : {
              requestType: "FIND_TEAMMATES",
              teamId: Number(teamId),
              minimumScore: minimum,
            };
      if (goal === "PEOPLE" && !teamId) {
        setMessage("Choose your team first.");
        return;
      }
      const r = await queueApi.submit(payload);
      const request = r.data?.request || r.data?.data || r.data;
      const requestId = request?.id ?? request?.requestId;
      setResult({ kind: "queued", request });
      setActiveRequest({
        ...request,
        ...payload,
        id: requestId ?? null,
      });
      setMessage(
        requestId !== undefined && requestId !== null
          ? "Your request is in the queue. You can cancel it while it is pending."
          : "Your request was accepted. Checking the queue for its status…",
      );
    } catch (e) {
      setMessage(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  async function cancelRequest() {
    if (!activeRequest?.id) return;
    setBusy(true);
    setMessage("");
    try {
      await queueApi.cancel(activeRequest.id);
      setActiveRequest(null);
      setResult(null);
      setMessage("Your matchmaking request was cancelled.");
    } catch (e) {
      setMessage(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="AUTOMATED TEAM FORMATION"
        title="Find your people"
        description="Choose what you need and let the matchmaking service handle the search and queue scheduling."
      />
      <section className="panel matchmaking-intro">
        <div className="match-choice-grid">
          <button
            type="button"
            className={`match-choice ${goal === "TEAM" ? "active" : ""}`}
            onClick={() => changeGoal("TEAM")}
            disabled={Boolean(activeRequest)}
          >
            <span className="match-choice-icon">
              <Compass size={22} />
            </span>
            <span>
              <b>Find a team</b>
              <small>Discover existing projects that fit your skills.</small>
            </span>
            <span className="choice-check">{goal === "TEAM" ? "✓" : ""}</span>
          </button>
          <button
            type="button"
            className={`match-choice ${goal === "PEOPLE" ? "active" : ""}`}
            onClick={() => changeGoal("PEOPLE")}
            disabled={Boolean(activeRequest)}
          >
            <span className="match-choice-icon">
              <UsersRound size={22} />
            </span>
            <span>
              <b>Find teammates</b>
              <small>Find students who fit your team's requirements.</small>
            </span>
            <span className="choice-check">{goal === "PEOPLE" ? "✓" : ""}</span>
          </button>
        </div>
      </section>
      <div className="match-layout match-layout-new">
        <section className="panel">
          <div className="panel-heading-icon">
            <span className="match-icon">
              {goal === "TEAM" ? (
                <Compass size={21} />
              ) : (
                <UsersRound size={21} />
              )}
            </span>
            <div>
              <h2>
                {goal === "TEAM"
                  ? "Find my best team"
                  : "Find my best teammates"}
              </h2>
              <p>
                {goal === "TEAM"
                  ? "Find a team with open positions that fits your interests."
                  : "Choose your team and find students who match its required skills."}
              </p>
            </div>
          </div>
          {goal === "TEAM" ? (
            <>
              <div className="auto-explain">
                <Sparkles size={17} />
                <div>
                  <b>Smart team suggestions</b>
                  <p>
                    We find a suitable team with open positions based on your
                    profile. Add your skills to improve your match.
                  </p>
                </div>
              </div>
              <div className="range-label">
                <label htmlFor="team-match-threshold">
                  Minimum match threshold
                </label>
                <b>{minimum}%</b>
              </div>
              <input
                id="team-match-threshold"
                className="range"
                type="range"
                min="0"
                max="100"
                step="5"
                value={minimum}
                disabled={Boolean(activeRequest)}
                onChange={(e) => setMinimum(Number(e.target.value))}
                aria-label="Minimum match threshold"
              />
              <div className="range-ticks">
                <span>More possible matches</span>
                <span>Stricter match</span>
              </div>
            </>
          ) : (
            <>
              {leaderTeamsLoading ? (
                <LoadingState label="Loading teams you lead…" />
              ) : leaderTeamsError ? (
                <div className="alert error">
                  <AlertCircle size={16} />
                  {leaderTeamsError}
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setLeaderTeamsRetry((retry) => retry + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : (
              <label>
                Your team
                <select
                  value={teamId}
                  disabled={Boolean(activeRequest) || !leaderTeams.length}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setResult(null);
                  }}
                >
                  <option value="">Choose a team…</option>
                  {leaderTeams.map((t) => (
                    <option key={getId(t)} value={getId(t)}>
                      {getName(t)} · #{getId(t)}
                    </option>
                  ))}
                </select>
              </label>
              )}
              {!leaderTeamsLoading &&
                !leaderTeamsError &&
                leaderTeams.length === 0 && (
                  <div className="alert info">
                    <UsersRound size={16} />
                    You need to lead a team to search for teammates. Teams
                    where you are only a member are not eligible.
                  </div>
                )}
              <div className="range-label">
                <label>Minimum compatibility</label>
                <b>{minimum}%</b>
              </div>
              <input
                className="range"
                type="range"
                min="0"
                max="100"
                step="5"
                value={minimum}
                disabled={Boolean(activeRequest)}
                onChange={(e) => setMinimum(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>Wider results</span>
                <span>Stricter match</span>
              </div>
              <div className="auto-explain">
                <Sparkles size={17} />
                <div>
                  <b>Automatic teammate matching</b>
                  <p>
                    The backend will select and schedule the best candidate
                    based on your team's needs.
                  </p>
                </div>
              </div>
            </>
          )}
          {error && (
            <div className="alert error">
              {error}{" "}
              <button className="text-btn" onClick={refresh}>
                Retry
              </button>
            </div>
          )}
          {activeRequest ? (
            <button
              className="btn secondary full"
              disabled={busy || !activeRequest.id}
              onClick={cancelRequest}
            >
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <X size={16} />
              )}{" "}
              {busy
                ? "Cancelling request…"
                : activeRequest.id
                  ? "Cancel request"
                  : "Checking request…"}
            </button>
          ) : (
            <button
              className="btn primary full"
              disabled={
                busy ||
                loading ||
                (goal === "PEOPLE" &&
                  (leaderTeamsLoading ||
                    Boolean(leaderTeamsError) ||
                    !leaderTeams.some(
                      (team) => String(getId(team)) === String(teamId),
                    )))
              }
              onClick={run}
            >
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}{" "}
              {busy
                ? "Finding matches…"
                : goal === "TEAM"
                  ? "Find my best team"
                  : "Find my best teammates"}
            </button>
          )}
          {message && <div className="alert info">{message}</div>}
        </section>
        <section className="panel result-panel">
          <div className="eyebrow">
            {result ? "YOUR MATCHES" : "MATCH RESULTS"}
          </div>
          <h2>
            {goal === "TEAM" ? "Recommended teams" : "Recommended teammates"}
          </h2>
          {result?.kind === "queued" ? (
            <div className="auto-explain">
              <CheckCircle2 size={18} />
              <div>
                <b>Request #{result.request?.id} queued</b>
                <p>
                  Status: {result.request?.status}.
                  {" "}The backend processes requests FCFS and retries unmatched
                  requests at the back of the queue.
                </p>
                {result.request?.matchedStudentId && (
                  <p>Matched student: #{result.request.matchedStudentId}</p>
                )}
                {result.request?.matchedTeamId && (
                  <p>Matched team: #{result.request.matchedTeamId}</p>
                )}
                {result.request?.message && <p>{result.request.message}</p>}
              </div>
            </div>
          ) : result?.kind === "students" && result.items?.length ? (
            <div className="match-result-list">
              {result.items.map((st) => (
                <article className="match-result-card" key={st.id}>
                  <div className="team-logo">
                    <UsersRound size={19} />
                  </div>
                  <div className="match-result-main">
                    <b>{st.name}</b>
                    <p>{st.email}</p>
                    <SkillPills
                      items={(st.skills || []).map((x) => x.name || x)}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : result?.kind === "teams" && result.items?.length ? (
            <div className="match-result-list">
              {result.items.map((item, i) => {
                const t = item.team;
                return (
                  <article className="match-result-card" key={getId(t)}>
                    <div className="team-logo">
                      <Code2 size={19} />
                    </div>
                    <div className="match-result-main">
                      <div className="match-result-title">
                        <b>{getName(t)}</b>
                        <span className="score-tag">
                          {item.compatibilityScore ?? item.score ?? 0}% fit
                        </span>
                      </div>
                      <p>
                        {t.projectTitle || "College project"} · Team #{getId(t)}
                      </p>
                      <SkillPills items={getRequired(t)} />
                      <small>
                        {Math.max(0, getMax(t) - getMembers(t))} open
                        position(s)
                      </small>
                    </div>
                    <button
                      className="btn secondary small"
                      onClick={() =>
                        window.location.assign(`/teams/${getId(t)}`)
                      }
                    >
                      View team <ArrowUpRight size={14} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : result?.kind === "person" ? (
            <>
              <div className="match-score">
                <div className="score-ring">
                  <span>
                    {result.compatibilityScore ?? result.score ?? 84}%
                  </span>
                  <small>match</small>
                </div>
                <div>
                  <h3>
                    {result.candidate?.name ||
                      result.name ||
                      "Recommended candidate"}
                  </h3>
                  <p className="muted">
                    Skill alignment with your team requirements.
                  </p>
                  <SkillPills
                    items={result.candidate?.skills || result.skills || []}
                  />
                </div>
              </div>
              <div className="match-reasons">
                <div>
                  <CheckCircle2 size={16} /> Candidate recommended by the
                  matching engine
                </div>
                <div>
                  <CheckCircle2 size={16} /> Minimum score: {minimum}%
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Your next teammate is out there"
              description={
                goal === "TEAM"
                  ? "Find your best team based on your skills and preferences."
                  : "Choose your team and find the best-fit teammate automatically."
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
function Profile({ user, demoMode }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    semester: "",
    section: "",
    program: "B.Tech",
    branch: "Computer Science & Engineering",
    skills: [],
  });
  const [skillSearch, setSkillSearch] = useState("");
  const [skillOptions, setSkillOptions] = useState([]);
  useEffect(() => {
    if (demoMode) {
      setSkillOptions(
        skills.map((name, index) => ({ id: String(index + 1), name })),
      );
      return;
    }
    skillApi
      .list()
      .then((r) =>
        setSkillOptions(
          unwrapList(r.data).map((x) => ({ id: String(x.id), name: x.name })),
        ),
      )
      .catch(() => setSkillOptions([]));
    const sid = user?.studentId || user?.student?.id;
    if (sid)
      studentApi
        .get(sid)
        .then((r) =>
          setForm((f) => ({
            ...f,
            name: r.data.name || f.name,
            email: r.data.email || f.email,
            phone: r.data.phoneNumber || "",
            semester: String(r.data.semester || ""),
            section: r.data.section || "",
            program: r.data.program || f.program,
            branch: r.data.branch || f.branch,
            skills: (r.data.skills || []).map((x) => String(x.id)),
          })),
        )
        .catch(() => {});
  }, [demoMode]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const visibleSkills = skillOptions.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.trim().toLowerCase()),
  );
  const toggle = (s) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s)
        ? f.skills.filter((x) => x !== s)
        : [...f.skills, s],
    }));
  async function save(e) {
    e.preventDefault();
    setNotice("");
    setError("");
    if (demoMode) {
      setNotice(
        "Demo preview: profile changes have not been saved to the backend.",
      );
      return;
    }
    setBusy(true);
    try {
      const studentId = user?.studentId || user?.student?.id || user?.id;
      if (!studentId)
        throw new Error(
          "Student ID was not returned by login. Check the auth response mapping in App.jsx.",
        );
      await studentApi.update(studentId, {
        name: form.name,
        email: form.email,
        phoneNumber: form.phone || "Not provided",
        semester: Number(form.semester) || 1,
        section: form.section || "Not assigned",
        program: form.program,
        branch: form.branch,
      });
      await studentApi.assignSkills(studentId, form.skills.map(Number));
      setNotice("Profile and skills saved to the database.");
    } catch (e) {
      setError(e.message || friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR ACCOUNT"
        title="My profile"
        description="Keep your student information and skills up to date."
      />
      <form className="profile-layout" onSubmit={save}>
        <section className="panel">
          <div className="profile-heading">
            <div className="profile-avatar">
              {(form.name || "S").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2>{form.name || "Student profile"}</h2>
              <p>{form.email}</p>
              <span className="subtle-badge">
                <ShieldCheck size={13} /> Student account
              </span>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </label>
            <label>
              Semester
              <input
                type="number"
                min="1"
                max="12"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                placeholder="e.g. 5"
              />
            </label>
            <label>
              Section
              <input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. CSE-A"
              />
            </label>
            <label>
              Branch
              <input
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn primary" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}{" "}
              Save profile
            </button>
          </div>
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}
        </section>
        <section className="panel">
          <div className="section-heading compact">
            <div>
              <h2>Your skills</h2>
              <p>Search and select the skills you can bring to a project.</p>
            </div>
            <span className="count-bubble">{form.skills.length}</span>
          </div>
          <div className="skill-picker-search">
            <Search size={17} />
            <input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills: Java, React, MySQL…"
            />
            <span>{visibleSkills.length} found</span>
          </div>
          <div className="selectable-skills">
            {visibleSkills.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`select-skill ${form.skills.includes(s.id) ? "selected" : ""}`}
                onClick={() => toggle(s.id)}
              >
                {form.skills.includes(s.id) && <CheckCircle2 size={14} />}{" "}
                {s.name}
              </button>
            ))}
            {!visibleSkills.length && (
              <p className="muted">No skills match your search.</p>
            )}
          </div>
          {form.skills.length > 0 && (
            <div className="selected-skill-summary">
              <b>Your selected skills</b>
              <div>
                {form.skills.map((id) => {
                  const sk = skillOptions.find((x) => x.id === id);
                  return (
                    <button
                      type="button"
                      className="selected-skill-chip"
                      key={id}
                      onClick={() => toggle(id)}
                    >
                      {sk?.name || `Skill #${id}`} <X size={12} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {error && <div className="alert error">{error}</div>}
        </section>
      </form>
    </>
  );
}
function RequestQueue({ demoMode }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState("");
  async function refresh(silent = false) {
    if (demoMode) {
      setRequests([]);
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const r = await queueApi.mine();
      setRequests(unwrapList(r.data));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      if (!silent) setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [demoMode]);
  const hasActiveRequests = requests.some((request) =>
    ["PENDING", "PROCESSING"].includes(
      String(request.status || "").toUpperCase(),
    ),
  );
  useEffect(() => {
    if (demoMode || !hasActiveRequests) return;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const response = await queueApi.mine();
        if (!cancelled) {
          setRequests(unwrapList(response.data));
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) setError(friendlyError(requestError));
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [demoMode, hasActiveRequests]);
  return (
    <>
      <PageHeader
        eyebrow="MATCHMAKING"
        title="Request processing queue"
        description="Matchmaking requests are processed first-come, first-served. Unmatched requests are retried at the back of the queue."
      />
      <div className="stats-grid">
        <div className="stat-card">
          <span>Pending requests</span>
          <b>
            {
              requests.filter(
                (r) => String(r.status || "").toUpperCase() === "PENDING",
              ).length
            }
          </b>
        </div>
        <div className="stat-card">
          <span>Matched</span>
          <b>
            {
              requests.filter(
                (r) => String(r.status || "").toUpperCase() === "MATCHED",
              ).length
            }
          </b>
        </div>
        <div className="stat-card">
          <span>Expired / cancelled</span>
          <b>
            {
              requests.filter((r) =>
                ["EXPIRED", "CANCELLED", "FAILED"].includes(
                  String(r.status || "").toUpperCase(),
                ),
              ).length
            }
          </b>
        </div>
      </div>
      <section className="panel">
        <div className="section-heading compact">
          <div>
            <h2>Your requests</h2>
            <p>
              The backend processes active requests in first-come, first-served
              order and retries unmatched requests at the back of the queue.
            </p>
          </div>
          <button className="btn secondary small" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {demoMode ? (
          <EmptyState
            icon={ListChecks}
            title="Connect your account to view the queue"
            description="Demo mode uses sample UI only. Sign in to view persisted requests."
          />
        ) : loading ? (
          <LoadingState label="Loading request queue…" />
        ) : error ? (
          <ErrorBox message={error} retry={refresh} />
        ) : requests.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Type</th>
                  <th>Queue order</th>
                  <th>Status</th>
                  <th>Match result</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.requestType || r.intent}</td>
                    <td>FCFS</td>
                    <td>
                      <Status>{r.status}</Status>
                    </td>
                    <td>
                      {r.matchedStudentId
                        ? `Student #${r.matchedStudentId}`
                        : r.matchedTeamId
                          ? `Team #${r.matchedTeamId}`
                          : r.message || "—"}
                    </td>
                    <td>
                      {r.minimumScore ?? "—"}
                      {r.minimumScore != null ? "%" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="Your queue is empty"
            description="When you submit an Auto Find request, it will appear here with its queue status and matching progress."
          />
        )}
      </section>
    </>
  );
}

export default App;
