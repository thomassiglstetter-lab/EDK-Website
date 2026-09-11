"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import hallsData from "@/data/halls.json";
import {
  Lock,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Check,
  AlertCircle,
  Eye,
  LogOut,
  Newspaper,
  Users,
  Handshake,
  Calendar,
  Clock,
  Activity,
  Home,
  RefreshCw,
  Image as ImageIcon,
  Search,
  Filter,
  X,
  Sparkles,
  ExternalLink,
  Camera,
  Upload,
  Crop,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Trophy,
  Shield,
  Globe,
  Tag,
  ChevronRight,
  Inbox,
  Server,
  Key,
  EyeOff,
  Send,
  MessageSquare,
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";

// Types
export interface Article {
  id: string;
  category: "Spielbetrieb" | "Jugend" | "Verein";
  categoryColor: "azure" | "crimson";
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
}

export type TeamCategory = "Herren" | "Damen" | "Jugend männlich" | "Jugend weiblich" | "Kinderhandball" | "Minis";

export interface TrainingSession {
  day: string;
  time: string;
  hallName: string;
  hallId?: string;
}

export interface CoachContact {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  league: string;
  trainer: string;
  coaches?: CoachContact[];
  trainingTimes: string;
  trainingLocation: string;
  trainingSchedule?: TrainingSession[];
  category: TeamCategory;
  accentType: "crimson" | "azure";
  image?: string;
  showImage?: boolean;
  portrait?: string;
  groupUrl?: string;
  nuligaCategory?: string;
  hallId?: string;
  coachContact?: CoachContact;
  socialMedia?: { instagram?: string };
}

export type SponsorTier = "gold" | "silver" | "partner" | "none";

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  url?: string;
  logo?: string;
  fit?: "cover" | "contain";
  scale?: number;
}

export interface ContactCategory {
  id: string;
  name: string;
  email: string;
  description?: string;
  active?: boolean;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  category: string;
  targetEmail: string;
  message: string;
  read: boolean;
  mailSent: boolean;
  sendError?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

export function formatImageLabel(url?: string | null): string {
  if (!url) return "Kein Logo";
  if (url.startsWith("data:")) {
    const isSvg = url.includes("image/svg");
    const isPng = url.includes("image/png");
    const isWebp = url.includes("image/webp");
    const fmt = isSvg ? "SVG" : isPng ? "PNG" : isWebp ? "WEBP" : "Bild";
    return `Individueller Zuschnitt (${fmt})`;
  }
  return url.replace(/^\/?(sponsors\/|teams\/|news\/|uploads\/sponsors\/|uploads\/teams\/|uploads\/news\/|uploads\/)/, "");
}

export function updateSponsorsCacheAndNotify(next: any[]) {
  try {
    localStorage.setItem("edk_sponsors_cache", JSON.stringify(next));
    window.dispatchEvent(new Event("edk_sponsors_updated"));
  } catch {}
}

const DEFAULT_PIN = "eintracht2026";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"news" | "teams" | "sponsors" | "nuliga" | "contact">("news");

  // ==========================================
  // NEWS STATE
  // ==========================================
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState<boolean>(true);
  const [newsSearchQuery, setNewsSearchQuery] = useState<string>("");
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>("Alle");

  // News Modal State
  const [newsModalOpen, setNewsModalOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newsFormData, setNewsFormData] = useState<{
    title: string;
    category: "Spielbetrieb" | "Jugend" | "Verein";
    date: string;
    readTime: string;
    image: string;
    excerpt: string;
    content: string;
  }>({
    title: "",
    category: "Spielbetrieb",
    date: "",
    readTime: "3 Min. Lesezeit",
    image: "",
    excerpt: "",
    content: "",
  });
  const [uploadingNewsImage, setUploadingNewsImage] = useState<boolean>(false);
  const [newsFormError, setNewsFormError] = useState<string>("");
  const [newsSaving, setNewsSaving] = useState<boolean>(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<boolean>(false);

  // ==========================================
  // TEAMS STATE
  // ==========================================
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<string>("Alle");

  // Team Modal State
  const [teamModalOpen, setTeamModalOpen] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamFormData, setTeamFormData] = useState<{
    name: string;
    slug: string;
    league: string;
    category: TeamCategory;
    accentType: "crimson" | "azure";
    image: string;
    showImage: boolean;
    groupUrl: string;
    nuligaCategory: string;
    instagram: string;
    coaches: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
    trainingSchedule: Array<{
      day: string;
      time: string;
      hallId: string;
      hallName: string;
    }>;
  }>({
    name: "",
    slug: "",
    league: "",
    category: "Herren",
    accentType: "crimson",
    image: "",
    showImage: true,
    groupUrl: "",
    nuligaCategory: "",
    instagram: "https://www.instagram.com/handballeintracht/",
    coaches: [{ name: "", role: "Cheftrainer", email: "", phone: "" }],
    trainingSchedule: [
      {
        day: "Dienstag",
        time: "19:30 – 21:00 Uhr",
        hallId: "260180",
        hallName: "Sporthalle Mittelschule (MSK)",
      },
    ],
  });
  const [teamFormError, setTeamFormError] = useState<string>("");
  const [teamSaving, setTeamSaving] = useState<boolean>(false);
  const [uploadingTeamImage, setUploadingTeamImage] = useState<boolean>(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<boolean>(false);

  // ==========================================
  // NULIGA MATCHES STATE
  // ==========================================
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLastSynced, setMatchesLastSynced] = useState<string>("");
  const [matchesLoading, setMatchesLoading] = useState<boolean>(true);
  const [syncingNuLiga, setSyncingNuLiga] = useState<boolean>(false);
  const [nuLigaCategoryFilter, setNuLigaCategoryFilter] = useState<string>("all");
  const [nuLigaOnlyHome, setNuLigaOnlyHome] = useState<boolean>(false);
  const [nuLigaSearch, setNuLigaSearch] = useState<string>("");

  // ==========================================
  // SPONSORS STATE
  // ==========================================
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState<boolean>(true);
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState<string>("");
  const [sponsorTierFilter, setSponsorTierFilter] = useState<string>("Alle");

