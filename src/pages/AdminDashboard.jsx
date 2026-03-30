import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NeedEditorModal from "../components/NeedEditorModal";
import TrustBadge from "../components/TrustBadge";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  AlertTriangle,
  Ban,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Flag,
  Package,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

const TABS = [
  { id: "verify", label: "Verifications" },
  { id: "reports", label: "Reports" },
  { id: "ngos", label: "NGO Management" },
];

const STAT_CARDS = [
  { key: "approvedNgos", label: "Approved NGOs", icon: ShieldCheck, color: "green" },
  { key: "activeNeeds", label: "Active Needs", icon: Users, color: "blue" },
  { key: "pledgesToday", label: "Pledges Today", icon: Flag, color: "yellow" },
  {
    key: "fulfillmentsThisMonth",
    label: "Fulfillments This Month",
    icon: CheckCircle,
    color: "red",
  },
];

const INITIAL_LIST_LIMIT = 10;
function titleCase(value) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNgoName(ngo) {
  return ngo?.name || ngo?.organizationName || ngo?.user?.fullName || "Unnamed NGO";
}

function getNgoEmail(ngo) {
  return ngo?.contactEmail || ngo?.email || ngo?.user?.email || "No email provided";
}

function normalizeNgo(ngo) {
  return {
    id: ngo?.id,
    name: getNgoName(ngo),
    email: getNgoEmail(ngo),
    address: ngo?.address || "Address not provided",
    photoUrl: ngo?.photoUrl || ngo?.profilePhotoUrl || "",
    documentUrl: ngo?.documentUrl || ngo?.verificationDocUrl || "",
    status: ngo?.status || (ngo?.suspended ? "SUSPENDED" : "APPROVED"),
    categoryOfWork: ngo?.categoryOfWork || "",
    trustScore: typeof ngo?.trustScore === "number" ? ngo.trustScore : null,
    trustLabel: titleCase(ngo?.trustTier || ngo?.trustLabel || "NEW"),
    activeNeedsCount:
      typeof ngo?.activeNeedsCount === "number" ? ngo.activeNeedsCount : null,
    rejectionReason: ngo?.rejectionReason || "",
    verifiedAt: ngo?.verifiedAt || "",
    createdAt: ngo?.createdAt || "",
  };
}

function groupReportsByNgo(reports) {
  const groups = new Map();

  (Array.isArray(reports) ? reports : []).forEach((report) => {
    const ngo = report?.ngo || {};
    const ngoId = ngo.id ?? report?.ngoId;
    const ngoName = report?.ngoName || getNgoName(ngo);
    const ngoStatus = report?.ngoStatus || ngo?.status || null;
    const reporterEmail = report?.reporterEmail || report?.reporter?.email || "Unknown reporter";

    if (!ngoId) return;

    if (!groups.has(ngoId)) {
      groups.set(ngoId, {
        ngoId,
        ngoName: ngoName || "Unnamed NGO",
        reportCount: 0,
        status: ngoStatus,
        items: [],
      });
    }

    const group = groups.get(ngoId);
    group.reportCount += 1;
    group.items.push({
      id: report?.id,
      reason: report?.reason || "No reason provided",
      reporterEmail,
      reportedAt: report?.reportedAt || null,
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        const left = a.reportedAt ? new Date(a.reportedAt).getTime() : 0;
        const right = b.reportedAt ? new Date(b.reportedAt).getTime() : 0;
        return right - left;
      }),
    }))
    .sort((a, b) => b.reportCount - a.reportCount);
}

function formatDateTime(value) {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleString();
}

