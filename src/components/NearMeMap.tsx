import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard, type DoctorCardData } from "@/components/DoctorCard";

declare global {
  interface Window {
    google: any;
    __initNearMeMap?: () => void;
  }
}

const KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

let mapsLoading: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoading) return mapsLoading;
  mapsLoading = new Promise((resolve, reject) => {
    window.__initNearMeMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async&callback=__initNearMeMap&channel=${CHANNEL}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsLoading;
}

// Pseudo coords for doctors that don't have lat/lng — spread around user location.
function pseudoOffset(seed: string, i: number) {
  let h = 0;
  for (let c = 0; c < seed.length; c++) h = (h * 31 + seed.charCodeAt(c)) >>> 0;
  const r = ((h % 1000) / 1000) * 0.04 + 0.005; // 0.5–4.5 km-ish
  const ang = (((h >> 8) % 360) + i * 47) * (Math.PI / 180);
  return { dLat: Math.cos(ang) * r, dLng: Math.sin(ang) * r };
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function NearMeMap({
  doctors,
  onClose,
  onRequest,
}: {
  doctors: DoctorCardData[];
  onClose: () => void;
  onRequest: (id: string) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"locating" | "ready" | "error">("locating");
  const [err, setErr] = useState<string>("");
  const [user, setUser] = useState<{ lat: number; lng: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  // doctors with synthesized coords + distance
  const placed = user
    ? doctors.map((d, i) => {
        const { dLat, dLng } = pseudoOffset(d.user_id, i);
        const pos = { lat: user.lat + dLat, lng: user.lng + dLng };
        return { d, pos, km: distanceKm(user, pos) };
      }).sort((a, b) => a.km - b.km)
    : [];

  useEffect(() => {
    if (!navigator.geolocation) {
      setErr("Geolocation not supported on this device.");
      setStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setUser({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => {
        setErr(e.message || "Couldn't access your location. Please allow GPS permission.");
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!user || !mapEl.current) return;
    let map: any;
    let markers: any[] = [];
    loadMaps()
      .then(() => {
        if (!mapEl.current) return;
        map = new window.google.maps.Map(mapEl.current, {
          center: user,
          zoom: 13,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
        });
        new window.google.maps.Marker({
          position: user,
          map,
          title: "You",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });
        placed.forEach(({ d, pos }) => {
          const m = new window.google.maps.Marker({
            position: pos,
            map,
            title: `Dr. ${d.full_name}`,
            label: { text: "+", color: "#fff", fontWeight: "bold" },
          });
          m.addListener("click", () => setPicked(d.user_id));
          markers.push(m);
        });
        setStatus("ready");
      })
      .catch((e) => {
        setErr(e.message);
        setStatus("error");
      });
    return () => {
      markers.forEach((m) => m.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, doctors.length]);

  const pickedDoc = placed.find((p) => p.d.user_id === picked);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 p-0 md:p-6 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-none bg-card shadow-2xl md:rounded-3xl">
        <header className="flex items-center justify-between border-b border-border/60 bg-gradient-blossom px-4 py-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="font-display text-lg font-semibold text-ink">Doctors near me</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[1fr_340px] overflow-hidden">
          <div className="relative min-h-[320px] bg-secondary/40">
            {status === "locating" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Locating you via GPS…
              </div>
            )}
            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                <MapPin className="h-6 w-6 text-destructive" />
                <p className="text-sm text-ink">{err}</p>
                <p className="text-xs text-muted-foreground">
                  Enable location in your browser/device settings and reopen.
                </p>
              </div>
            )}
            <div ref={mapEl} className="h-full w-full min-h-[320px]" />
          </div>

          <aside className="max-h-[60vh] overflow-y-auto border-t border-border/60 bg-card p-3 md:max-h-none md:border-l md:border-t-0">
            {status !== "ready" ? (
              <p className="p-3 text-sm text-muted-foreground">Waiting for location…</p>
            ) : placed.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No doctors to show on map yet.</p>
            ) : (
              <ul className="space-y-2">
                {placed.map(({ d, km }) => (
                  <li key={d.user_id}>
                    <button
                      onClick={() => setPicked(d.user_id)}
                      className={`w-full rounded-xl border p-3 text-left transition hover-lift ${
                        picked === d.user_id
                          ? "border-primary bg-gradient-blossom shadow-petal"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink">Dr. {d.full_name}</p>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                          {km.toFixed(1)} km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{d.specialty}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {pickedDoc && (
              <div className="mt-3">
                <DoctorCard
                  doc={pickedDoc.d}
                  onAction={() => onRequest(pickedDoc.d.user_id)}
                  actionLabel="Request consultation"
                />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