  // Sponsor Modal State
  const [sponsorModalOpen, setSponsorModalOpen] = useState<boolean>(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [sponsorFormData, setSponsorFormData] = useState<{
    name: string;
    tier: SponsorTier;
    url: string;
    logo: string;
    fit?: "cover" | "contain";
    scale?: number;
  }>({
    name: "",
    tier: "partner",
    url: "",
    logo: "",
    fit: "cover",
    scale: 1.0,
  });
  const sponsorFormDataRef = React.useRef(sponsorFormData);
  useEffect(() => {
    sponsorFormDataRef.current = sponsorFormData;
  }, [sponsorFormData]);
  const [uploadingSponsorLogo, setUploadingSponsorLogo] = useState<boolean>(false);
  const [sponsorFormError, setSponsorFormError] = useState<string>("");
  const [sponsorSaving, setSponsorSaving] = useState<boolean>(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [deletingSponsor, setDeletingSponsor] = useState<boolean>(false);

  // Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropTargetName, setCropTargetName] = useState<string>("");
  const [cropTargetFolder, setCropTargetFolder] = useState<string>("sponsors");
  const [cropAspectRatio, setCropAspectRatio] = useState<number>(2.4);
  const [cropTitle, setCropTitle] = useState<string>("Logo zuschneiden & positionieren");
  const [cropCallback, setCropCallback] = useState<((url: string) => void | Promise<void>) | null>(null);

  // ==========================================
  // CONTACT & FORM STATE
  // ==========================================
  const [contactCategories, setContactCategories] = useState<ContactCategory[]>([]);
  const [generalContactEmail, setGeneralContactEmail] = useState<string>("kontakt@handballeintracht.de");
  const [contactLoading, setContactLoading] = useState<boolean>(true);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>("");
  const [savingGeneralEmail, setSavingGeneralEmail] = useState<boolean>(false);

  // Subtabs in Contact: "inbox" | "categories" | "smtp"
  const [contactSubTab, setContactSubTab] = useState<"inbox" | "categories" | "smtp">("inbox");
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [messagesFilter, setMessagesFilter] = useState<"all" | "unread">("all");
  const [messageSearchQuery, setMessageSearchQuery] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<boolean>(false);

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "kontakt@handballeintracht.de",
    fromName: "Eintracht Dachau-Karlsfeld Handball",
  });
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);
  const [savingSmtp, setSavingSmtp] = useState<boolean>(false);
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);
  const [testSmtpEmail, setTestSmtpEmail] = useState<string>("");
  const [testSmtpResult, setTestSmtpResult] = useState<{ success: boolean; message: string } | null>(null);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ContactCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<{
    id: string;
    name: string;
    email: string;
    description: string;
    active: boolean;
  }>({
    id: "",
    name: "",
    email: "",
    description: "",
    active: true,
  });
  const [categoryFormError, setCategoryFormError] = useState<string>("");
  const [savingCategory, setSavingCategory] = useState<boolean>(false);

  // Category Delete Confirmation Modal
  const [categoryToDelete, setCategoryToDelete] = useState<ContactCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check Local Storage on Mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("eintracht_admin_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Data on Authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch News
    fetch("/api/news", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
        setArticlesLoading(false);
      })
      .catch((err) => {
        console.error("News fetch error:", err);
        setArticlesLoading(false);
      });

    // Fetch Teams
    fetch("/api/teams", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
        setTeamsLoading(false);
      })
      .catch((err) => {
        console.error("Teams fetch error:", err);
        setTeamsLoading(false);
      });

    // Fetch Matches (nuLiga)
    fetch("/api/matches", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMatches(data.allMatches || []);
          setMatchesLastSynced(data.lastSynced || "");
        }
        setMatchesLoading(false);
      })
      .catch((err) => {
        console.error("Matches fetch error:", err);
        setMatchesLoading(false);
      });

    // Fetch Sponsors
    let deletedSponsorsList: string[] = [];
    try {
      const delRaw = localStorage.getItem("edk_deleted_sponsors");
      if (delRaw) deletedSponsorsList = JSON.parse(delRaw);
    } catch {}

    const isDeletedSponsor = (s: { id?: string; name?: string }) => {
      if (s.id && deletedSponsorsList.includes(s.id)) return true;
      if (s.name && deletedSponsorsList.includes(s.name.toLowerCase().trim())) return true;
      return false;
    };

    try {
      const cached = localStorage.getItem("edk_sponsors_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((s: Sponsor) => !isDeletedSponsor(s));
          setSponsors(filtered);
          setSponsorsLoading(false);
        }
      }
    } catch {}

    fetch("/api/sponsors", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const serverValid = data.filter((s: Sponsor) => !isDeletedSponsor(s));
          let merged = serverValid;
          try {
            const cachedRaw = localStorage.getItem("edk_sponsors_cache");
            if (cachedRaw) {
              const cachedArr: Sponsor[] = JSON.parse(cachedRaw);
              if (Array.isArray(cachedArr) && cachedArr.length > 0) {
                const validCachedArr = cachedArr.filter((c: Sponsor) => !isDeletedSponsor(c));
                const cachedMap = new Map<string, Sponsor>();
                validCachedArr.forEach((c) => {
                  if (c.id) cachedMap.set(c.id, c);
                  else if (c.name) cachedMap.set(c.name.toLowerCase().trim(), c);
                });
                merged = serverValid.map((server) => {
                  const cached = cachedMap.get(server.id) || cachedMap.get(server.name.toLowerCase().trim());
                  if (!cached) return server;
                  return {
                    ...server,
                    tier: cached.tier || server.tier,
                    logo: cached.logo || server.logo,
                    fit: cached.fit || server.fit,
                    scale: cached.scale !== undefined ? cached.scale : server.scale,
                    url: cached.url !== undefined ? cached.url : server.url,
                  };
                });
                validCachedArr.forEach((c) => {
                  const exists = merged.some(
                    (m) =>
                      (m.id && c.id && m.id === c.id) ||
                      (m.name && c.name && m.name.toLowerCase().trim() === c.name.toLowerCase().trim())
                  );
                  if (!exists && !isDeletedSponsor(c)) merged.push(c);
                });
              }
            }
          } catch {}

          setSponsors(merged);
          updateSponsorsCacheAndNotify(merged);
        }
        setSponsorsLoading(false);
      })
      .catch((err) => {
        console.error("Sponsors fetch error:", err);
        setSponsorsLoading(false);
      });

    // Fetch Contact Categories & Settings
    fetch("/api/contact", { cache: "no-store", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.categories)) {
          setContactCategories(data.categories);
        }
        if (data && data.generalEmail) {
          setGeneralContactEmail(data.generalEmail);
        }
        if (data && Array.isArray(data.messages)) {
          setContactMessages(data.messages);
        }
        if (data && data.smtp) {
          setSmtpConfig((prev) => ({
            ...prev,
            ...data.smtp,
          }));
        }
        setContactLoading(false);
      })
      .catch((err) => {
        console.error("Contact fetch error:", err);
        setContactLoading(false);
      });
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("eintracht_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Ungültiger Passcode. Bitte erneut versuchen.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("eintracht_admin_auth");
    setPinInput("");
  };

  // ==========================================
  // NEWS HANDLERS
  // ==========================================
  const openCreateNewsModal = () => {
    setEditingArticle(null);
    const now = new Date();
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}. ${months[now.getMonth()]} ${now.getFullYear()}`;

    setNewsFormData({
      title: "",
      category: "Spielbetrieb",
      date: formattedDate,
      readTime: "3 Min. Lesezeit",
      image: "",
      excerpt: "",
      content: "",
    });
    setNewsFormError("");
    setNewsModalOpen(true);
  };

  const openEditNewsModal = (article: Article) => {
    setEditingArticle(article);
    setNewsFormData({
      title: article.title,
      category: article.category,
      date: article.date,
      readTime: article.readTime,
      image: article.image || "",
      excerpt: article.excerpt,
      content: article.content || article.excerpt,
    });
    setNewsFormError("");
    setNewsModalOpen(true);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.title.trim() || !newsFormData.excerpt.trim()) {
      setNewsFormError("Titel und Kurzbeschreibung sind Pflichtfelder.");
      return;
    }

    setNewsSaving(true);
    setNewsFormError("");

    try {
      if (editingArticle) {
        // Update existing article
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingArticle.id, ...newsFormData }),
        });
        if (!res.ok) throw new Error("Aktualisierung fehlgeschlagen.");
        const updated = await res.json();
        setArticles(articles.map((a) => (a.id === updated.id ? updated : a)));
        showToast("Artikel erfolgreich aktualisiert!");
      } else {
        // Create new article
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsFormData),
        });
        if (!res.ok) throw new Error("Erstellung fehlgeschlagen.");
        const created = await res.json();
        setArticles([created, ...articles]);
        showToast("Neuer Artikel erfolgreich veröffentlicht!");
      }
      setNewsModalOpen(false);
    } catch (err) {
      console.error(err);
      setNewsFormError("Fehler beim Speichern. Bitte Verbindung prüfen.");
    } finally {
      setNewsSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    setDeletingArticle(true);
    try {
      const res = await fetch(`/api/news?id=${articleToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen.");
      setArticles(articles.filter((a) => a.id !== articleToDelete.id));
      showToast("Artikel gelöscht.", "success");
      setArticleToDelete(null);
    } catch (err) {
      console.error(err);
      showToast("Fehler beim Löschen des Artikels.", "error");
    } finally {
      setDeletingArticle(false);
    }
  };

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewsImage(true);
    setNewsFormError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "news");
      fd.append("slug", newsFormData.title || "article");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setNewsFormData((prev) => ({ ...prev, image: json.url }));
        showToast("Artikelbild erfolgreich hochgeladen!");
      } else {
        setNewsFormError(json.error || "Bild-Upload fehlgeschlagen.");
      }
    } catch (err) {
      console.error("News upload error:", err);
      setNewsFormError("Bild-Upload fehlgeschlagen. Bitte Verbindung prüfen.");
    } finally {
      setUploadingNewsImage(false);
      e.target.value = "";
    }
  };

  const persistNewsImage = async (newUrl: string) => {
    setNewsFormData((prev) => ({ ...prev, image: newUrl }));
    if (editingArticle) {
      try {
        const payload = {
          id: editingArticle.id,
          title: newsFormData.title || editingArticle.title,
          category: newsFormData.category || editingArticle.category,
          excerpt: newsFormData.excerpt || editingArticle.excerpt,
          content: newsFormData.content || editingArticle.content,
          image: newUrl,
        };
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          setEditingArticle(updated);
          showToast("Artikelbild erfolgreich angepasst und dauerhaft gespeichert!");
          return;
        }
      } catch (err) {
        console.error("Auto-save news image failed:", err);
        showToast("Bild übernommen. Bitte unten auf 'Änderungen speichern' klicken.");
        return;
      }
    }
    showToast("Bild zugeschnitten! Bitte unten auf 'Artikel veröffentlichen' klicken.");
  };

  const handleNewsImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setCropImageSrc(localUrl);
    setCropTargetName(newsFormData.title || "article");
    setCropTargetFolder("news");
    setCropAspectRatio(16 / 9);
    setCropTitle("Artikelbild zuschneiden & anpassen (16:9)");
    setCropCallback(() => async (newUrl: string) => {
      await persistNewsImage(newUrl);
    });
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleOpenNewsCrop = () => {
    if (!newsFormData.image) return;
    setCropImageSrc(newsFormData.image);
    setCropTargetName(newsFormData.title || "article");
    setCropTargetFolder("news");
    setCropAspectRatio(16 / 9);
    setCropTitle("Artikelbild zuschneiden & anpassen (16:9)");
    setCropCallback(() => async (newUrl: string) => {
      await persistNewsImage(newUrl);
    });
    setCropModalOpen(true);
  };

  // ==========================================
  // TEAMS HANDLERS
  // ==========================================
  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTeamImage(true);
    setTeamFormError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "teams");
      fd.append("slug", teamFormData.slug || teamFormData.name || "team");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setTeamFormData((prev) => ({ ...prev, image: json.url }));
        showToast("Mannschaftsbild erfolgreich hochgeladen!");
      } else {
        setTeamFormError(json.error || "Bild-Upload fehlgeschlagen.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setTeamFormError("Bild-Upload fehlgeschlagen. Bitte Verbindung prüfen.");
    } finally {
      setUploadingTeamImage(false);
    }
  };

  const persistTeamImage = async (newUrl: string) => {
    setTeamFormData((prev) => ({ ...prev, image: newUrl }));
    if (editingTeam) {
      try {
        const payload = {
          id: editingTeam.id,
          image: newUrl,
        };
        const res = await fetch("/api/teams", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setEditingTeam(updated);
          showToast("Mannschaftsfoto erfolgreich angepasst und dauerhaft gespeichert!");
          return;
        }
      } catch (err) {
        console.error("Auto-save team image failed:", err);
        showToast("Foto übernommen. Bitte unten auf 'Änderungen speichern' klicken.");
        return;
      }
    }
    showToast("Foto zugeschnitten! Bitte unten auf 'Team speichern' klicken.");
  };

  const handleTeamImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setCropImageSrc(localUrl);
    setCropTargetName(teamFormData.slug || teamFormData.name || "team");
    setCropTargetFolder("teams");
    setCropAspectRatio(16 / 9);
    setCropTitle("Mannschaftsfoto zuschneiden & anpassen (16:9)");
    setCropCallback(() => async (newUrl: string) => {
      await persistTeamImage(newUrl);
    });
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleOpenTeamCrop = () => {
    if (!teamFormData.image) return;
    setCropImageSrc(teamFormData.image);
    setCropTargetName(teamFormData.slug || teamFormData.name || "team");
    setCropTargetFolder("teams");
    setCropAspectRatio(16 / 9);
    setCropTitle("Mannschaftsfoto zuschneiden & anpassen (16:9)");
    setCropCallback(() => async (newUrl: string) => {
      await persistTeamImage(newUrl);
    });
    setCropModalOpen(true);
  };

  const openCreateTeamModal = () => {
    setEditingTeam(null);
    setTeamFormData({
      name: "",
      slug: "",
      league: "",
      category: "Herren",
      accentType: "crimson",
      image: "",
      showImage: true,
      groupUrl: "",
      nuligaCategory: "",
      instagram: "https://www.instagram.com/handballeintracht/",
      coaches: [{ name: "", role: "Cheftrainer", email: "", phone: "" }],
      trainingSchedule: [
        {
          day: "Dienstag",
          time: "19:30 – 21:00 Uhr",
          hallId: "260180",
          hallName: "Sporthalle Mittelschule (MSK)",
        },
      ],
    });
    setTeamFormError("");
    setTeamModalOpen(true);
  };

  const openEditTeamModal = (team: Team) => {
    setEditingTeam(team);

    // Initial coaches
    let initialCoaches: Array<{ name: string; role: string; email: string; phone: string }> = [];
    if (team.coaches && team.coaches.length > 0) {
      initialCoaches = team.coaches.map((c) => ({
        name: c.name || "",
        role: c.role || "Trainer",
        email: c.email || "",
        phone: c.phone || "",
      }));
    } else if (team.coachContact?.name || team.trainer) {
      initialCoaches = [
        {
          name: team.coachContact?.name || team.trainer || "",
          role: team.coachContact?.role || "Cheftrainer",
          email: team.coachContact?.email || "",
          phone: team.coachContact?.phone || "",
        },
      ];
    }
    if (initialCoaches.length === 0) {
      initialCoaches = [{ name: "", role: "Cheftrainer", email: "", phone: "" }];
    }

    // Initial trainingSchedule
    let initialSchedule: Array<{ day: string; time: string; hallId: string; hallName: string }> = [];
    if (team.trainingSchedule && team.trainingSchedule.length > 0) {
      initialSchedule = team.trainingSchedule.map((s) => {
        const rawId = (s.hallId || "").replace("hall-", "");
        return {
          day: s.day || "Dienstag",
          time: s.time || "19:30 – 21:00 Uhr",
          hallId: rawId || "260180",
          hallName: s.hallName || "Sporthalle Mittelschule (MSK)",
        };
      });
    } else {
      const rawId = (team.hallId || "").replace("hall-", "") || "260180";
      initialSchedule = [
        {
          day: "Dienstag",
          time: team.trainingTimes || "19:30 – 21:00 Uhr",
          hallId: rawId,
          hallName: team.trainingLocation || "Sporthalle Mittelschule (MSK)",
        },
      ];
    }

    setTeamFormData({
      name: team.name,
      slug: team.slug || "",
      league: team.league,
      category: team.category,
      accentType: team.accentType,
      image: team.image || "",
      showImage: team.showImage !== false,
      groupUrl: team.groupUrl || "",
      nuligaCategory: team.nuligaCategory || team.name,
      instagram: team.socialMedia?.instagram || "https://www.instagram.com/handballeintracht/",
      coaches: initialCoaches,
      trainingSchedule: initialSchedule,
    });
    setTeamFormError("");
    setTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validCoaches = teamFormData.coaches.filter((c) => c.name.trim().length > 0);
    if (!teamFormData.name.trim() || !teamFormData.league.trim() || validCoaches.length === 0) {
      setTeamFormError("Teamname, Liga und mindestens ein Trainer mit Name sind Pflichtfelder.");
      return;
    }

    setTeamSaving(true);
    setTeamFormError("");

    const primaryCoach = validCoaches[0];
    const trainingSummary = teamFormData.trainingSchedule
      .map((s) => `${s.day.slice(0, 2)} ${s.time}`)
      .join(" & ") || "Nach Absprache";
    const primaryHall = teamFormData.trainingSchedule[0];

    const payload = {
      name: teamFormData.name.trim(),
      slug: teamFormData.slug.trim() || teamFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      league: teamFormData.league.trim(),
      trainer: primaryCoach.name.trim(),
      coaches: validCoaches,
      coachContact: {
        name: primaryCoach.name.trim(),
        role: primaryCoach.role.trim() || "Cheftrainer",
        email: primaryCoach.email.trim(),
        phone: primaryCoach.phone.trim(),
      },
      trainingSchedule: teamFormData.trainingSchedule.map((s) => ({
        day: s.day,
        time: s.time,
        hallId: s.hallId.startsWith("hall-") ? s.hallId : `hall-${s.hallId}`,
        hallName: s.hallName,
      })),
      trainingTimes: trainingSummary,
      trainingLocation: primaryHall ? primaryHall.hallName : "Sporthalle Mittelschule (MSK)",
      hallId: primaryHall ? (primaryHall.hallId.startsWith("hall-") ? primaryHall.hallId : `hall-${primaryHall.hallId}`) : "hall-260180",
      category: teamFormData.category,
      accentType: teamFormData.accentType,
      image: teamFormData.image.trim(),
      showImage: teamFormData.showImage,
      portrait: "",
      groupUrl: teamFormData.groupUrl.trim(),
      nuligaCategory: teamFormData.nuligaCategory.trim() || teamFormData.name.trim(),
      socialMedia: {
        instagram: teamFormData.instagram.trim(),
      },
    };

    try {
      if (editingTeam) {
        // Update existing team
        const res = await fetch("/api/teams", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTeam.id, ...payload }),
        });
        if (!res.ok) throw new Error("Aktualisierung fehlgeschlagen.");
        const updated = await res.json();
        setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditingTeam(null);
        try {
          localStorage.setItem("teams_updated", Date.now().toString());
        } catch {}
        showToast("Team erfolgreich aktualisiert!");
      } else {
        // Create new team
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erstellung fehlgeschlagen.");
        const created = await res.json();
        setTeams((prev) => [...prev, created]);
        setEditingTeam(null);
        try {
          localStorage.setItem("teams_updated", Date.now().toString());
        } catch {}
        showToast("Neues Team erfolgreich hinzugefügt!");
      }
      setTeamModalOpen(false);
    } catch (err) {
      console.error(err);
      setTeamFormError("Fehler beim Speichern des Teams.");
    } finally {
      setTeamSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    setDeletingTeam(true);
    try {
      const res = await fetch(`/api/teams?id=${teamToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen.");
      setTeams(teams.filter((t) => t.id !== teamToDelete.id));
      showToast("Team gelöscht.", "success");
      setTeamToDelete(null);
    } catch (err) {
      console.error(err);
      showToast("Fehler beim Löschen des Teams.", "error");
    } finally {
      setDeletingTeam(false);
    }
  };

  // ==========================================
  // SPONSORS HANDLERS
  // ==========================================
  const openCreateSponsorModal = () => {
    setEditingSponsor(null);
    setSponsorFormData({
      name: "",
      tier: "partner",
      url: "",
      logo: "",
      fit: "cover",
      scale: 1.0,
    });
    setSponsorFormError("");
    setSponsorModalOpen(true);
  };

  const openEditSponsorModal = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    const initialFit = sponsor.fit || (sponsor.logo && !sponsor.logo.toLowerCase().endsWith(".svg") ? "cover" : "contain");
    setSponsorFormData({
      name: sponsor.name,
      tier: sponsor.tier,
      url: sponsor.url || "",
      logo: sponsor.logo || "",
      fit: initialFit,
      scale: sponsor.scale !== undefined ? sponsor.scale : 1.0,
    });
    setSponsorFormError("");
    setSponsorModalOpen(true);
  };

  const persistSponsorLogo = async (newUrl: string) => {
    const currentForm = sponsorFormDataRef.current;
    const determinedFit = currentForm.fit || (newUrl.toLowerCase().endsWith(".svg") ? "contain" : "cover");
    const determinedScale = currentForm.scale || 1.0;
    setSponsorFormData((prev) => ({ ...prev, logo: newUrl, fit: determinedFit, scale: determinedScale }));
    if (editingSponsor) {
      const payload = {
        id: editingSponsor.id,
        name: currentForm.name || editingSponsor.name,
        tier: currentForm.tier || editingSponsor.tier,
        url: currentForm.url !== undefined ? currentForm.url : (editingSponsor.url || ""),
        logo: newUrl,
        fit: determinedFit,
        scale: determinedScale,
      };

      try {
        const res = await fetch("/api/sponsors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setSponsors((prev) => {
            const next = prev.map((s) => (s.id === updated.id ? updated : s));
            updateSponsorsCacheAndNotify(next);
            return next;
          });
          setEditingSponsor(updated);
          showToast("Logo & Partner-Stufe erfolgreich gespeichert!");
          return;
        }
      } catch (err) {
        console.warn("PUT /api/sponsors failed, fallback to local cache:", err);
      }

      // Fallback if backend failed (e.g. read-only filesystem)
      const localUpdated = { ...editingSponsor, ...payload };
      setSponsors((prev) => {
        const next = prev.map((s) => (s.id === localUpdated.id ? localUpdated : s));
        updateSponsorsCacheAndNotify(next);
        return next;
      });
      setEditingSponsor(localUpdated);
      showToast("Logo übernommen & Vorschau aktualisiert!");
      return;
    }
    showToast("Logo zugeschnitten! Bitte unten auf 'Partner anlegen' klicken.");
  };

  const handleSponsorLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSponsorLogo(true);
    setSponsorFormError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "sponsors");
      fd.append("slug", sponsorFormData.name || "sponsor");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success && json.url) {
        await persistSponsorLogo(json.url);
      } else {
        setSponsorFormError(json.error || "Logo-Upload fehlgeschlagen.");
      }
    } catch (err) {
      console.error("Sponsor logo upload error:", err);
      setSponsorFormError("Logo-Upload fehlgeschlagen. Bitte Verbindung prüfen.");
    } finally {
      setUploadingSponsorLogo(false);
      e.target.value = "";
    }
  };

  const handleSponsorLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setCropImageSrc(localUrl);
    setCropTargetName(sponsorFormData.name || file.name.replace(/\.[^/.]+$/, ""));
    setCropTargetFolder("sponsors");
    setCropAspectRatio(2.4);
    setCropTitle("Sponsor-Logo zuschneiden & positionieren");
    setCropCallback(() => async (newUrl: string) => {
      await persistSponsorLogo(newUrl);
    });
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleOpenSponsorCrop = () => {
    if (!sponsorFormData.logo) return;
    setCropImageSrc(sponsorFormData.logo);
    setCropTargetName(sponsorFormData.name || "sponsor");
    setCropTargetFolder("sponsors");
    setCropAspectRatio(2.4);
    setCropTitle("Sponsor-Logo zuschneiden & positionieren");
    setCropCallback(() => async (newUrl: string) => {
      await persistSponsorLogo(newUrl);
    });
    setCropModalOpen(true);
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorFormData.name.trim()) {
      setSponsorFormError("Unternehmensname ist ein Pflichtfeld.");
      return;
    }

    setSponsorSaving(true);
    setSponsorFormError("");

    // If this sponsor name or ID was in edk_deleted_sponsors, remove it so it's not hidden
    try {
      const delRaw = localStorage.getItem("edk_deleted_sponsors");
      if (delRaw) {
        const delList: string[] = JSON.parse(delRaw);
        const nextDel = delList.filter(
          (d) =>
            d !== sponsorFormData.name.toLowerCase().trim() &&
            (!editingSponsor || d !== editingSponsor.id)
        );
        localStorage.setItem("edk_deleted_sponsors", JSON.stringify(nextDel));
      }
    } catch {}

    try {
      if (editingSponsor) {
        // Update existing sponsor
        const payload = {
          id: editingSponsor.id,
          name: sponsorFormData.name,
          tier: sponsorFormData.tier,
          url: sponsorFormData.url || "",
          logo: sponsorFormData.logo || "",
          fit: sponsorFormData.fit || (sponsorFormData.logo?.toLowerCase().endsWith(".svg") ? "contain" : "cover"),
          scale: sponsorFormData.scale !== undefined ? sponsorFormData.scale : 1.0,
        };

        try {
          const res = await fetch("/api/sponsors", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            setSponsors((prev) => {
              const next = prev.map((s) => (s.id === updated.id ? updated : s));
              updateSponsorsCacheAndNotify(next);
              return next;
            });
            setEditingSponsor(updated);
            showToast("Sponsor erfolgreich aktualisiert!");
            setSponsorModalOpen(false);
            return;
          }
        } catch (apiErr) {
          console.warn("PUT /api/sponsors failed, fallback to local cache:", apiErr);
        }

        // Fallback update
        const localUpdated = { ...editingSponsor, ...payload };
        setSponsors((prev) => {
          const next = prev.map((s) => (s.id === localUpdated.id ? localUpdated : s));
          updateSponsorsCacheAndNotify(next);
          return next;
        });
        setEditingSponsor(localUpdated);
        showToast("Sponsor erfolgreich aktualisiert!");
      } else {
        // Create new sponsor
        const newId = "sp-" + Date.now().toString();
        const payload: Sponsor = {
          id: newId,
          name: sponsorFormData.name,
          tier: sponsorFormData.tier,
          url: sponsorFormData.url || "",
          logo: sponsorFormData.logo || "",
          fit: sponsorFormData.fit || (sponsorFormData.logo?.toLowerCase().endsWith(".svg") ? "contain" : "cover"),
          scale: sponsorFormData.scale !== undefined ? sponsorFormData.scale : 1.0,
        };

        try {
          const res = await fetch("/api/sponsors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const created = await res.json();
            setSponsors((prev) => {
              const next = [...prev, created];
              updateSponsorsCacheAndNotify(next);
              return next;
            });
            showToast("Neuer Partner erfolgreich angelegt!");
            setSponsorModalOpen(false);
            return;
          }
        } catch (apiErr) {
          console.warn("POST /api/sponsors failed, fallback to local cache:", apiErr);
        }

        // Fallback create
        setSponsors((prev) => {
          const next = [...prev, payload];
          updateSponsorsCacheAndNotify(next);
          return next;
        });
        showToast("Neuer Partner erfolgreich angelegt!");
      }
      setSponsorModalOpen(false);
    } catch (err) {
      console.error(err);
      setSponsorFormError("Fehler beim Speichern des Sponsors.");
    } finally {
      setSponsorSaving(false);
    }
  };

  const handleSyncNuLiga = async () => {
    setSyncingNuLiga(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const resMatches = await fetch("/api/matches", { cache: "no-store" });
        const jsonMatches = await resMatches.json();
        if (jsonMatches.success) {
          setMatches(jsonMatches.allMatches || []);
          setMatchesLastSynced(jsonMatches.lastSynced || "");
        }
        showToast(`nuLiga erfolgreich abgeglichen: ${data.matchesCount || matches.length} Spiele & ${data.tablesCount || 0} Tabellen aktualisiert!`, "success");
      } else {
        showToast("Synchronisation mit nuLiga fehlgeschlagen.", "error");
      }
    } catch (err) {
      showToast("Netzwerkfehler beim Abgleich mit nuLiga.", "error");
    } finally {
      setSyncingNuLiga(false);
    }
  };

  const handleDeleteSponsor = async () => {
    if (!sponsorToDelete) return;
    const targetId = sponsorToDelete.id;
    const targetName = sponsorToDelete.name;
    setDeletingSponsor(true);

    // 1. Immediately record in edk_deleted_sponsors in localStorage
    try {
      const delRaw = localStorage.getItem("edk_deleted_sponsors");
      const delList: string[] = delRaw ? JSON.parse(delRaw) : [];
      if (targetId && !delList.includes(targetId)) delList.push(targetId);
      if (targetName && !delList.includes(targetName.toLowerCase().trim())) {
        delList.push(targetName.toLowerCase().trim());
      }
      localStorage.setItem("edk_deleted_sponsors", JSON.stringify(delList));
    } catch {}

    // 2. Immediately update state and notify all listeners
    setSponsors((prev) => {
      const next = prev.filter((s) => s.id !== targetId && s.name.toLowerCase().trim() !== targetName.toLowerCase().trim());
      updateSponsorsCacheAndNotify(next);
      return next;
    });

    // 3. Attempt server deletion (catch non-fatally on read-only environments)
    try {
      await fetch(`/api/sponsors?id=${targetId}`, { method: "DELETE" });
    } catch (apiErr) {
      console.warn("DELETE /api/sponsors failed, local removal preserved:", apiErr);
    }

    showToast("Partner entfernt.", "success");
    setSponsorToDelete(null);
    setDeletingSponsor(false);
  };

  // ==========================================
  // CONTACT & FORM HANDLERS
  // ==========================================
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      id: "",
      name: "",
      email: "",
      description: "",
      active: true,
    });
    setCategoryFormError("");
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: ContactCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      id: cat.id,
      name: cat.name,
      email: cat.email,
      description: cat.description || "",
      active: cat.active !== false,
    });
    setCategoryFormError("");
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError("");

    if (!categoryFormData.name.trim()) {
      setCategoryFormError("Bitte gib einen Kategorienamen ein.");
      return;
    }
    if (!categoryFormData.email.trim() || !categoryFormData.email.includes("@")) {
      setCategoryFormError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setSavingCategory(true);

    try {
      if (editingCategory) {
        // PUT update
        const res = await fetch("/api/contact", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryFormData),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setContactCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? json.category : c))
          );
          showToast(`Kategorie "${json.category.name}" aktualisiert!`);
          setCategoryModalOpen(false);
        } else {
          setCategoryFormError(json.error || "Fehler beim Aktualisieren der Kategorie.");
        }
      } else {
        // POST create
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryFormData),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setContactCategories((prev) => [...prev, json.category]);
          showToast(`Kategorie "${json.category.name}" erfolgreich angelegt!`);
          setCategoryModalOpen(false);
        } else {
          setCategoryFormError(json.error || "Fehler beim Anlegen der Kategorie.");
        }
      }
    } catch (err) {
      console.error("Save category error:", err);
      setCategoryFormError("Netzwerkfehler beim Speichern der Kategorie.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryActive = async (cat: ContactCategory) => {
    try {
      const updatedActive = cat.active === false ? true : false;
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, active: updatedActive }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setContactCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, active: updatedActive } : c))
        );
        showToast(
          `Kategorie "${cat.name}" ${updatedActive ? "aktiviert" : "deaktiviert"}.`
        );
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeletingCategory(true);

    try {
      const res = await fetch(`/api/contact?id=${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setContactCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        showToast(`Kategorie "${categoryToDelete.name}" gelöscht.`);
        setCategoryToDelete(null);
      } else {
        showToast(json.error || "Fehler beim Löschen.", "error");
      }
    } catch (err) {
      console.error("Delete category error:", err);
      showToast("Netzwerkfehler beim Löschen.", "error");
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleSaveGeneralEmail = async () => {
    if (!generalContactEmail.trim() || !generalContactEmail.includes("@")) {
      showToast("Bitte gib eine gültige Haupt-E-Mail-Adresse ein.", "error");
      return;
    }
    setSavingGeneralEmail(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateGeneralEmail",
          generalEmail: generalContactEmail.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Haupt-Kontaktadresse erfolgreich gespeichert!");
      } else {
        showToast(json.error || "Fehler beim Speichern.", "error");
      }
    } catch (err) {
      console.error("Save general email error:", err);
      showToast("Netzwerkfehler beim Speichern.", "error");
    } finally {
      setSavingGeneralEmail(false);
    }
  };

  const handleToggleMessageRead = async (msg: ContactMessage) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleMessageRead", messageId: msg.id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setContactMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: json.read } : m))
        );
        if (selectedMessage && selectedMessage.id === msg.id) {
          setSelectedMessage((prev) => (prev ? { ...prev, read: json.read } : null));
        }
        showToast(json.read ? "Als gelesen markiert." : "Als ungelesen markiert.");
      }
    } catch (err) {
      console.error("Error toggling message read:", err);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setDeletingMessage(true);
    try {
      const res = await fetch(`/api/contact?messageId=${messageToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setContactMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
        if (selectedMessage && selectedMessage.id === messageToDelete.id) {
          setSelectedMessage(null);
        }
        showToast("Nachricht gelöscht.");
        setMessageToDelete(null);
      } else {
        showToast(json.error || "Fehler beim Löschen.", "error");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      showToast("Netzwerkfehler beim Löschen.", "error");
    } finally {
      setDeletingMessage(false);
    }
  };

  const handleSaveSmtp = async () => {
    setSavingSmtp(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSmtp", smtp: smtpConfig }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("SMTP-Einstellungen erfolgreich gespeichert!");
      } else {
        showToast(json.error || "Fehler beim Speichern der SMTP-Einstellungen.", "error");
      }
    } catch (err) {
      console.error("Save SMTP error:", err);
      showToast("Netzwerkfehler beim Speichern.", "error");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testSmtpEmail.trim() || !testSmtpEmail.includes("@")) {
      showToast("Bitte gib eine gültige Test-E-Mail-Adresse ein.", "error");
      return;
    }
    setTestingSmtp(true);
    setTestSmtpResult(null);
    try {
      const res = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "testSmtp",
          ...smtpConfig,
          testEmail: testSmtpEmail.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTestSmtpResult({ success: true, message: json.message || "Test-E-Mail erfolgreich versendet!" });
        showToast("Test-E-Mail erfolgreich versendet!");
      } else {
        setTestSmtpResult({ success: false, message: json.error || "Fehler beim Versenden der Test-E-Mail." });
        showToast("Verbindungstest fehlgeschlagen!", "error");
      }
    } catch (err: any) {
      console.error("Test SMTP error:", err);
      setTestSmtpResult({ success: false, message: err.message || "Netzwerkfehler beim Verbindungstest." });
      showToast("Netzwerkfehler beim Test.", "error");
    } finally {
      setTestingSmtp(false);
    }
  };

  // Filtered lists
  const filteredArticles = articles.filter((a) => {
    const matchesCat = newsCategoryFilter === "Alle" || a.category === newsCategoryFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(newsSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredTeams = teams.filter((t) => {
    const matchesCat =
      teamCategoryFilter === "Alle" ||
      (teamCategoryFilter === "Kinderhandball"
        ? t.category === "Kinderhandball" || t.category === "Minis"
        : t.category === teamCategoryFilter);
    const matchesSearch =
      t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      t.league.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      t.trainer.toLowerCase().includes(teamSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredSponsors = sponsors.filter((s) => {
    const matchesTier = sponsorTierFilter === "Alle" || (sponsorTierFilter === "none" ? (s.tier === "none" || !s.tier) : s.tier === sponsorTierFilter);
    const matchesSearch = s.name.toLowerCase().includes(sponsorSearchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const filteredCategories = contactCategories.filter((c) => {
    const q = contactSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const contactStats = {
    total: contactCategories.length,
    active: contactCategories.filter((c) => c.active !== false).length,
    inactive: contactCategories.filter((c) => c.active === false).length,
  };

  const filteredMessages = contactMessages.filter((m) => {
    const matchesFilter = messagesFilter === "all" || !m.read;
    const q = messageSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      m.targetEmail.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const messageStats = {
    total: contactMessages.length,
    unread: contactMessages.filter((m) => !m.read).length,
    mailSent: contactMessages.filter((m) => m.mailSent).length,
  };

  // Stats
  const newsStats = {
    total: articles.length,
    spielbetrieb: articles.filter((a) => a.category === "Spielbetrieb").length,
    jugend: articles.filter((a) => a.category === "Jugend").length,
    verein: articles.filter((a) => a.category === "Verein").length,
  };

  const teamStats = {
    total: teams.length,
    herren: teams.filter((t) => t.category === "Herren").length,
    damen: teams.filter((t) => t.category === "Damen").length,
    jugend: teams.filter((t) => t.category.startsWith("Jugend")).length,
    kinder: teams.filter((t) => t.category === "Kinderhandball" || t.category === "Minis").length,
  };

  const sponsorStats = {
    total: sponsors.length,
    gold: sponsors.filter((s) => s.tier === "gold").length,
    silver: sponsors.filter((s) => s.tier === "silver").length,
    partner: sponsors.filter((s) => s.tier === "partner").length,
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#080B10",
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "40px 32px",
            background: "rgba(12, 17, 26, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 20px auto",
              borderRadius: "50%",
              background: "rgba(143, 24, 56, 0.2)",
              border: "1px solid var(--color-crimson)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-crimson-bright)",
            }}
          >
            <Lock size={24} />
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Eintracht Admin
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-dim)",
              marginBottom: "28px",
            }}
          >
            Zugang zur Webseiten-Verwaltung der Eintracht Dachau-Karlsfeld.
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <input
                type="password"
                autoFocus
                placeholder="Passcode eingeben..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  outline: "none",
                }}
              />
              {authError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    color: "#F87171",
                    fontSize: "0.78rem",
                    marginTop: "8px",
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px 20px",
                fontSize: "0.92rem",
              }}
            >
              <span>Anmelden</span>
            </button>
          </form>

          <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--color-text-dim)",
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              <span>Zurück zur Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        minHeight: "100vh",
        background: "#080B10",
        color: "#F1F5F9",
        paddingBottom: "80px",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 20px",
            borderRadius: "var(--radius-sm)",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
            color: "#FFFFFF",
            fontSize: "0.9rem",
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(11, 15, 22, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <img src="/logo-dark.png" alt="Logo" style={{ width: "34px", height: "auto" }} />
            </Link>

            <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.12)", paddingLeft: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#FFFFFF",
                    letterSpacing: "0.02em",
                  }}
                >
                  Vereins-Manager
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(143, 24, 56, 0.25)",
                    border: "1px solid var(--color-crimson)",
                    color: "var(--color-crimson-bright)",
                    textTransform: "uppercase",
                  }}
                >
                  Intern
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)" }}>
                Content &amp; Daten-Management
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
            >
              <span>Website öffnen</span>
              <ExternalLink size={13} />
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                background: "transparent",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={14} />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1320px", margin: "0 auto", padding: "36px 24px" }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "32px",
            paddingBottom: "12px",
            overflowX: "auto",
          }}
        >
          {/* TAB 1: NEWS */}
          <button
            onClick={() => setActiveTab("news")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "news" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeTab === "news" ? "#FFFFFF" : "var(--color-text-dim)",
              fontWeight: activeTab === "news" ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Newspaper size={16} color={activeTab === "news" ? "var(--color-crimson-bright)" : "currentColor"} />
            <span>News &amp; Berichte</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              }}
            >
              {newsStats.total}
            </span>
          </button>

          {/* TAB 2: TEAMS */}
          <button
            onClick={() => setActiveTab("teams")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "teams" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeTab === "teams" ? "#FFFFFF" : "var(--color-text-dim)",
              fontWeight: activeTab === "teams" ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Users size={16} color={activeTab === "teams" ? "var(--color-azure-bright)" : "currentColor"} />
            <span>Mannschaften</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              }}
            >
              {teamStats.total}
            </span>
          </button>

          {/* TAB 3: SPONSORS */}
          <button
            onClick={() => setActiveTab("sponsors")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "sponsors" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeTab === "sponsors" ? "#FFFFFF" : "var(--color-text-dim)",
              fontWeight: activeTab === "sponsors" ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Handshake size={16} color={activeTab === "sponsors" ? "#F59E0B" : "currentColor"} />
            <span>Partner &amp; Sponsoren</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
              }}
            >
              {sponsorStats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("nuliga")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "nuliga" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeTab === "nuliga" ? "#FFFFFF" : "var(--color-text-dim)",
              fontWeight: activeTab === "nuliga" ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Activity size={16} color={activeTab === "nuliga" ? "#10B981" : "currentColor"} />
            <span>Spielplan &amp; nuLiga</span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                background: activeTab === "nuliga" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.08)",
                color: activeTab === "nuliga" ? "#10B981" : "#FFFFFF",
                fontWeight: 700,
              }}
            >
              {matches.length || 146}
            </span>
          </button>

          {/* TAB 5: CONTACT & FORM */}
          <button
            onClick={() => setActiveTab("contact")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: activeTab === "contact" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: activeTab === "contact" ? "#FFFFFF" : "var(--color-text-dim)",
              fontWeight: activeTab === "contact" ? 600 : 500,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Mail size={16} color={activeTab === "contact" ? "#C084FC" : "currentColor"} />
            <span>Kontaktformular &amp; E-Mails</span>
            {contactMessages.filter((m) => !m.read).length > 0 ? (
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                }}
              >
                {contactMessages.filter((m) => !m.read).length} neu
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  background: activeTab === "contact" ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.08)",
                  color: activeTab === "contact" ? "#C084FC" : "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {contactCategories.length}
              </span>
            )}
          </button>

        </div>

        {/* ============================================================== */}
        {/* TAB 1 CONTENT: NEWS MANAGEMENT                                 */}
        {/* ============================================================== */}
        {activeTab === "news" && (
          <div>
            {/* Quick Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-crimson)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Gesamt Artikel
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {newsStats.total}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-azure)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Spielbetrieb
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {newsStats.spielbetrieb}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-crimson)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Jugendbereich
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {newsStats.jugend}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #10B981",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Vereinsleben
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {newsStats.verein}
                </div>
              </div>
            </div>

            {/* Action Bar (Search, Filter, New Button) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    flex: 1,
                    maxWidth: "400px",
                  }}
                >
                  <Search size={16} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Artikel nach Titel suchen..."
                    value={newsSearchQuery}
                    onChange={(e) => setNewsSearchQuery(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {["Alle", "Spielbetrieb", "Jugend", "Verein"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewsCategoryFilter(cat)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid",
                        borderColor: newsCategoryFilter === cat ? "var(--color-crimson)" : "rgba(255, 255, 255, 0.08)",
                        background: newsCategoryFilter === cat ? "rgba(143, 24, 56, 0.25)" : "transparent",
                        color: newsCategoryFilter === cat ? "#FFFFFF" : "#94A3B8",
                        fontSize: "0.8rem",
                        fontWeight: newsCategoryFilter === cat ? 600 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={openCreateNewsModal}
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                <span>Neuer Artikel</span>
              </button>
            </div>

            {/* Articles List */}
            {articlesLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
                Artikel werden geladen...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  background: "rgba(14, 18, 28, 0.6)",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                }}
              >
                <Newspaper size={32} color="#64748B" style={{ margin: "0 auto 12px auto" }} />
                <h3 style={{ fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "4px" }}>Keine Artikel gefunden</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Passe deine Suchbegriffe an oder erstelle einen neuen Beitrag.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredArticles.map((article) => {
                  const isCrimson = article.categoryColor === "crimson";
                  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
                  const badgeBg = isCrimson ? "rgba(143, 24, 56, 0.2)" : "rgba(72, 156, 216, 0.2)";

                  return (
                    <div
                      key={article.id}
                      className="glass-panel"
                      style={{
                        padding: "18px 22px",
                        background: "rgba(12, 16, 24, 0.8)",
                        borderLeft: `3px solid ${accentColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "260px" }}>
                        <div
                          style={{
                            width: "72px",
                            height: "54px",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            background: "rgba(255, 255, 255, 0.05)",
                            flexShrink: 0,
                            position: "relative",
                          }}
                        >
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748B",
                              }}
                            >
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                background: badgeBg,
                                color: isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)",
                              }}
                            >
                              {article.category}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{article.date}</span>
                            <span style={{ fontSize: "0.75rem", color: "#64748B" }}>• {article.readTime}</span>
                          </div>
                          <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "4px" }}>
                            {article.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.82rem",
                              color: "#94A3B8",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {article.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Link
                          href={`/news/${article.id}`}
                          target="_blank"
                          title="Vorschau"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#CBD5E1",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                          }}
                        >
                          <Eye size={14} />
                          <span>Vorschau</span>
                        </Link>

                        <button
                          onClick={() => openEditNewsModal(article)}
                          title="Bearbeiten"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#FFFFFF",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={14} />
                          <span>Bearbeiten</span>
                        </button>

                        <button
                          onClick={() => setArticleToDelete(article)}
                          title="Löschen"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Löschen</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2 CONTENT: TEAMS MANAGEMENT                                */}
        {/* ============================================================== */}
        {activeTab === "teams" && (
          <div>
            {/* Quick Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-azure)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Gesamt Teams
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {teamStats.total}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-crimson)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Herren-Teams
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {teamStats.herren}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-azure)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Damen-Teams
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {teamStats.damen}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #10B981",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Jugend-Teams
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {teamStats.jugend}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #F59E0B",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Kinderhandball
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {teamStats.kinder}
                </div>
              </div>
            </div>

            {/* Action Bar (Search, Filter, New Button) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    flex: 1,
                    maxWidth: "380px",
                  }}
                >
                  <Search size={16} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Team, Liga oder Trainer suchen..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["Alle", "Herren", "Damen", "Jugend männlich", "Jugend weiblich", "Kinderhandball"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTeamCategoryFilter(cat)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid",
                        borderColor: teamCategoryFilter === cat ? "var(--color-azure)" : "rgba(255, 255, 255, 0.08)",
                        background: teamCategoryFilter === cat ? "rgba(72, 156, 216, 0.25)" : "transparent",
                        color: teamCategoryFilter === cat ? "#FFFFFF" : "#94A3B8",
                        fontSize: "0.8rem",
                        fontWeight: teamCategoryFilter === cat ? 600 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={openCreateTeamModal}
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                <span>Neues Team anlegen</span>
              </button>
            </div>

            {/* Teams List */}
            {teamsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
                Teams werden geladen...
              </div>
            ) : filteredTeams.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  background: "rgba(14, 18, 28, 0.6)",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                }}
              >
                <Users size={32} color="#64748B" style={{ margin: "0 auto 12px auto" }} />
                <h3 style={{ fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "4px" }}>Keine Teams gefunden</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Passe deine Suchbegriffe an oder erstelle ein neues Team.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {filteredTeams.map((team) => {
                  const isCrimson = team.accentType === "crimson";
                  const accentColor = isCrimson ? "var(--color-crimson)" : "var(--color-azure)";
                  const accentBright = isCrimson ? "var(--color-crimson-bright)" : "var(--color-azure-bright)";

                  return (
                    <div
                      key={team.id}
                      className="glass-panel"
                      style={{
                        padding: "20px 22px",
                        background: "rgba(12, 16, 24, 0.85)",
                        borderTop: `3px solid ${accentColor}`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div>
                        {/* Thumbnail image if present */}
                        {team.image && (
                          <div
                            style={{
                              width: "100%",
                              height: "130px",
                              borderRadius: "10px",
                              overflow: "hidden",
                              marginBottom: "14px",
                              background: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              position: "relative",
                            }}
                          >
                            <img
                              src={team.image}
                              alt={team.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(12, 16, 24, 0.8) 0%, transparent 50%)",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: "8px",
                                left: "10px",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                color: "#FFFFFF",
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                              }}
                            >
                              Kader 2026/27
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              background: isCrimson ? "rgba(143, 24, 56, 0.2)" : "rgba(72, 156, 216, 0.2)",
                              color: accentBright,
                            }}
                          >
                            {team.category}
                          </span>
                          <span style={{ fontSize: "0.74rem", color: "#64748B" }}>/{team.slug}</span>
                        </div>

                        <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "2px" }}>
                          {team.name}
                        </h4>
                        <div style={{ fontSize: "0.82rem", color: accentBright, fontWeight: 500, marginBottom: "12px" }}>
                          {team.league}
                        </div>

                        {/* Status badges */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                          {team.groupUrl ? (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "rgba(14, 165, 233, 0.12)",
                                border: "1px solid rgba(14, 165, 233, 0.25)",
                                color: "#38BDF8",
                                fontWeight: 600,
                              }}
                            >
                              nuLiga Tabelle aktiv
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "#64748B",
                              }}
                            >
                              Keine nuLiga-URL
                            </span>
                          )}
                          {team.socialMedia?.instagram && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                background: "rgba(225, 48, 108, 0.12)",
                                border: "1px solid rgba(225, 48, 108, 0.25)",
                                color: "#FFA6BD",
                                fontWeight: 600,
                              }}
                            >
                              Instagram
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: team.showImage !== false ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 255, 255, 0.05)",
                              border: `1px solid ${team.showImage !== false ? "rgba(34, 197, 94, 0.25)" : "rgba(255, 255, 255, 0.1)"}`,
                              color: team.showImage !== false ? "#4ADE80" : "#94A3B8",
                              fontWeight: 600,
                            }}
                          >
                            {team.showImage !== false ? "Foto: Aktiv" : "Foto: Aus"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            padding: "12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            fontSize: "0.84rem",
                            color: "#CBD5E1",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Users size={14} color="#94A3B8" />
                            <span><strong>Trainer:</strong> {team.trainer} {team.coachContact?.role ? `(${team.coachContact.role})` : ""}</span>
                          </div>
                          {team.coachContact?.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#94A3B8" }}>
                              <Mail size={13} />
                              <span>{team.coachContact.email}</span>
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Clock size={14} color="#94A3B8" />
                            <span>{team.trainingTimes}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MapPin size={14} color="#94A3B8" />
                            <span>{team.trainingLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <Link
                          href={`/teams/${team.slug}`}
                          target="_blank"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "var(--color-azure-bright)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <span>Seite ansehen</span>
                          <ExternalLink size={12} />
                        </Link>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEditTeamModal(team)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "7px 12px",
                              borderRadius: "var(--radius-sm)",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#FFFFFF",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Bearbeiten</span>
                          </button>

                          <button
                            onClick={() => setTeamToDelete(team)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "7px 12px",
                              borderRadius: "var(--radius-sm)",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#F87171",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Löschen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3 CONTENT: SPONSORS MANAGEMENT                             */}
        {/* ============================================================== */}
        {activeTab === "sponsors" && (
          <div>
            {/* Quick Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #F59E0B",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Gesamt Partner
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FFFFFF", marginTop: "4px" }}>
                  {sponsorStats.total}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #FBBF24",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Gold-Partner
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#FBBF24", marginTop: "4px" }}>
                  {sponsorStats.gold}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid #94A3B8",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Silber-Partner
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#CBD5E1", marginTop: "4px" }}>
                  {sponsorStats.silver}
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: "20px 24px",
                  background: "rgba(14, 18, 28, 0.7)",
                  borderLeft: "3px solid var(--color-azure)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Förderer
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-azure-bright)", marginTop: "4px" }}>
                  {sponsorStats.partner}
                </div>
              </div>
            </div>

            {/* Action Bar (Search, Tier Filter, New Button) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    flex: 1,
                    maxWidth: "380px",
                  }}
                >
                  <Search size={16} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Partner nach Namen suchen..."
                    value={sponsorSearchQuery}
                    onChange={(e) => setSponsorSearchQuery(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { key: "Alle", label: "Alle" },
                    { key: "gold", label: "Gold" },
                    { key: "silver", label: "Silber" },
                    { key: "partner", label: "Förderer" },
                    { key: "none", label: "Ohne Stufe" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSponsorTierFilter(t.key)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid",
                        borderColor: sponsorTierFilter === t.key ? "#F59E0B" : "rgba(255, 255, 255, 0.08)",
                        background: sponsorTierFilter === t.key ? "rgba(245, 158, 11, 0.2)" : "transparent",
                        color: sponsorTierFilter === t.key ? "#FBBF24" : "#94A3B8",
                        fontSize: "0.8rem",
                        fontWeight: sponsorTierFilter === t.key ? 600 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={openCreateSponsorModal}
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                <span>Neuen Partner anlegen</span>
              </button>
            </div>

            {/* Sponsors Table / Cards */}
            {sponsorsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
                Partner werden geladen...
              </div>
            ) : filteredSponsors.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  background: "rgba(14, 18, 28, 0.6)",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                }}
              >
                <Handshake size={32} color="#64748B" style={{ margin: "0 auto 12px auto" }} />
                <h3 style={{ fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "4px" }}>Keine Partner gefunden</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Passe deine Suchbegriffe an oder lege einen neuen Partner an.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filteredSponsors.map((sponsor) => {
                  const tierConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
                    gold: {
                      label: "Gold-Partner",
                      color: "#FBBF24",
                      bg: "rgba(245, 158, 11, 0.12)",
                      border: "rgba(245, 158, 11, 0.4)",
                    },
                    silver: {
                      label: "Silber-Partner",
                      color: "#CBD5E1",
                      bg: "rgba(148, 163, 184, 0.12)",
                      border: "rgba(148, 163, 184, 0.35)",
                    },
                    partner: {
                      label: "Förderer",
                      color: "var(--color-azure-bright)",
                      bg: "rgba(72, 156, 216, 0.12)",
                      border: "rgba(72, 156, 216, 0.35)",
                    },
                    none: {
                      label: "Ohne Stufe (Leer)",
                      color: "#94A3B8",
                      bg: "rgba(255, 255, 255, 0.05)",
                      border: "rgba(255, 255, 255, 0.12)",
                    },
                  };
                  const tierKey = sponsor.tier && tierConfig[sponsor.tier] ? sponsor.tier : "none";
                  const t = tierConfig[tierKey];

                  return (
                    <div
                      key={sponsor.id}
                      className="glass-panel"
                      style={{
                        padding: "20px 22px",
                        background: "rgba(12, 16, 24, 0.85)",
                        borderLeft: `3px solid ${t.color}`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              padding: "3px 8px",
                              borderRadius: "var(--radius-full)",
                              background: t.bg,
                              border: `1px solid ${t.border}`,
                              color: t.color,
                            }}
                          >
                            {t.label}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#64748B" }}>ID: {sponsor.id}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                          <div style={{ height: "42px", width: "88px", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", flexShrink: 0, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <img
                              src={sponsor.logo || "/logo-dark.png"}
                              alt={sponsor.name}
                              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-dark.png"; }}
                            />
                          </div>
                          <div>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "2px" }}>
                              {sponsor.name}
                            </h4>
                            <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                              Logo: {formatImageLabel(sponsor.logo)}
                            </span>
                          </div>
                        </div>

                        {sponsor.url ? (
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "var(--color-azure-bright)",
                              fontSize: "0.8rem",
                              textDecoration: "none",
                              wordBreak: "break-all",
                            }}
                          >
                            <Globe size={13} />
                            <span>{sponsor.url.replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Keine Website hinterlegt</span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "8px",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <button
                          onClick={() => openEditSponsorModal(sponsor)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#FFFFFF",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Bearbeiten</span>
                        </button>

                        <button
                          onClick={() => setSponsorToDelete(sponsor)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "7px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Löschen</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ============================================================== */}
        {/* TAB 4 CONTENT: NULIGA SCHEDULE MANAGEMENT                     */}
        {/* ============================================================== */}
        {activeTab === "nuliga" && (
          <div>
            {/* nuLiga Status & Action Card */}
            <div
              className="glass-panel"
              style={{
                padding: "28px",
                borderRadius: "var(--radius-md)",
                marginBottom: "28px",
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(14, 165, 233, 0.04) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10B981",
                    }}
                  >
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                      nuLiga Handball Schnittstelle (BHV)
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "#94A3B8", margin: 0 }}>
                      Verein: <strong>Eintracht Dachau-Karlsfeld</strong> • Bayerischer Handball-Verband (BHV)
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px", fontSize: "0.82rem", color: "#CBD5E1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                    <span>Auto-Sync: <strong style={{ color: "#34D399" }}>Aktiv (alle 30 Min.)</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} style={{ color: "#38BDF8" }} />
                    <span>Gesamtspiele: <strong>{matches.length}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={13} style={{ color: "#F59E0B" }} />
                    <span>
                      Letzter Datenabgleich:{" "}
                      <strong>
                        {matchesLastSynced
                          ? `${new Date(matchesLastSynced).toLocaleDateString("de-DE")} ${new Date(matchesLastSynced).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`
                          : "Gerade eben"}
                      </strong>
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: "8px" }}>
                  Spielplan, Ergebnisse und Ligatabellen werden im Hintergrund vollautomatisch ohne manuelles Zutun aktuell gehalten.
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <a
                  href="https://bhv-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/clubInfoDisplay?club=105665"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#CBD5E1",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>Auf nuLiga ansehen</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  onClick={handleSyncNuLiga}
                  disabled={syncingNuLiga}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    cursor: syncingNuLiga ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <RefreshCw size={15} style={{ animation: syncingNuLiga ? "spin 1s linear infinite" : "none" }} />
                  <span>{syncingNuLiga ? "Synchronisiere..." : "Jetzt mit nuLiga synchronisieren"}</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                padding: "14px 18px",
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748B", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Filter size={13} /> Team:
                </span>
                {[
                  { id: "all", label: "Alle" },
                  { id: "Herren 1", label: "Herren 1" },
                  { id: "Herren 2", label: "Herren 2" },
                  { id: "Damen 1", label: "Damen 1" },
                  { id: "Damen 2", label: "Damen 2" },
                  { id: "m-jugend", label: "m-Jugend" },
                  { id: "w-jugend", label: "w-Jugend" },
                ].map((c) => {
                  const isSel = nuLigaCategoryFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setNuLigaCategoryFilter(c.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: isSel ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.08)",
                        background: isSel ? "rgba(16, 185, 129, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        color: isSel ? "#FFFFFF" : "#94A3B8",
                        fontSize: "0.8rem",
                        fontWeight: isSel ? 700 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => setNuLigaOnlyHome(!nuLigaOnlyHome)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: nuLigaOnlyHome ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.08)",
                    background: nuLigaOnlyHome ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    color: nuLigaOnlyHome ? "#10B981" : "#94A3B8",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Home size={13} />
                  <span>Nur Heimspiele</span>
                </button>

                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
                  <input
                    type="text"
                    placeholder="Gegner oder Liga suchen..."
                    value={nuLigaSearch}
                    onChange={(e) => setNuLigaSearch(e.target.value)}
                    style={{
                      padding: "6px 12px 6px 30px",
                      borderRadius: "6px",
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                      fontSize: "0.8rem",
                      outline: "none",
                      width: "190px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Matches Table */}
            {matchesLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                <RefreshCw size={28} style={{ animation: "spin 1.5s linear infinite", color: "#10B981", marginBottom: "10px" }} />
                <p>Spiele werden geladen...</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "rgba(0, 0, 0, 0.3)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#94A3B8" }}>
                        <th style={{ padding: "12px 16px" }}>Spiel-Nr.</th>
                        <th style={{ padding: "12px 16px" }}>Datum &amp; Zeit</th>
                        <th style={{ padding: "12px 16px" }}>Liga</th>
                        <th style={{ padding: "12px 16px" }}>Heimmannschaft</th>
                        <th style={{ padding: "12px 16px" }}>Gastmannschaft</th>
                        <th style={{ padding: "12px 16px" }}>Austragungsort</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Ergebnis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches
                        .filter((m) => {
                          if (nuLigaCategoryFilter !== "all") {
                            if (nuLigaCategoryFilter === "m-jugend") {
                              if (!m.category.startsWith("m") || m.category.includes("Herren")) return false;
                            } else if (nuLigaCategoryFilter === "w-jugend") {
                              if (!m.category.startsWith("w") || m.category.includes("Damen")) return false;
                            } else if (m.category !== nuLigaCategoryFilter) {
                              return false;
                            }
                          }
                          if (nuLigaOnlyHome && !m.isHome) return false;
                          if (nuLigaSearch.trim()) {
                            const q = nuLigaSearch.toLowerCase();
                            const inT = m.home.toLowerCase().includes(q) || m.guest.toLowerCase().includes(q);
                            const inL = m.league.toLowerCase().includes(q);
                            const inH = m.hallName.toLowerCase().includes(q);
                            if (!inT && !inL && !inH) return false;
                          }
                          return true;
                        })
                        .slice(0, 50)
                        .map((m, idx) => (
                          <tr
                            key={m.id || idx}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                              background: m.isHome ? "rgba(230, 57, 70, 0.04)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "12px 16px", color: "#64748B", fontFamily: "monospace" }}>
                              {m.matchNr}
                            </td>
                            <td style={{ padding: "12px 16px", color: "#FFFFFF", fontWeight: 600 }}>
                              {m.day}, {m.date} <span style={{ color: "#94A3B8", fontWeight: 400 }}>{m.time} Uhr</span>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ padding: "2px 7px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.06)", color: "#38BDF8", fontSize: "0.74rem", fontWeight: 600 }}>
                                {m.league}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", fontWeight: m.home.includes("Eintracht") ? 700 : 400, color: m.home.includes("Eintracht") ? "var(--color-crimson-bright)" : "#E2E8F0" }}>
                              {m.home}
                            </td>
                            <td style={{ padding: "12px 16px", fontWeight: m.guest.includes("Eintracht") ? 700 : 400, color: m.guest.includes("Eintracht") ? "var(--color-crimson-bright)" : "#E2E8F0" }}>
                              {m.guest}
                            </td>
                            <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "0.8rem" }}>
                              {m.courtUrl ? (
                                <a href={m.courtUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#94A3B8", textDecoration: "none" }}>
                                  {m.hallName || `Halle ${m.hallNr}`} ↗
                                </a>
                              ) : (
                                m.hallName || `Halle ${m.hallNr}`
                              )}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                              {m.result ? (
                                <span style={{ padding: "3px 8px", borderRadius: "4px", background: m.outcome === "win" ? "rgba(16, 185, 129, 0.2)" : m.outcome === "loss" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)", color: m.outcome === "win" ? "#10B981" : m.outcome === "loss" ? "#EF4444" : "#F59E0B", fontWeight: 700 }}>
                                  {m.result}
                                </span>
                              ) : (
                                <span style={{ color: "#64748B", fontSize: "0.78rem" }}>Anstehend</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5 CONTENT: CONTACT & FORM MANAGEMENT                       */}
        {/* ============================================================== */}
        {activeTab === "contact" && (
          <div>
            {/* Header & Sub-Tab Navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "-0.02em",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Mail size={24} color="#C084FC" />
                  <span>Kontakt &amp; E-Mail-System</span>
                </h2>
                <p style={{ color: "#94A3B8", fontSize: "0.92rem", marginTop: "4px" }}>
                  Verwalte eingehende Nachrichten im Posteingang, steuere die Weiterleitungs-Kategorien und konfiguriere den SMTP-Mailserver für den direkten Versand.
                </p>
              </div>

              {/* Sub-Tabs: Posteingang | Kategorien | E-Mail-Server */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  gap: "4px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setContactSubTab("inbox")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: contactSubTab === "inbox" ? "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)" : "transparent",
                    color: contactSubTab === "inbox" ? "#FFFFFF" : "#CBD5E1",
                    fontWeight: contactSubTab === "inbox" ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Inbox size={15} />
                  <span>Posteingang</span>
                  {messageStats.unread > 0 ? (
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: "#EF4444",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        boxShadow: "0 0 8px rgba(239, 68, 68, 0.5)",
                      }}
                    >
                      {messageStats.unread}
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.12)",
                        color: "#CBD5E1",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      {messageStats.total}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setContactSubTab("categories")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: contactSubTab === "categories" ? "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)" : "transparent",
                    color: contactSubTab === "categories" ? "#FFFFFF" : "#CBD5E1",
                    fontWeight: contactSubTab === "categories" ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Tag size={15} />
                  <span>Kategorien &amp; Routing</span>
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.12)",
                      color: "#CBD5E1",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {contactCategories.length}
                  </span>
                </button>

                <button
                  onClick={() => setContactSubTab("smtp")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: contactSubTab === "smtp" ? "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)" : "transparent",
                    color: contactSubTab === "smtp" ? "#FFFFFF" : "#CBD5E1",
                    fontWeight: contactSubTab === "smtp" ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Server size={15} />
                  <span>E-Mail-Server (SMTP)</span>
                  {smtpConfig.host && smtpConfig.user ? (
                    <span
                      title="SMTP konfiguriert"
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#34D399",
                        boxShadow: "0 0 6px #34D399",
                      }}
                    />
                  ) : (
                    <span
                      title="SMTP noch nicht eingerichtet"
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#F59E0B",
                      }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SUBTAB 1: POSTEINGANG (ANFRAGEN)                                */}
            {/* ============================================================== */}
            {contactSubTab === "inbox" && (
              <div>
                {/* Stat Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "rgba(13, 17, 26, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(168, 85, 247, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#C084FC",
                      }}
                    >
                      <Inbox size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Eingegangene Anfragen
                      </div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#FFFFFF" }}>
                        {messageStats.total}
                      </div>
                    </div>
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: messageStats.unread > 0 ? "rgba(239, 68, 68, 0.08)" : "rgba(13, 17, 26, 0.8)",
                      border: messageStats.unread > 0 ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: messageStats.unread > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: messageStats.unread > 0 ? "#F87171" : "#94A3B8",
                      }}
                    >
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Ungelesene Nachrichten
                      </div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 700, color: messageStats.unread > 0 ? "#F87171" : "#FFFFFF" }}>
                        {messageStats.unread}
                      </div>
                    </div>
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "rgba(13, 17, 26, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#34D399",
                      }}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Per E-Mail weitergeleitet
                      </div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#FFFFFF" }}>
                        {messageStats.mailSent} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#94A3B8" }}>/ {messageStats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div
                  className="glass-panel"
                  style={{
                    borderRadius: "16px",
                    background: "rgba(13, 17, 26, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {/* Toolbar */}
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Filter Pills */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => setMessagesFilter("all")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          border: messagesFilter === "all" ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                          background: messagesFilter === "all" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.04)",
                          color: messagesFilter === "all" ? "#C084FC" : "#CBD5E1",
                          cursor: "pointer",
                        }}
                      >
                        Alle ({messageStats.total})
                      </button>
                      <button
                        onClick={() => setMessagesFilter("unread")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          border: messagesFilter === "unread" ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
                          background: messagesFilter === "unread" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.04)",
                          color: messagesFilter === "unread" ? "#F87171" : "#CBD5E1",
                          cursor: "pointer",
                        }}
                      >
                        Nur Ungelesen ({messageStats.unread})
                      </button>
                    </div>

                    {/* Search */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        minWidth: "260px",
                      }}
                    >
                      <Search size={14} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Nachricht, Absender oder Mail suchen..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#FFFFFF",
                          fontSize: "0.85rem",
                          outline: "none",
                          width: "100%",
                        }}
                      />
                      {messageSearchQuery && (
                        <button
                          onClick={() => setMessageSearchQuery("")}
                          style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0 }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages List */}
                  {contactLoading ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px auto" }} />
                      <div>Nachrichten werden geladen...</div>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <Inbox size={34} color="#64748B" style={{ margin: "0 auto 12px auto" }} />
                      <div style={{ fontSize: "1rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                        Keine Kontaktanfragen vorhanden
                      </div>
                      <div style={{ fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto" }}>
                        {messageSearchQuery
                          ? "Kein Treffer für deinen Suchbegriff."
                          : "Sobald ein Besucher das Kontaktformular ausfüllt, erscheint seine Nachricht hier im Posteingang."}
                      </div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                        <thead>
                          <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "#94A3B8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            <th style={{ padding: "14px 20px" }}>Datum &amp; Zeit</th>
                            <th style={{ padding: "14px 20px" }}>Absender</th>
                            <th style={{ padding: "14px 20px" }}>Bereich / Kategorie</th>
                            <th style={{ padding: "14px 20px" }}>Nachricht</th>
                            <th style={{ padding: "14px 20px" }}>Zustell-Status</th>
                            <th style={{ padding: "14px 20px", textAlign: "right" }}>Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMessages.map((msg) => {
                            const dateFormatted = new Date(msg.createdAt).toLocaleString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            return (
                              <tr
                                key={msg.id}
                                style={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                  background: !msg.read ? "rgba(168, 85, 247, 0.05)" : "transparent",
                                  transition: "background 0.15s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = !msg.read ? "rgba(168, 85, 247, 0.08)" : "rgba(255, 255, 255, 0.02)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = !msg.read ? "rgba(168, 85, 247, 0.05)" : "transparent")}
                              >
                                {/* Date */}
                                <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                                  <div style={{ color: "#CBD5E1", fontSize: "0.84rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Clock size={13} color="#94A3B8" />
                                    <span>{dateFormatted}</span>
                                  </div>
                                  {!msg.read && (
                                    <span
                                      style={{
                                        display: "inline-block",
                                        marginTop: "4px",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        padding: "1px 6px",
                                        borderRadius: "6px",
                                        background: "#EF4444",
                                        color: "#FFFFFF",
                                      }}
                                    >
                                      NEU
                                    </span>
                                  )}
                                </td>

                                {/* Sender */}
                                <td style={{ padding: "16px 20px" }}>
                                  <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem" }}>
                                    {msg.name}
                                  </div>
                                  <a
                                    href={`mailto:${msg.email}`}
                                    style={{
                                      fontSize: "0.82rem",
                                      color: "var(--color-azure-bright)",
                                      textDecoration: "none",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      marginTop: "2px",
                                    }}
                                  >
                                    <Mail size={12} />
                                    <span>{msg.email}</span>
                                  </a>
                                </td>

                                {/* Category & Target */}
                                <td style={{ padding: "16px 20px" }}>
                                  <div
                                    style={{
                                      display: "inline-block",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      background: "rgba(168, 85, 247, 0.15)",
                                      border: "1px solid rgba(168, 85, 247, 0.3)",
                                      color: "#C084FC",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {msg.category}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px" }}>
                                    Ziel: {msg.targetEmail}
                                  </div>
                                </td>

                                {/* Message preview */}
                                <td style={{ padding: "16px 20px", maxWidth: "260px" }}>
                                  <div
                                    onClick={() => setSelectedMessage(msg)}
                                    style={{
                                      color: "#CBD5E1",
                                      fontSize: "0.84rem",
                                      lineHeight: 1.4,
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title="Klicken zum vollständigen Lesen"
                                  >
                                    {msg.message}
                                  </div>
                                </td>

                                {/* Delivery Status */}
                                <td style={{ padding: "16px 20px" }}>
                                  {msg.mailSent ? (
                                    <div
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "4px 9px",
                                        borderRadius: "12px",
                                        background: "rgba(16, 185, 129, 0.12)",
                                        border: "1px solid rgba(16, 185, 129, 0.3)",
                                        color: "#34D399",
                                        fontSize: "0.74rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <Check size={11} />
                                      <span>Per Mail versendet</span>
                                    </div>
                                  ) : (
                                    <div
                                      title={msg.sendError || "SMTP war nicht eingerichtet"}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "4px 9px",
                                        borderRadius: "12px",
                                        background: "rgba(56, 189, 248, 0.1)",
                                        border: "1px solid rgba(56, 189, 248, 0.25)",
                                        color: "#38BDF8",
                                        fontSize: "0.74rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      <Inbox size={11} />
                                      <span>Im Posteingang</span>
                                    </div>
                                  )}
                                </td>

                                {/* Actions */}
                                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    <button
                                      onClick={() => setSelectedMessage(msg)}
                                      title="Nachricht öffnen & ansehen"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        background: "rgba(255, 255, 255, 0.06)",
                                        border: "1px solid rgba(255, 255, 255, 0.12)",
                                        color: "#FFFFFF",
                                        fontSize: "0.78rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
                                    >
                                      <Eye size={13} />
                                      <span>Öffnen</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleMessageRead(msg)}
                                      title={msg.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "6px",
                                        background: msg.read ? "rgba(255, 255, 255, 0.04)" : "rgba(168, 85, 247, 0.15)",
                                        border: msg.read ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(168, 85, 247, 0.3)",
                                        color: msg.read ? "#94A3B8" : "#C084FC",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Check size={14} />
                                    </button>

                                    <button
                                      onClick={() => setMessageToDelete(msg)}
                                      title="Nachricht löschen"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "6px",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        border: "1px solid rgba(239, 68, 68, 0.2)",
                                        color: "#F87171",
                                        cursor: "pointer",
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SUBTAB 2: KATEGORIEN & WEITERLEITUNG                            */}
            {/* ============================================================== */}
            {contactSubTab === "categories" && (
              <div>
                {/* Action Bar / Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                      Formular-Kategorien verwalten
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "4px" }}>
                      Wähle aus, welche Themen im Dropdown-Menü auf der Website erscheinen und an wen sie weitergeleitet werden.
                    </p>
                  </div>

                  <button
                    onClick={openCreateCategoryModal}
                    className="btn-primary"
                    style={{
                      padding: "10px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      borderRadius: "var(--radius-sm)",
                      background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                      boxShadow: "0 4px 14px rgba(147, 51, 234, 0.35)",
                    }}
                  >
                    <Plus size={16} />
                    <span>Neue Kategorie anlegen</span>
                  </button>
                </div>

                {/* Top Stat Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "rgba(13, 17, 26, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(168, 85, 247, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#C084FC",
                      }}
                    >
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Kategorien gesamt
                      </div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#FFFFFF" }}>
                        {contactStats.total}
                      </div>
                    </div>
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "rgba(13, 17, 26, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#34D399",
                      }}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Im Formular aktiv
                      </div>
                      <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#FFFFFF" }}>
                        {contactStats.active}
                      </div>
                    </div>
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "rgba(13, 17, 26, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "rgba(56, 189, 248, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#38BDF8",
                      }}
                    >
                      <Shield size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Standard-Empfänger
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#FFFFFF", wordBreak: "break-all" }}>
                        {generalContactEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Fallback Email Card */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "22px 26px",
                    borderRadius: "14px",
                    background: "rgba(13, 17, 26, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    marginBottom: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ maxWidth: "520px" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "4px" }}>
                      Zentrale Haupt-Kontaktadresse
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#94A3B8", lineHeight: 1.5 }}>
                      Dient als allgemeiner Fallback für Vereinsanfragen oder wenn keine spezielle Kategorie greift.
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end", maxWidth: "460px" }}>
                    <input
                      type="email"
                      value={generalContactEmail}
                      onChange={(e) => setGeneralContactEmail(e.target.value)}
                      placeholder="kontakt@handballeintracht.de"
                      style={{
                        flex: 1,
                        minWidth: "220px",
                        padding: "9px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFFFFF",
                        fontSize: "0.88rem",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleSaveGeneralEmail}
                      disabled={savingGeneralEmail}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        color: "#FFFFFF",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                    >
                      {savingGeneralEmail ? "Speichern..." : "Speichern"}
                    </button>
                  </div>
                </div>

                {/* Categories Management Area */}
                <div
                  className="glass-panel"
                  style={{
                    borderRadius: "16px",
                    background: "rgba(13, 17, 26, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                        Formular-Kategorien &amp; Weiterleitungsziele
                      </h4>
                      <span
                        style={{
                          fontSize: "0.74rem",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#C084FC",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                          fontWeight: 600,
                        }}
                      >
                        {filteredCategories.length} {filteredCategories.length === 1 ? "Eintrag" : "Einträge"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          minWidth: "240px",
                        }}
                      >
                        <Search size={14} color="#94A3B8" />
                        <input
                          type="text"
                          placeholder="Kategorie oder Mail suchen..."
                          value={contactSearchQuery}
                          onChange={(e) => setContactSearchQuery(e.target.value)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                            outline: "none",
                            width: "100%",
                          }}
                        />
                        {contactSearchQuery && (
                          <button
                            onClick={() => setContactSearchQuery("")}
                            style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0 }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category List */}
                  {contactLoading ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px auto" }} />
                      <div>Kategorien werden geladen...</div>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <Mail size={32} color="#64748B" style={{ margin: "0 auto 12px auto" }} />
                      <div style={{ fontSize: "1rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                        Keine Kategorien gefunden
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        {contactSearchQuery ? "Passe deinen Suchbegriff an." : "Klicke oben auf 'Neue Kategorie anlegen', um eine Kategorie hinzuzufügen."}
                      </div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                        <thead>
                          <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "#94A3B8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            <th style={{ padding: "14px 20px" }}>Kategorie-Bezeichnung</th>
                            <th style={{ padding: "14px 20px" }}>Empfänger-Adresse (Routing)</th>
                            <th style={{ padding: "14px 20px" }}>Beschreibung / Hinweis</th>
                            <th style={{ padding: "14px 20px", textAlign: "center" }}>Status</th>
                            <th style={{ padding: "14px 20px", textAlign: "right" }}>Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCategories.map((cat, idx) => (
                            <tr
                              key={cat.id || idx}
                              style={{
                                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <td style={{ padding: "16px 20px" }}>
                                <div style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.95rem" }}>
                                  {cat.name}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "monospace", marginTop: "2px" }}>
                                  ID: {cat.id}
                                </div>
                              </td>

                              <td style={{ padding: "16px 20px" }}>
                                <a
                                  href={`mailto:${cat.email}`}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "5px 10px",
                                    borderRadius: "6px",
                                    background: "rgba(56, 189, 248, 0.08)",
                                    border: "1px solid rgba(56, 189, 248, 0.2)",
                                    color: "#38BDF8",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  <Mail size={12} />
                                  <span>{cat.email}</span>
                                </a>
                              </td>

                              <td style={{ padding: "16px 20px", maxWidth: "280px" }}>
                                <span style={{ color: cat.description ? "#CBD5E1" : "#64748B", fontSize: "0.82rem", lineHeight: 1.4 }}>
                                  {cat.description || "—"}
                                </span>
                              </td>

                              <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                <button
                                  onClick={() => handleToggleCategoryActive(cat)}
                                  title="Klicken zum Umschalten"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    border: cat.active !== false ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(148, 163, 184, 0.2)",
                                    background: cat.active !== false ? "rgba(16, 185, 129, 0.12)" : "rgba(148, 163, 184, 0.1)",
                                    color: cat.active !== false ? "#34D399" : "#94A3B8",
                                    fontSize: "0.74rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  {cat.active !== false ? (
                                    <>
                                      <Check size={11} />
                                      <span>Aktiv</span>
                                    </>
                                  ) : (
                                    <>
                                      <X size={11} />
                                      <span>Inaktiv</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                  <button
                                    onClick={() => openEditCategoryModal(cat)}
                                    title="Kategorie bearbeiten"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      padding: "6px 12px",
                                      borderRadius: "6px",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border: "1px solid rgba(255, 255, 255, 0.1)",
                                      color: "#FFFFFF",
                                      fontSize: "0.78rem",
                                      fontWeight: 500,
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                                  >
                                    <Edit2 size={13} />
                                    <span>Bearbeiten</span>
                                  </button>

                                  <button
                                    onClick={() => setCategoryToDelete(cat)}
                                    title="Kategorie löschen"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "30px",
                                      height: "30px",
                                      borderRadius: "6px",
                                      background: "rgba(239, 68, 68, 0.1)",
                                      border: "1px solid rgba(239, 68, 68, 0.2)",
                                      color: "#F87171",
                                      cursor: "pointer",
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SUBTAB 3: E-MAIL-SERVER (SMTP)                                 */}
            {/* ============================================================== */}
            {contactSubTab === "smtp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* Info Callout */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "24px 28px",
                    borderRadius: "16px",
                    background: "rgba(168, 85, 247, 0.06)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(168, 85, 247, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#C084FC",
                      flexShrink: 0,
                    }}
                  >
                    <Server size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                      Echter E-Mail-Versand via SMTP
                    </h3>
                    <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.6, margin: 0 }}>
                      Um Anfragen direkt per E-Mail an die hinterlegten Ziel-Adressen der jeweiligen Kategorien weiterzuleiten, benötigt der Webserver die Zugangsdaten eines ausgehenden Postfachs (SMTP).
                      <br />
                      Typische Server: <strong>Web.de:</strong> <code style={{ color: "#38BDF8" }}>smtp.web.de</code> (Port 587) | <strong>IONOS:</strong> <code style={{ color: "#38BDF8" }}>smtp.ionos.de</code> (Port 587) | <strong>Strato:</strong> <code style={{ color: "#38BDF8" }}>smtp.strato.de</code> (Port 465).
                      <br />
                      <span style={{ color: "#34D399", fontWeight: 600 }}>Sicherheit:</span> Alle Nachrichten werden unabhängig vom Mailversand immer auch dauerhaft im <strong>Admin-Posteingang</strong> gespeichert, sodass garantiert keine Anfrage verloren geht!
                    </p>
                  </div>
                </div>

                {/* SMTP Configuration Form */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "32px",
                    borderRadius: "16px",
                    background: "rgba(13, 17, 26, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 14px 34px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Key size={18} color="#C084FC" />
                    <span>Server-Zugangsdaten (Postausgangsserver)</span>
                  </h3>

                  {/* Provider Quick Presets */}
                  <div style={{ marginBottom: "22px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>Schnellauswahl:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.web.de",
                          port: 587,
                          secure: false,
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Web.de
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "mail.gmx.net",
                          port: 587,
                          secure: false,
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      GMX
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.ionos.de",
                          port: 587,
                          secure: false,
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      IONOS / 1&1
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.strato.de",
                          port: 465,
                          secure: true,
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Strato
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSmtpConfig((prev) => ({
                          ...prev,
                          host: "smtp.gmail.com",
                          port: 587,
                          secure: false,
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Gmail
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Host */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                        SMTP-Server / Host *
                      </label>
                      <input
                        type="text"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                        placeholder="z.B. smtp.web.de oder smtp.ionos.de"
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#FFFFFF",
                          fontSize: "0.92rem",
                          outline: "none",
                        }}
                      />
                      <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                        Adresse des Postausgangsservers deines E-Mail-Providers.
                      </div>
                    </div>

                    {/* Port & Secure */}
                    <div style={{ display: "flex", gap: "14px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                          Port *
                        </label>
                        <input
                          type="number"
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 587 })}
                          placeholder="587"
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            color: "#FFFFFF",
                            fontSize: "0.92rem",
                            outline: "none",
                          }}
                        />
                        <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                          Meist 587 (STARTTLS) oder 465 (SSL).
                        </div>
                      </div>

                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "10px" }}>
                          Verschlüsselung
                        </label>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            color: "#FFFFFF",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={smtpConfig.secure}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                          <span>SSL/TLS erzwingen (Port 465)</span>
                        </label>
                      </div>
                    </div>

                    {/* User */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                        Benutzername / Login-E-Mail *
                      </label>
                      <input
                        type="text"
                        value={smtpConfig.user}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                        placeholder="z.B. verein@deine-domain.de oder benutzer@web.de"
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#FFFFFF",
                          fontSize: "0.92rem",
                          outline: "none",
                        }}
                      />
                      <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                        Deine vollständige E-Mail-Adresse oder dein Provider-Benutzername.
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                        Passwort *
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showSmtpPassword ? "text" : "password"}
                          value={smtpConfig.password || ""}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                          placeholder="Passwort oder App-Passwort"
                          style={{
                            width: "100%",
                            padding: "11px 42px 11px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            color: "#FFFFFF",
                            fontSize: "0.92rem",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            color: "#94A3B8",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                          }}
                          title={showSmtpPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                        >
                          {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                        Wird sicher auf dem Server gespeichert (für Web.de ggf. POP3/SMTP-Freigabe im Webmail aktivieren).
                      </div>
                    </div>

                    {/* From Name */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                        Absender-Name (Anzeige beim Empfänger)
                      </label>
                      <input
                        type="text"
                        value={smtpConfig.fromName}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                        placeholder="Eintracht Dachau-Karlsfeld Handball"
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#FFFFFF",
                          fontSize: "0.92rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* From Email */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                        Absender-E-Mail-Adresse
                      </label>
                      <input
                        type="email"
                        value={smtpConfig.fromEmail}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                        placeholder="kontakt@handballeintracht.de"
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#FFFFFF",
                          fontSize: "0.92rem",
                          outline: "none",
                        }}
                      />
                      <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                        Muss beim selben Mailserver autorisiert sein (oft identisch mit dem Benutzernamen).
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleSaveSmtp}
                      disabled={savingSmtp}
                      className="btn-primary"
                      style={{
                        padding: "11px 24px",
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        borderRadius: "var(--radius-sm)",
                        background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                        boxShadow: "0 4px 14px rgba(147, 51, 234, 0.35)",
                      }}
                    >
                      {savingSmtp ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
                      <span>{savingSmtp ? "Speichern..." : "SMTP-Einstellungen speichern"}</span>
                    </button>
                  </div>
                </div>

                {/* Test Connection Card */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "28px 32px",
                    borderRadius: "16px",
                    background: "rgba(13, 17, 26, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Send size={18} color="var(--color-azure-bright)" />
                    <span>Verbindung &amp; E-Mail-Versand live testen</span>
                  </h3>
                  <p style={{ fontSize: "0.86rem", color: "#94A3B8", marginBottom: "18px" }}>
                    Sende eine echte Testnachricht an deine persönliche E-Mail-Adresse, um zu verifizieren, dass Host, Port und Zugangsdaten stimmen.
                  </p>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", maxWidth: "600px" }}>
                    <input
                      type="email"
                      value={testSmtpEmail}
                      onChange={(e) => setTestSmtpEmail(e.target.value)}
                      placeholder="z.B. test@beispiel.de"
                      style={{
                        flex: 1,
                        minWidth: "240px",
                        padding: "11px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFFFFF",
                        fontSize: "0.92rem",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleTestSmtp}
                      disabled={testingSmtp}
                      style={{
                        padding: "11px 22px",
                        borderRadius: "var(--radius-sm)",
                        background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: testingSmtp ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                      }}
                    >
                      {testingSmtp ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
                      <span>{testingSmtp ? "Wird getestet..." : "Test-E-Mail senden"}</span>
                    </button>
                  </div>

                  {/* Test Result Message */}
                  {testSmtpResult && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        background: testSmtpResult.success ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        border: testSmtpResult.success ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(239, 68, 68, 0.35)",
                        color: testSmtpResult.success ? "#34D399" : "#FCA5A5",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      {testSmtpResult.success ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "2px" }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />}
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {testSmtpResult.success ? "Verbindungstest erfolgreich!" : "Verbindungstest fehlgeschlagen"}
                        </div>
                        <div style={{ fontSize: "0.82rem", marginTop: "2px", opacity: 0.9 }}>
                          {testSmtpResult.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: CREATE / EDIT NEWS                                    */}
      {/* ============================================================== */}
      {newsModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setNewsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "rgba(12, 17, 26, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "18px",
              boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8)",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF" }}>
                {editingArticle ? "Artikel bearbeiten" : "Neuen Artikel erstellen"}
              </h3>
              <button
                onClick={() => setNewsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {newsFormError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }}
              >
                {newsFormError}
              </div>
            )}

            <form onSubmit={handleNewsSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Titel der Meldung *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Heimsieg der Herren 1..."
                  value={newsFormData.title}
                  onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Category & Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    Kategorie *
                  </label>
                  <select
                    value={newsFormData.category}
                    onChange={(e) => setNewsFormData({ ...newsFormData, category: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(14, 18, 28, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  >
                    <option value="Spielbetrieb">Spielbetrieb</option>
                    <option value="Jugend">Jugend</option>
                    <option value="Verein">Verein</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    Datum *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsFormData.date}
                    onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "8px" }}>
                  Artikel-Bild (Upload)
                </label>

                <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "8px" }}>
                  {/* Preview Container */}
                  <div
                    style={{
                      width: "200px",
                      aspectRatio: "16 / 9",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      position: "relative",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {newsFormData.image ? (
                      <img
                        src={newsFormData.image}
                        alt="Vorschau"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#64748B", fontSize: "0.78rem", padding: "10px" }}>
                        <ImageIcon size={22} style={{ margin: "0 auto 4px", opacity: 0.5 }} />
                        <span>Kein Bild gewählt</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <label
                        htmlFor="news-img-upload-input"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "9px 16px",
                          borderRadius: "var(--radius-sm)",
                          background: "linear-gradient(135deg, rgba(143, 24, 56, 0.35), rgba(143, 24, 56, 0.15))",
                          border: "1px solid rgba(143, 24, 56, 0.5)",
                          color: "#FFFFFF",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: uploadingNewsImage ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingNewsImage ? "Wird hochgeladen..." : newsFormData.image ? "Anderes Bild hochladen" : "Artikelbild hochladen"}</span>
                      </label>
                      <input
                        id="news-img-upload-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingNewsImage}
                        onChange={handleNewsImageSelect}
                        style={{ display: "none" }}
                      />

                      {newsFormData.image && (
                        <button
                          type="button"
                          onClick={handleOpenNewsCrop}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#FFFFFF",
                            fontSize: "0.82rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Crop size={13} />
                          <span>Zuschneiden & Anpassen</span>
                        </button>
                      )}

                      {newsFormData.image && (
                        <button
                          type="button"
                          onClick={() => setNewsFormData((prev) => ({ ...prev, image: "" }))}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Entfernen</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: "8px" }}>
                      Empfohlenes Format: 16:9 Querformat (JPG, PNG oder WEBP). Max. 15 MB.
                    </div>

                    {newsFormData.image && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
                        <Check size={14} color="#10B981" />
                        <span>Aktives Bild: <strong style={{ color: "#38BDF8" }}>{formatImageLabel(newsFormData.image)}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Kurzbeschreibung / Teaser *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newsFormData.excerpt}
                  onChange={(e) => setNewsFormData({ ...newsFormData, excerpt: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.88rem",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Vollständiger Berichtstext
                </label>
                <textarea
                  rows={6}
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#CBD5E1",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={newsSaving || uploadingNewsImage}
                  className="btn-primary"
                  style={{ padding: "10px 24px", fontSize: "0.88rem", opacity: newsSaving || uploadingNewsImage ? 0.7 : 1 }}
                >
                  <span>{newsSaving ? "Wird gespeichert..." : editingArticle ? "Änderungen speichern" : "Artikel veröffentlichen"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CREATE / EDIT TEAM                                    */}
      {/* ============================================================== */}
      {teamModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setTeamModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "rgba(12, 17, 26, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "18px",
              boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8)",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  {editingTeam ? `Team bearbeiten: ${editingTeam.name}` : "Neues Team anlegen"}
                </h3>
                <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                  Alle Daten, Mannschaftsbild, nuLiga-Verknüpfung und Spielbetrieb pflegen
                </span>
              </div>
              <button
                onClick={() => setTeamModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {teamFormError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }}
              >
                {teamFormError}
              </div>
            )}

            <form onSubmit={handleTeamSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* SEKTION 1: STAMMDATEN */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={16} style={{ color: "var(--color-azure-bright)" }} />
                  <span>1. Stammdaten & Design</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                      Teamname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Herren 1"
                      value={teamFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                        setTeamFormData({
                          ...teamFormData,
                          name: val,
                          slug: editingTeam ? teamFormData.slug : autoSlug,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                      URL-Slug (Webadresse) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. herren-1"
                      value={teamFormData.slug}
                      onChange={(e) => setTeamFormData({ ...teamFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                    <span style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "3px", display: "block" }}>
                      URL: /teams/{teamFormData.slug || "..."}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                      Liga / Spielklasse *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Bezirksoberliga"
                      value={teamFormData.league}
                      onChange={(e) => setTeamFormData({ ...teamFormData, league: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                      Kategorie *
                    </label>
                    <select
                      value={teamFormData.category}
                      onChange={(e) => {
                        const cat = e.target.value as TeamCategory;
                        const accent = cat === "Herren" || cat === "Jugend männlich" ? "crimson" : "azure";
                        setTeamFormData({ ...teamFormData, category: cat, accentType: accent });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(14, 18, 28, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        color: "#FFFFFF",
                        fontSize: "0.88rem",
                        outline: "none",
                      }}
                    >
                      <option value="Herren">Herren</option>
                      <option value="Damen">Damen</option>
                      <option value="Jugend männlich">Jugend männlich</option>
                      <option value="Jugend weiblich">Jugend weiblich</option>
                      <option value="Kinderhandball">Kinderhandball (gemischt / Minis &amp; Bambinis)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    Design-Farbakzent
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setTeamFormData({ ...teamFormData, accentType: "crimson" })}
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        borderColor: teamFormData.accentType === "crimson" ? "var(--color-crimson)" : "rgba(255, 255, 255, 0.1)",
                        background: teamFormData.accentType === "crimson" ? "rgba(143, 24, 56, 0.25)" : "transparent",
                        color: teamFormData.accentType === "crimson" ? "#FFFFFF" : "#94A3B8",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Crimson Rot (Herren / Eintracht)
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeamFormData({ ...teamFormData, accentType: "azure" })}
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        borderColor: teamFormData.accentType === "azure" ? "var(--color-azure)" : "rgba(255, 255, 255, 0.1)",
                        background: teamFormData.accentType === "azure" ? "rgba(72, 156, 216, 0.25)" : "transparent",
                        color: teamFormData.accentType === "azure" ? "#FFFFFF" : "#94A3B8",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Azure Blau (Damen / Jugend)
                    </button>
                  </div>
                </div>
              </div>

              {/* SEKTION 2: MANNSCHAFTSBILD & UPLOAD */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Camera size={16} style={{ color: "#FBBF24" }} />
                  <span>2. Mannschaftsbild & Upload</span>
                </div>

                {/* Image Preview & Upload Button */}
                <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "220px",
                      aspectRatio: "16 / 9",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {teamFormData.image ? (
                      <img
                        src={teamFormData.image}
                        alt="Vorschau"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "0.78rem" }}>
                        Kein Bild gewählt
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <label
                        htmlFor="team-img-input"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 18px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          color: "#FFFFFF",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: uploadingTeamImage ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Upload size={15} />
                        <span>{uploadingTeamImage ? "Wird hochgeladen..." : teamFormData.image ? "Anderes Foto auswählen" : "Mannschaftsfoto auswählen"}</span>
                      </label>
                      <input
                        id="team-img-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingTeamImage}
                        onChange={handleTeamImageSelect}
                        style={{ display: "none" }}
                      />

                      {teamFormData.image && (
                        <button
                          type="button"
                          onClick={handleOpenTeamCrop}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#FFFFFF",
                            fontSize: "0.82rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Crop size={13} />
                          <span>Zuschneiden & Anpassen</span>
                        </button>
                      )}

                      {teamFormData.image && (
                        <button
                          type="button"
                          onClick={() => setTeamFormData((prev) => ({ ...prev, image: "" }))}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Entfernen</span>
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "8px" }}>
                      Empfohlenes Format: 16:9 Querformat (JPG, PNG oder WEBP). Max. 15 MB.
                    </div>
                    {teamFormData.image && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
                        <Check size={14} color="#10B981" />
                        <span>Aktives Foto: <strong style={{ color: "#38BDF8" }}>{formatImageLabel(teamFormData.image)}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option: Miniatur-Version des Mannschaftsbildes auf Startseite & Teamseite anzeigen */}
                <div
                  onClick={() => setTeamFormData((prev) => ({ ...prev, showImage: !prev.showImage }))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setTeamFormData((prev) => ({ ...prev, showImage: !prev.showImage }));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: teamFormData.showImage ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${teamFormData.showImage ? "rgba(34, 197, 94, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
                    marginTop: "16px",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>Miniatur-Version des Mannschaftsbilds anzeigen</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: teamFormData.showImage ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)",
                          color: teamFormData.showImage ? "#4ADE80" : "#94A3B8",
                          textTransform: "uppercase",
                        }}
                      >
                        {teamFormData.showImage ? "Aktiv" : "Ausgeblendet"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "#94A3B8", marginTop: "3px" }}>
                      Steuert, ob auf der Startseite (Sektion Mannschaften) und der Teamseite die Miniatur-Vorschaukarte des Kaders eingeblendet wird.
                    </div>
                  </div>

                  {/* Visual switch button */}
                  <div
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "24px",
                      borderRadius: "24px",
                      backgroundColor: teamFormData.showImage ? "#22C55E" : "#334155",
                      flexShrink: 0,
                      marginLeft: "16px",
                      transition: "0.2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        height: "18px",
                        width: "18px",
                        left: teamFormData.showImage ? "22px" : "3px",
                        top: "3px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        transition: "0.2s",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SEKTION 3: NULIGA ANBINDUNG */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(14, 165, 233, 0.05)", border: "1px solid rgba(14, 165, 233, 0.2)" }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ExternalLink size={16} />
                  <span>3. nuLiga-Anbindung (Tabelle &amp; Spielplan)</span>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    nuLiga Staffel- / Liga-URL (groupPage)
                  </label>
                  <input
                    type="url"
                    placeholder="https://bhv-handball.liga.nu/.../wa/groupPage?championship=...&group=..."
                    value={teamFormData.groupUrl}
                    onChange={(e) => setTeamFormData({ ...teamFormData, groupUrl: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(14, 165, 233, 0.3)",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "4px", display: "block" }}>
                    Die offizielle nuLiga-Tabelle dieser Staffel wird bei Speicherung automatisch geladen und auf der Teamseite angezeigt.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    nuLiga Spielplan-Kategorie
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Herren 1, Herren 2, Damen 1, mB-Jugend"
                    value={teamFormData.nuligaCategory}
                    onChange={(e) => setTeamFormData({ ...teamFormData, nuligaCategory: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#FFFFFF",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                    Filtert die nächsten Spiele und Ergebnisse aus nuLiga für diese Mannschaft.
                  </span>
                </div>
              </div>

              {/* SEKTION 4: TRAINER & BETREUERTEAM */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={16} style={{ color: "#34D399" }} />
                    <span>4. Trainer &amp; Betreuerteam ({teamFormData.coaches.length})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTeamFormData({
                        ...teamFormData,
                        coaches: [
                          ...teamFormData.coaches,
                          { name: "", role: "Co-Trainer", email: "", phone: "" },
                        ],
                      });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "rgba(52, 211, 153, 0.15)",
                      border: "1px solid rgba(52, 211, 153, 0.35)",
                      color: "#34D399",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} />
                    <span>Trainer hinzufügen</span>
                  </button>
                </div>

                {teamFormData.coaches.map((coach, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Trainer / Ansprechpartner #{cIdx + 1}
                      </span>
                      {teamFormData.coaches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTeamFormData({
                              ...teamFormData,
                              coaches: teamFormData.coaches.filter((_, idx) => idx !== cIdx),
                            });
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "transparent",
                            border: "none",
                            color: "#F87171",
                            fontSize: "0.74rem",
                            cursor: "pointer",
                            padding: "2px 6px",
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Entfernen</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          required={cIdx === 0}
                          placeholder="z.B. Markus Schmid"
                          value={coach.name}
                          onChange={(e) => {
                            const newCoaches = [...teamFormData.coaches];
                            newCoaches[cIdx] = { ...newCoaches[cIdx], name: e.target.value };
                            setTeamFormData({ ...teamFormData, coaches: newCoaches });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Funktion / Rolle
                        </label>
                        <input
                          type="text"
                          placeholder="z.B. Cheftrainer, Co-Trainer, Betreuer"
                          value={coach.role}
                          onChange={(e) => {
                            const newCoaches = [...teamFormData.coaches];
                            newCoaches[cIdx] = { ...newCoaches[cIdx], role: e.target.value };
                            setTeamFormData({ ...teamFormData, coaches: newCoaches });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          E-Mail (optional)
                        </label>
                        <input
                          type="email"
                          placeholder="trainer@handballeintracht.de"
                          value={coach.email}
                          onChange={(e) => {
                            const newCoaches = [...teamFormData.coaches];
                            newCoaches[cIdx] = { ...newCoaches[cIdx], email: e.target.value };
                            setTeamFormData({ ...teamFormData, coaches: newCoaches });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Telefon / Mobil (optional)
                        </label>
                        <input
                          type="tel"
                          placeholder="+49 171 1234567"
                          value={coach.phone}
                          onChange={(e) => {
                            const newCoaches = [...teamFormData.coaches];
                            newCoaches[cIdx] = { ...newCoaches[cIdx], phone: e.target.value };
                            setTeamFormData({ ...teamFormData, coaches: newCoaches });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEKTION 5: TRAININGSTAGE & HALLEN */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} style={{ color: "var(--color-azure-bright)" }} />
                    <span>5. Trainingstage &amp; Spielhallen ({teamFormData.trainingSchedule.length})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTeamFormData({
                        ...teamFormData,
                        trainingSchedule: [
                          ...teamFormData.trainingSchedule,
                          {
                            day: "Donnerstag",
                            time: "19:30 – 21:00 Uhr",
                            hallId: "260180",
                            hallName: "Sporthalle Mittelschule (MSK)",
                          },
                        ],
                      });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "rgba(72, 156, 216, 0.15)",
                      border: "1px solid rgba(72, 156, 216, 0.35)",
                      color: "var(--color-azure-bright)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} />
                    <span>Trainingstag hinzufügen</span>
                  </button>
                </div>

                <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                  Hier können für jeden Wochentag individuelle Uhrzeiten und Hallen flexibel hinterlegt werden (z. B. Di in Halle 1, Mi in Halle 2, Do in Halle 3).
                </div>

                {teamFormData.trainingSchedule.map((session, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Trainingstag #{sIdx + 1}
                      </span>
                      {teamFormData.trainingSchedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTeamFormData({
                              ...teamFormData,
                              trainingSchedule: teamFormData.trainingSchedule.filter((_, idx) => idx !== sIdx),
                            });
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "transparent",
                            border: "none",
                            color: "#F87171",
                            fontSize: "0.74rem",
                            cursor: "pointer",
                            padding: "2px 6px",
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Entfernen</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1.4fr", gap: "12px", alignItems: "center" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Wochentag
                        </label>
                        <select
                          value={session.day}
                          onChange={(e) => {
                            const newSchedule = [...teamFormData.trainingSchedule];
                            newSchedule[sIdx] = { ...newSchedule[sIdx], day: e.target.value };
                            setTeamFormData({ ...teamFormData, trainingSchedule: newSchedule });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(14, 18, 28, 0.95)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        >
                          {["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Uhrzeit
                        </label>
                        <input
                          type="text"
                          placeholder="z.B. 19:30 – 21:00 Uhr"
                          value={session.time}
                          onChange={(e) => {
                            const newSchedule = [...teamFormData.trainingSchedule];
                            newSchedule[sIdx] = { ...newSchedule[sIdx], time: e.target.value };
                            setTeamFormData({ ...teamFormData, trainingSchedule: newSchedule });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "4px" }}>
                          Sporthalle / Spielort
                        </label>
                        <select
                          value={session.hallId}
                          onChange={(e) => {
                            const hId = e.target.value;
                            const matchedHall = hallsData.find((h: any) => h.id === hId);
                            const newSchedule = [...teamFormData.trainingSchedule];
                            newSchedule[sIdx] = {
                              ...newSchedule[sIdx],
                              hallId: hId,
                              hallName: matchedHall ? matchedHall.name : session.hallName,
                            };
                            setTeamFormData({ ...teamFormData, trainingSchedule: newSchedule });
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(14, 18, 28, 0.95)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            color: "#FFFFFF",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        >
                          {hallsData.map((h: any) => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.city})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEKTION 6: SOCIAL MEDIA */}
              <div style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Instagram size={16} style={{ color: "#E1306C" }} />
                  <span>6. Social Media</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                    Instagram Profil-Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/handballeintracht/"
                    value={teamFormData.instagram}
                    onChange={(e) => setTeamFormData({ ...teamFormData, instagram: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#CBD5E1",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={teamSaving || uploadingTeamImage}
                  className="btn-primary"
                  style={{
                    padding: "10px 24px",
                    fontSize: "0.88rem",
                    opacity: teamSaving || uploadingTeamImage ? 0.7 : 1,
                  }}
                >
                  <span>{teamSaving ? "Wird gespeichert..." : editingTeam ? "Änderungen speichern" : "Team anlegen"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CREATE / EDIT SPONSOR                                 */}
      {/* ============================================================== */}
      {sponsorModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setSponsorModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "540px",
              background: "rgba(12, 17, 26, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "18px",
              boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8)",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#FFFFFF" }}>
                {editingSponsor ? "Partner bearbeiten" : "Neuen Partner anlegen"}
              </h3>
              <button
                onClick={() => setSponsorModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {sponsorFormError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }}
              >
                {sponsorFormError}
              </div>
            )}

            <form onSubmit={handleSponsorSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Unternehmensname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Sparkasse Dachau"
                  value={sponsorFormData.name}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Tier Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Partner-Stufe (Tier)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { key: "gold", label: "Gold", color: "#FBBF24" },
                    { key: "silver", label: "Silber", color: "#CBD5E1" },
                    { key: "partner", label: "Förderer", color: "var(--color-azure-bright)" },
                    { key: "none", label: "Ohne Stufe", color: "#94A3B8" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setSponsorFormData({ ...sponsorFormData, tier: t.key as SponsorTier })}
                      style={{
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        borderColor: sponsorFormData.tier === t.key ? t.color : "rgba(255, 255, 255, 0.1)",
                        background: sponsorFormData.tier === t.key ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        color: sponsorFormData.tier === t.key ? t.color : "#94A3B8",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sponsor Logo Upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "8px" }}>
                  Sponsor-Logo (Upload)
                </label>

                <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "8px" }}>
                  {/* Preview Container */}
                  <div
                    style={{
                      width: "160px",
                      height: "72px",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: sponsorFormData.fit === "cover" ? "0" : "8px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {sponsorFormData.logo ? (
                      <img
                        src={sponsorFormData.logo}
                        alt="Logo Vorschau"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: sponsorFormData.fit === "cover" ? "cover" : "contain",
                          transform: sponsorFormData.fit !== "cover" && sponsorFormData.scale && sponsorFormData.scale !== 1 ? `scale(${sponsorFormData.scale})` : undefined,
                        }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-dark.png"; }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#64748B", fontSize: "0.75rem" }}>
                        Kein Logo
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <label
                        htmlFor="sponsor-logo-upload-input"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "9px 16px",
                          borderRadius: "var(--radius-sm)",
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))",
                          border: "1px solid rgba(245, 158, 11, 0.5)",
                          color: "#FBBF24",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: uploadingSponsorLogo ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingSponsorLogo ? "Wird hochgeladen..." : sponsorFormData.logo ? "Anderes Logo hochladen" : "Sponsoren-Logo hochladen"}</span>
                      </label>
                      <input
                        id="sponsor-logo-upload-input"
                        type="file"
                        accept="image/svg+xml,image/png,image/webp,image/jpeg"
                        disabled={uploadingSponsorLogo}
                        onChange={handleSponsorLogoSelect}
                        style={{ display: "none" }}
                      />

                      {sponsorFormData.logo && (
                        <button
                          type="button"
                          onClick={handleOpenSponsorCrop}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(245, 158, 11, 0.15)",
                            border: "1px solid rgba(245, 158, 11, 0.35)",
                            color: "#FBBF24",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Crop size={14} />
                          <span>Zuschneiden & Anpassen</span>
                        </button>
                      )}

                      {sponsorFormData.logo && (
                        <button
                          type="button"
                          onClick={() => setSponsorFormData((prev) => ({ ...prev, logo: "" }))}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#F87171",
                            fontSize: "0.82rem",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Entfernen</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: "8px" }}>
                      Empfohlen: Freigestelltes SVG oder transparentes PNG (auch WEBP, JPG möglich). Max. 15 MB.
                    </div>

                    {sponsorFormData.logo && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.75rem", color: "#34D399", marginTop: "6px" }}>
                        <Check size={14} color="#10B981" />
                        <span>Aktives Logo: <strong style={{ color: "#38BDF8" }}>{formatImageLabel(sponsorFormData.logo)}</strong></span>
                        <span style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "4px", padding: "1px 6px", fontSize: "0.7rem", color: "#10B981" }}>
                          ✓ Zugewiesen
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {sponsorFormData.logo && (
                  <div style={{ marginTop: "12px", background: "rgba(255, 255, 255, 0.04)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#FFFFFF" }}>
                        Darstellung im Laufband-Platzhalter:
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setSponsorFormData((prev) => ({ ...prev, fit: "cover" }))}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: sponsorFormData.fit === "cover" ? "#F59E0B" : "rgba(255, 255, 255, 0.15)",
                            background: sponsorFormData.fit === "cover" ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.04)",
                            color: sponsorFormData.fit === "cover" ? "#FBBF24" : "#94A3B8",
                          }}
                        >
                          Vollflächig ausfüllen (Cover)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSponsorFormData((prev) => ({ ...prev, fit: "contain" }))}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: sponsorFormData.fit === "contain" ? "#F59E0B" : "rgba(255, 255, 255, 0.15)",
                            background: sponsorFormData.fit === "contain" ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.04)",
                            color: sponsorFormData.fit === "contain" ? "#FBBF24" : "#94A3B8",
                          }}
                        >
                          Eingepasst mit Rand (Contain)
                        </button>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                      {sponsorFormData.fit === "cover"
                        ? "Vollflächig (Cover): Das Banner/Logo füllt den durchlaufenden Platzhalter komplett randlos und bündig aus."
                        : "Eingepasst (Contain): Das Logo wird mit Innenabstand proportional zentriert (ideal für freigestellte Grafiken/SVGs)."}
                    </span>

                    {/* Scale selector for contained logos */}
                    {sponsorFormData.fit !== "cover" && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginTop: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#FFFFFF" }}>
                          Logo-Größe / Skalierung:
                        </span>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {[
                            { label: "Kompakt (85%)", value: 0.85 },
                            { label: "Standard (100%)", value: 1.0 },
                            { label: "Groß (120%)", value: 1.2 },
                            { label: "Maximal (140%)", value: 1.4 },
                          ].map((sz) => {
                            const isSelected = (sponsorFormData.scale || 1.0) === sz.value;
                            return (
                              <button
                                key={sz.value}
                                type="button"
                                onClick={() => setSponsorFormData((prev) => ({ ...prev, scale: sz.value }))}
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  border: "1px solid",
                                  borderColor: isSelected ? "#F59E0B" : "rgba(255, 255, 255, 0.15)",
                                  background: isSelected ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.04)",
                                  color: isSelected ? "#FBBF24" : "#94A3B8",
                                }}
                              >
                                {sz.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Website-URL (Klick öffnet Ziel-Homepage)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={sponsorFormData.url}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, url: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSponsorModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#CBD5E1",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={sponsorSaving || uploadingSponsorLogo}
                  className="btn-primary"
                  style={{ padding: "10px 24px", fontSize: "0.88rem", opacity: sponsorSaving || uploadingSponsorLogo ? 0.7 : 1 }}
                >
                  <span>{sponsorSaving ? "Wird gespeichert..." : editingSponsor ? "Änderungen speichern" : "Partner anlegen"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION: ARTICLE                                   */}
      {/* ============================================================== */}
      {articleToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
          }}
          onClick={() => setArticleToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Artikel wirklich löschen?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "24px" }}>
              Möchtest du den Beitrag <strong>"{articleToDelete.title}"</strong> unwiderruflich von der Website entfernen?
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setArticleToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#CBD5E1",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteArticle}
                disabled={deletingArticle}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deletingArticle ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION: TEAM                                      */}
      {/* ============================================================== */}
      {teamToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
          }}
          onClick={() => setTeamToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Team wirklich löschen?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "24px" }}>
              Möchtest du die Mannschaft <strong>"{teamToDelete.name}"</strong> ({teamToDelete.league}) entfernen?
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setTeamToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#CBD5E1",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={deletingTeam}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deletingTeam ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION: SPONSOR                                   */}
      {/* ============================================================== */}
      {sponsorToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
          }}
          onClick={() => setSponsorToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Partner wirklich entfernen?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "24px" }}>
              Möchtest du <strong>"{sponsorToDelete.name}"</strong> aus dem Sponsoren-Verzeichnis und dem Laufband entfernen?
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setSponsorToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#CBD5E1",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteSponsor}
                disabled={deletingSponsor}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deletingSponsor ? "Wird gelöscht..." : "Ja, entfernen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: CREATE / EDIT CONTACT CATEGORY                        */}
      {/* ============================================================== */}
      {categoryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setCategoryModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "rgba(12, 17, 26, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "18px",
              boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8)",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(168, 85, 247, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C084FC",
                  }}
                >
                  <Mail size={18} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                  {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie anlegen"}
                </h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {categoryFormError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                }}
              >
                {categoryFormError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Category Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Bezeichnung / Name der Kategorie *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Probetraining Jugend (Minis bis A-Jugend)"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                  Wird dem Besucher im Dropdown-Menü des Kontaktformulars angezeigt.
                </div>
              </div>

              {/* Target Email Address */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Ziel-E-Mail-Adresse (Routing) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="z.B. jugend@eintracht-handball.de"
                  value={categoryFormData.email}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "4px" }}>
                  An diese Adresse werden Nachrichten dieser Kategorie geleitet.
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "6px" }}>
                  Beschreibung / Hinweis (optional)
                </label>
                <input
                  type="text"
                  placeholder="z.B. Für Kinder und Jugendliche von den Minis (ab 5 J.) bis zur A-Jugend"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Active Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  cursor: "pointer",
                }}
                onClick={() => setCategoryFormData((prev) => ({ ...prev, active: !prev.active }))}
              >
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryFormData.active}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.checked })}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <label htmlFor="catActive" style={{ fontSize: "0.86rem", color: "#FFFFFF", cursor: "pointer" }}>
                  Kategorie im Kontaktformular aktivieren (öffentlich auswählbar)
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#CBD5E1",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="btn-primary"
                  style={{
                    padding: "10px 22px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                  }}
                >
                  {savingCategory ? "Speichern..." : editingCategory ? "Änderungen speichern" : "Kategorie anlegen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: DELETE CONTACT CATEGORY CONFIRMATION                  */}
      {/* ============================================================== */}
      {categoryToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
          }}
          onClick={() => setCategoryToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Kategorie wirklich löschen?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "24px" }}>
              Möchtest du die Kategorie <strong>"{categoryToDelete.name}"</strong> (Empfänger: {categoryToDelete.email}) wirklich entfernen? Sie steht danach im Kontaktformular nicht mehr zur Auswahl.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setCategoryToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#CBD5E1",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={deletingCategory}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deletingCategory ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: VIEW CONTACT MESSAGE DETAILS                          */}
      {/* ============================================================== */}
      {selectedMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
            overflowY: "auto",
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "640px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(168, 85, 247, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C084FC",
                  }}
                >
                  <Inbox size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                    Kontaktanfrage
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                    Eingegangen am {new Date(selectedMessage.createdAt).toLocaleString("de-DE")}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Meta Details Box */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Absender
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
                  {selectedMessage.name}
                </div>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-azure-bright)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px",
                    textDecoration: "none",
                  }}
                >
                  <Mail size={12} />
                  <span>{selectedMessage.email}</span>
                </a>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Kategorie / Routing
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#C084FC", marginTop: "2px" }}>
                  {selectedMessage.category}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                  Ziel: {selectedMessage.targetEmail}
                </div>
              </div>
            </div>

            {/* Delivery Status Banner */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: selectedMessage.mailSent ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.1)",
                border: selectedMessage.mailSent ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(56, 189, 248, 0.25)",
                color: selectedMessage.mailSent ? "#34D399" : "#38BDF8",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {selectedMessage.mailSent ? <CheckCircle2 size={16} /> : <Inbox size={16} />}
              <span>
                {selectedMessage.mailSent
                  ? `E-Mail wurde erfolgreich an ${selectedMessage.targetEmail} versendet.`
                  : "Nachricht wurde im Vereinssystem hinterlegt."}
              </span>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nachrichtentext
              </label>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "16px",
                  color: "#F1F5F9",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  maxHeight: "260px",
                  overflowY: "auto",
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleToggleMessageRead(selectedMessage)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: selectedMessage.read ? "rgba(255, 255, 255, 0.06)" : "rgba(168, 85, 247, 0.2)",
                    border: selectedMessage.read ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(168, 85, 247, 0.4)",
                    color: selectedMessage.read ? "#CBD5E1" : "#C084FC",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={14} />
                  <span>{selectedMessage.read ? "Als ungelesen" : "Als gelesen"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDel = selectedMessage;
                    setSelectedMessage(null);
                    setMessageToDelete(toDel);
                  }}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#F87171",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Trash2 size={14} />
                  <span>Löschen</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#CBD5E1",
                    fontSize: "0.86rem",
                    cursor: "pointer",
                  }}
                >
                  Schließen
                </button>

                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.category} - Eintracht Dachau-Karlsfeld`)}`}
                  className="btn-primary"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                  }}
                >
                  <Mail size={14} />
                  <span>Per E-Mail antworten</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 8: DELETE MESSAGE CONFIRMATION                           */}
      {/* ============================================================== */}
      {messageToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(4, 7, 12, 0.85)",
            backdropFilter: "blur(14px)",
            padding: "20px",
          }}
          onClick={() => setMessageToDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(14, 18, 28, 0.98)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F87171",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
              Anfrage löschen?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "24px" }}>
              Möchtest du die Nachricht von <strong>{messageToDelete.name}</strong> ({messageToDelete.email}) wirklich unwiderruflich aus dem Posteingang löschen?
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setMessageToDelete(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#CBD5E1",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={deletingMessage}
                style={{
                  padding: "9px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deletingMessage ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CROP / POSITION MODAL */}
      {cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={cropImageSrc}
          imageName={cropTargetName}
          targetFolder={cropTargetFolder}
          aspectRatio={cropAspectRatio}
          title={cropTitle}
          onSuccess={async (url) => {
            if (cropCallback) {
              await cropCallback(url);
            }
          }}
        />
      )}
    </div>
  );
}