function getApiErrorMessage(err, fallback) {
  return err?.response?.data?.error || err?.response?.data?.message || fallback;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [tab, setTab] = useState("verify");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hydratingFullLists, setHydratingFullLists] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [ngosLoading, setNgosLoading] = useState(false);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [ngosLoaded, setNgosLoaded] = useState(false);
  const [initialListLimit] = useState(INITIAL_LIST_LIMIT);
  const [approvingNgoId, setApprovingNgoId] = useState(null);
  const [expandedReportNgoId, setExpandedReportNgoId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const [suspendResult, setSuspendResult] = useState(null);
  const [expandedNgoId, setExpandedNgoId] = useState(null);
  const [ngoNeedsById, setNgoNeedsById] = useState({});
  const [loadingNeedsNgoId, setLoadingNeedsNgoId] = useState(null);
  const [editingNeed, setEditingNeed] = useState(null);
  const [editingNeedNgoId, setEditingNeedNgoId] = useState(null);
  const [savingNeed, setSavingNeed] = useState(false);
  const online = useOnlineStatus();
  const expandedNeedsRef = useRef(null);

  const groupedReports = useMemo(() => groupReportsByNgo(reports), [reports]);
  const expandedNgo = useMemo(
    () => ngos.find((ngo) => ngo.id === expandedNgoId) || null,
    [ngos, expandedNgoId]
  );

  const fetchReports = async (limit, hydrateFull = false) => {
    setReportsLoading(true);

    try {
      const reportsRes = await api.get("/api/admin/reports", {
        params: limit ? { limit } : undefined,
      });
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      setReportsLoaded(true);

      if (limit && hydrateFull) {
        setHydratingFullLists(true);
        window.setTimeout(async () => {
          try {
            await fetchReports();
          } finally {
            setHydratingFullLists(false);
          }
        }, BACKGROUND_HYDRATE_DELAY_MS);
      }
    } catch (err) {
      console.error("Failed to load admin reports", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchNgos = async (limit, hydrateFull = false) => {
    setNgosLoading(true);

    try {
      const ngosRes = await api.get("/api/admin/ngos", {
        params: limit ? { limit } : undefined,
      });
      setNgos((Array.isArray(ngosRes.data) ? ngosRes.data : []).map(normalizeNgo));
      setNgosLoaded(true);

      if (limit && hydrateFull) {
        setHydratingFullLists(true);
        window.setTimeout(async () => {
          try {
            await fetchNgos();
          } finally {
            setHydratingFullLists(false);
          }
        }, BACKGROUND_HYDRATE_DELAY_MS);
      }
    } catch (err) {
      console.error("Failed to load NGO management list", err);
    } finally {
      setNgosLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);

      const statsPromise = api
        .get("/api/admin/stats")
        .then((statsRes) => {
          if (!isCancelled) {
            setStats(statsRes.data || {});
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error("Failed to load admin stats", err);
          }
        });

      try {
        const pendingRes = await api.get("/api/admin/ngos/pending", {
          params: { limit: INITIAL_LIST_LIMIT },
        });

        if (isCancelled) return;

        setPendingVerifications(
          (Array.isArray(pendingRes.data) ? pendingRes.data : []).map(normalizeNgo)
        );

        setHydratingFullLists(true);
        Promise.allSettled([api.get("/api/admin/ngos/pending")]).then((results) => {
          const [pendingFullResult] = results;

          try {
            if (isCancelled) return;

            if (pendingFullResult.status === "fulfilled") {
              setPendingVerifications(
                (Array.isArray(pendingFullResult.value.data)
                  ? pendingFullResult.value.data
                  : []
                ).map(normalizeNgo)
              );
            } else {
              console.error(
                "Failed to hydrate full verification queue",
                pendingFullResult.reason
              );
            }
          } finally {
            if (!isCancelled) {
              setHydratingFullLists(false);
            }
          }
        });
      } catch (err) {
        console.error("Failed to load admin data", err);
        if (!isCancelled) {
          setError(getApiErrorMessage(err, "Failed to load admin dashboard."));
          setHydratingFullLists(false);
        }
      } finally {
        await statsPromise;
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (tab === "reports" && !reportsLoaded && !reportsLoading) {
      void fetchReports(INITIAL_LIST_LIMIT, true);
    }

    if (tab === "ngos" && !ngosLoaded && !ngosLoading) {
      void fetchNgos(INITIAL_LIST_LIMIT, true);
    }
  }, [loading, ngosLoaded, ngosLoading, reportsLoaded, reportsLoading, tab]);

  useEffect(() => {
    if (!expandedNgoId || loadingNeedsNgoId === expandedNgoId || !expandedNeedsRef.current) {
      return;
    }

    expandedNeedsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [expandedNgoId, loadingNeedsNgoId]);

  const approveNgo = async (ngoId) => {
    if (!online) {
      alert("You are offline. Reconnect before approving NGOs.");
      return;
    }

    setApprovingNgoId(ngoId);

    try {
      await api.post(`/api/admin/ngos/${ngoId}/approve`);
      setPendingVerifications((current) =>
        current.filter((ngo) => ngo.id !== ngoId)
      );
      setNgos((current) =>
        current.map((ngo) =>
          ngo.id === ngoId
            ? {
                ...ngo,
                status: "APPROVED",
                verifiedAt: new Date().toISOString(),
              }
            : ngo
        )
      );
      setStats((current) =>
        current
          ? {
              ...current,
              pendingNgos: Math.max(Number(current.pendingNgos || 0) - 1, 0),
              approvedNgos: Number(current.approvedNgos || 0) + 1,
            }
          : current
      );
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to approve NGO."));
    } finally {
      setApprovingNgoId(null);
    }
  };

  const openRejectModal = (ngo) => {
    setRejectTarget(ngo);
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectReason("");
    setRejecting(false);
  };

  const rejectNgo = async () => {
    if (!online) {
      alert("You are offline. Reconnect before rejecting NGOs.");
      return;
    }
    if (!rejectTarget || !rejectReason.trim()) return;

    const targetSnapshot = rejectTarget;
    const previousPending = pendingVerifications;
    const previousStats = stats;
    setRejecting(true);
    setPendingVerifications((current) =>
      current.filter((ngo) => ngo.id !== targetSnapshot.id)
    );
    setStats((current) =>
      current
        ? {
            ...current,
            pendingNgos: Math.max(Number(current.pendingNgos || 0) - 1, 0),
          }
        : current
    );
    closeRejectModal();
    setActionNotice({
      tone: "pending",
      message: `Rejecting ${targetSnapshot.name || "NGO"}...`,
    });

    try {
      await api.post(`/api/admin/ngos/${targetSnapshot.id}/reject`, {
        reason: rejectReason.trim(),
      });
      setActionNotice({
        tone: "success",
        message: `${targetSnapshot.name || "NGO"} rejected successfully.`,
      });
    } catch (err) {
      setPendingVerifications(previousPending);
      setStats(previousStats);
      setActionNotice({
        tone: "error",
        message: getApiErrorMessage(err, "Failed to reject NGO."),
      });
    } finally {
      setRejecting(false);
    }
  };

  const openSuspendModal = (ngo) => {
    setSuspendResult(null);
    setSuspendTarget(ngo);
  };

  const confirmSuspend = async () => {
    if (!suspendTarget || !online) {
      if (!online) {
        alert("You are offline. Reconnect before suspending NGOs.");
      }
      return;
    }

    setSuspending(true);

    try {
      const response = await api.post(`/api/admin/ngos/${suspendTarget.id}/suspend`);
      setReports((current) =>
        current.filter((report) => (report?.ngo?.id ?? report?.ngoId) !== suspendTarget.id)
      );
      setNgos((current) => current.filter((ngo) => ngo.id !== suspendTarget.id));
      setSuspendTarget(null);
      setSuspendResult({
        ngoName: suspendTarget.name,
        ...response.data,
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to suspend NGO."));
    } finally {
      setSuspending(false);
    }
  };

  const closeSuspendFlow = () => {
    setSuspendTarget(null);
    setSuspendResult(null);
    setSuspending(false);
  };

  const loadNgoNeeds = async (ngoId) => {
    setLoadingNeedsNgoId(ngoId);

    try {
      const response = await api.get(`/api/admin/ngos/${ngoId}/needs`);
      setNgoNeedsById((current) => ({
        ...current,
        [ngoId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to load NGO needs."));
    } finally {
      setLoadingNeedsNgoId(null);
    }
  };

  const toggleNgoNeeds = async (ngoId) => {
    if (expandedNgoId === ngoId) {
      setExpandedNgoId(null);
      return;
    }

    setExpandedNgoId(ngoId);

    if (!ngoNeedsById[ngoId]) {
      await loadNgoNeeds(ngoId);
    }
  };

  const openNeedEditor = (ngoId, need) => {
    setEditingNeed(need);
    setEditingNeedNgoId(ngoId);
  };

  const closeNeedEditor = () => {
    setEditingNeed(null);
    setEditingNeedNgoId(null);
    setSavingNeed(false);
  };

  const handleSaveNeed = async (payload) => {
    if (!editingNeed || !editingNeedNgoId || !online) {
      if (!online) {
        alert("You are offline. Reconnect before updating needs.");
      }
      return;
    }

    setSavingNeed(true);

    try {
      await api.put(`/api/admin/needs/${editingNeed.id}`, payload);
      await loadNgoNeeds(editingNeedNgoId);
      closeNeedEditor();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update need."));
      setSavingNeed(false);
    }
  };

  const handleDeleteNeed = async (ngoId, needId) => {
    if (!online) {
      alert("You are offline. Reconnect before deleting needs.");
      return;
    }
    if (!window.confirm("Delete this need?")) return;

    try {
      await api.delete(`/api/admin/needs/${needId}`);
      await loadNgoNeeds(ngoId);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete need."));
    }
  };

  const tabCounts = {
    verify: Number(stats?.pendingNgos ?? pendingVerifications.length),
    reports: Number(stats?.totalReports ?? reports.length),
    ngos: Number(stats?.totalNgos ?? ngos.length),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[28px] border border-teal-700/20 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-6 py-8 text-white shadow-[0_24px_80px_rgba(13,148,136,0.18)] sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-100/80">
                  Control Center
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/85 sm:text-base">
                  Moderate reports, approve pending NGOs, and manage supportable
                  admin actions without leaving the review queue.
                </p>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <HeroMetric
                    label="Pending"
                    value={tabCounts.verify}
                  />
                  <HeroMetric
                    label="Reports"
                    value={tabCounts.reports}
                  />
                  <HeroMetric
                    label="NGOs"
                    value={tabCounts.ngos}
                  />
                  <HeroMetric
                    label="Today"
                    value={stats.pledgesToday}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {stats && (
          <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STAT_CARDS.map(({ key, label, icon, color }) => (
              <StatCard
                key={key}
                icon={icon}
                label={label}
                value={stats[key]}
                color={color}
              />
            ))}
          </div>
        )}

        {!loading && (
          <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="glass flex items-center gap-3 rounded-2xl border border-white/60 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
              {hydratingFullLists
                ? `Showing the first ${initialListLimit} verification records now. Reports and NGO management are still loading in the background.`
                : "Admin lists are fully loaded."}
            </div>
          </div>
        )}

        <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="glass-subtle grid overflow-hidden rounded-[24px] border border-white/60 p-2 shadow-sm md:grid-cols-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold text-center transition-all duration-200 ${
                tab === item.id
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              {item.label} ({tabCounts[item.id]})
            </button>
          ))}
          </div>
        </div>

        <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="glass rounded-2xl p-4 text-sm text-red-500">{error}</div>
          )}

          {!loading && actionNotice && (
            <div
              className={`glass rounded-2xl p-4 text-sm ${
                actionNotice.tone === "error"
                  ? "text-red-600"
                  : actionNotice.tone === "success"
                    ? "text-emerald-700"
                    : "text-teal-700"
              }`}
            >
              {actionNotice.message}
            </div>
          )}

          {!loading && tab === "verify" && (
            <section className="space-y-4">
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-slate-500">No pending verifications.</p>
                </div>
              ) : (
                pendingVerifications.map((ngo) => (
                  <article
                    key={ngo.id}
                    className="glass rounded-2xl p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      {ngo.photoUrl ? (
                        <img
                          src={ngo.photoUrl}
                          alt={ngo.name}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                      )}

                      <div>
                        <p className="text-xl font-semibold text-slate-900">{ngo.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{ngo.email}</p>
                        <p className="text-sm text-slate-500 mt-1">{ngo.address}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted {formatDateTime(ngo.createdAt)}
                        </p>

                        {ngo.documentUrl && (
                          <a
                            href={ngo.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 transition-all duration-200"
                          >
                            <FileText className="h-4 w-4" />
                            View uploaded document
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <button
                        onClick={() => approveNgo(ngo.id)}
                        disabled={!online || approvingNgoId === ngo.id}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {!online
                          ? "Offline"
                          : approvingNgoId === ngo.id
                            ? "Approving..."
                            : "Approve"}
                      </button>
                      <button
                        onClick={() => openRejectModal(ngo)}
                        disabled={!online || approvingNgoId === ngo.id}
                        className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        {online ? "Reject" : "Offline"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {!loading && tab === "reports" && (
            <section className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-slate-600">
                  Report dismissal is still blocked on a backend-confirmed endpoint, so
                  this view supports report review and NGO suspension only.
                </p>
              </div>

              {reportsLoading && groupedReports.length === 0 ? (
                <div className="glass rounded-2xl py-12 text-center">
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading reported NGOs...
                  </p>
                </div>
              ) : groupedReports.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-slate-500">No reported NGOs.</p>
                </div>
              ) : (
                groupedReports.map((group) => {
                  const expanded = expandedReportNgoId === group.ngoId;

                  return (
                    <article key={group.ngoId} className="glass rounded-2xl overflow-hidden">
                      <div className="p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold text-slate-900">
                              {group.ngoName}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {group.reportCount} report{group.reportCount === 1 ? "" : "s"}
                            </span>
                            {group.reportCount >= 3 && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                High priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            Review the submitted reasons below, then suspend the NGO if the
                            reports warrant moderation action.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                          <button
                            onClick={() =>
                              setExpandedReportNgoId((current) =>
                                current === group.ngoId ? null : group.ngoId
                              )
                            }
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center justify-center gap-2"
                          >
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {expanded ? "Hide Reports" : "View Reports"}
                          </button>
                          <button
                            type="button"
                            disabled
                            className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 cursor-not-allowed"
                          >
                            Dismiss Unavailable
                          </button>
                          <button
                            onClick={() =>
                              openSuspendModal({ id: group.ngoId, name: group.ngoName })
                            }
                            disabled={!online}
                            className="bg-red-500 text-white hover:bg-red-600 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            {online ? "Suspend NGO" : "Offline"}
                          </button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="border-t border-slate-200/60 bg-white/40 px-5 py-4 space-y-3">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className="glass-subtle rounded-2xl px-4 py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {item.reason}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Reported by {item.reporterEmail}
                                </p>
                              </div>
                              <p className="text-xs text-slate-400">
                                {formatDateTime(item.reportedAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          )}

          {!loading && tab === "ngos" && (
            <section className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-slate-600">
                  Per-NGO need inspection now uses the dedicated admin read endpoint, and
                  supported override actions use the existing admin need update and delete routes.
                </p>
              </div>

              {ngosLoading && ngos.length === 0 ? (
                <div className="glass rounded-2xl py-12 text-center">
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading NGO management list...
                  </p>
                </div>
              ) : ngos.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-slate-500">No NGOs available.</p>
                </div>
              ) : (
                ngos.map((ngo) => {
                  const isSuspended = ngo.status === "SUSPENDED";

                  return (
                    <article
                      key={ngo.id}
                      className="glass rounded-2xl p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        {ngo.photoUrl ? (
                          <img
                            src={ngo.photoUrl}
                            alt={ngo.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-semibold text-slate-900">
                              {ngo.name}
                            </h2>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isSuspended
                                  ? "bg-red-100 text-red-600"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {titleCase(ngo.status)}
                            </span>
                            {ngo.trustScore !== null && ngo.trustLabel && (
                              <TrustBadge
                                score={ngo.trustScore}
                                label={ngo.trustLabel}
                              />
                            )}
                          </div>

                          <p className="text-sm text-slate-600 mt-2">{ngo.email}</p>
                          <p className="text-sm text-slate-500 mt-1">{ngo.address}</p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>
                              Active needs count:{" "}
                              {ngo.activeNeedsCount ?? "Not exposed in current contract"}
                            </span>
                            {ngo.categoryOfWork && (
                              <span>Category: {titleCase(ngo.categoryOfWork)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <button
                          onClick={() => toggleNgoNeeds(ngo.id)}
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center justify-center gap-2"
                        >
                          {expandedNgoId === ngo.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {loadingNeedsNgoId === ngo.id
                            ? "Loading Needs..."
                            : expandedNgoId === ngo.id
                              ? "Hide Needs"
                              : "View Needs"}
                        </button>
                        <button
                          type="button"
                          disabled={isSuspended || !online}
                          onClick={() => openSuspendModal({ id: ngo.id, name: ngo.name })}
                          className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                          <Ban className="h-4 w-4" />
                          {!online ? "Offline" : isSuspended ? "Already Suspended" : "Suspend"}
                        </button>
                        {isSuspended && (
                          <p className="text-xs text-slate-400 max-w-48">
                            Reinstate is intentionally hidden until the backend confirms a
                            supported admin route for it.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })
              )}

              {expandedNgoId && (
                <section ref={expandedNeedsRef} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {expandedNgo?.name ? `${expandedNgo.name} Needs` : "NGO Needs"}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Review and moderate the selected NGO&apos;s active and historical needs.
                      </p>
                    </div>
                  </div>

                  {loadingNeedsNgoId === expandedNgoId ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (ngoNeedsById[expandedNgoId] || []).length === 0 ? (
                    <div className="text-center py-10">
                      <Package className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-slate-500">No needs available for this NGO.</p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {(ngoNeedsById[expandedNgoId] || []).map((need) => (
                        <article
                          key={need.id}
                          className="glass-subtle rounded-2xl p-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">
                              {need.itemName}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {titleCase(need.category)} · {need.quantityPledged}/{need.quantityRequired} pledged
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {need.quantityRemaining} remaining · {titleCase(need.status)}
                            </p>
                            {need.description && (
                              <p className="text-sm text-slate-500 mt-2">{need.description}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => openNeedEditor(expandedNgoId, need)}
                              disabled={!online}
                              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Pencil className="h-4 w-4" />
                              {online ? "Edit Need" : "Offline"}
                            </button>
                            <button
                              onClick={() => handleDeleteNeed(expandedNgoId, need.id)}
                              disabled={!online}
                              className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              {online ? "Delete Need" : "Offline"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </section>
          )}
        </main>

        {suspendTarget && !suspendResult && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg max-w-md w-full">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-2xl font-semibold text-slate-900">Suspend NGO</h2>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                You are about to suspend <span className="font-medium">{suspendTarget.name}</span>.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Active needs may be closed by the backend.</li>
                <li>Existing pledge activity may be affected by the cascade.</li>
                <li>The NGO will be removed from the moderation views after success.</li>
              </ul>

              <p className="mt-4 text-sm font-medium text-red-600">
                Use this only when the reported behavior warrants administrative action.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={confirmSuspend}
                  disabled={suspending || !online}
                  className="bg-red-500 text-white hover:bg-red-600 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suspending ? "Suspending..." : online ? "Confirm Suspend" : "Offline"}
                </button>
                <button
                  onClick={closeSuspendFlow}
                  disabled={suspending}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {rejectTarget && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg max-w-md w-full">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="h-6 w-6" />
                <h2 className="text-2xl font-semibold text-slate-900">Reject NGO</h2>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                Provide a reason for rejecting{" "}
                <span className="font-medium">{rejectTarget.name}</span>.
              </p>

              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                placeholder="Explain what needs to be corrected before approval."
                className="mt-4 w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
              />

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={rejectNgo}
                  disabled={rejecting || !rejectReason.trim() || !online}
                  className="bg-red-500 text-white hover:bg-red-600 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejecting ? "Rejecting..." : online ? "Confirm Reject" : "Offline"}
                </button>
                <button
                  onClick={closeRejectModal}
                  disabled={rejecting}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {suspendResult && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg max-w-md w-full">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
                <h2 className="text-2xl font-semibold text-slate-900">NGO Suspended</h2>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                {suspendResult.ngoName} was suspended successfully.
              </p>

              {suspendResult.message && (
                <p className="text-sm text-slate-500 mt-2">{suspendResult.message}</p>
              )}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {typeof suspendResult.needsClosed === "number" && (
                  <p>{suspendResult.needsClosed} needs closed</p>
                )}
                {typeof suspendResult.pledgesCancelled === "number" && (
                  <p>{suspendResult.pledgesCancelled} pledges cancelled</p>
                )}
                {typeof suspendResult.donorsNotified === "number" && (
                  <p>{suspendResult.donorsNotified} donors notified</p>
                )}
              </div>

              <button
                onClick={closeSuspendFlow}
                className="mt-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {editingNeed && (
          <NeedEditorModal
            initialData={editingNeed}
            onClose={closeNeedEditor}
            onSave={handleSaveNeed}
            saving={savingNeed}
          />
        )}
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "border-teal-200/70 bg-white text-teal-700",
    green: "border-emerald-200/70 bg-white text-emerald-700",
    yellow: "border-amber-200/80 bg-white text-amber-700",
    red: "border-rose-200/80 bg-white text-rose-700",
  };

  return (
    <div
      className={`glass rounded-[24px] border p-5 shadow-sm ${colorClasses[color] || colorClasses.blue}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-60">
            {label}
          </p>
          <p className="mt-3 text-4xl font-bold leading-none">{value ?? "-"}</p>
        </div>
        <div className="rounded-2xl bg-current/10 p-3">
          <Icon className="h-5 w-5 opacity-80" />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-50/70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value ?? "-"}</p>
    </div>
  );
}
