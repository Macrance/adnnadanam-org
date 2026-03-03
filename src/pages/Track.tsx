import { useEffect } from "react";
import { useAuth, Donation } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ---------------- FIX 1: Leaflet Icon ---------------- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ---------------- SAFE STATUS CONFIG ---------------- */
const statusConfig = {
  pending: {
    label: "Pending Pickup",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  picked: {
    label: "Picked Up",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
};

const statusSteps = [
  "pending",
  "picked",
  "in_transit",
  "delivered",
];

export default function TrackPage() {
  const { user, donations, updateDonationStatus } = useAuth();
  const navigate = useNavigate();

  /* ---------------- FIX 2: SAFE REDIRECT ---------------- */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  /* ---------------- FIX 3: SAFE DONATIONS ---------------- */
  const safeDonations = donations || [];

  const myDonations =
    user.role === "admin"
      ? safeDonations
      : safeDonations.filter(
          (d) =>
            d?.donorId === user.id ||
            d?.recipientId === user.id
        );

  /* ---------------- FIX 4: SAFE MAP CENTER ---------------- */
  const demoCenter: [number, number] = [19.076, 72.8777];

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container">

        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Track Donations
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor your food donations
            </p>
          </div>
          <Button onClick={() => navigate("/donate-food")}>
            + New Donation
          </Button>
        </div>

        {/* ---------------- MAP ---------------- */}
        <div
          className="mb-8 rounded-lg overflow-hidden border"
          style={{ height: 350 }}
        >
          <MapContainer
            center={demoCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {myDonations.map((d, i) => {
              /* -------- FIX 5: SAFE STATUS -------- */
              const safeStatus =
                statusConfig[d?.status]
                  ? d.status
                  : "pending";

              return (
                <Marker
                  key={d?.id || i}
                  position={[
                    demoCenter[0] + i * 0.01,
                    demoCenter[1] + i * 0.01,
                  ]}
                >
                  <Popup>
                    <strong>
                      {d?.donorName || "Donor"}
                    </strong>
                    <br />
                    {d?.foodType || "Food"} ·{" "}
                    {d?.quantity || 0} servings
                    <br />
                    Status:{" "}
                    {statusConfig[safeStatus].label}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* ---------------- DONATION LIST ---------------- */}
        {myDonations.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold mb-2">
              No donations yet
            </h3>
            <Button
              onClick={() => navigate("/donate-food")}
            >
              Donate Food
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myDonations.map((d, index) => {
              /* -------- FIX 6: SAFE STATUS -------- */
              const safeStatus =
                statusConfig[d?.status]
                  ? d.status
                  : "pending";

              const cfg =
                statusConfig[safeStatus];

              const currentStep =
                statusSteps.indexOf(safeStatus);

              const StatusIcon = cfg.icon;

              return (
                <div
                  key={d?.id || index}
                  className="p-6 border rounded-lg"
                >
                  <div className="flex gap-4">
                    {d?.imageUrl && (
                      <img
                        src={d.imageUrl}
                        alt="Food"
                        className="w-24 h-24 rounded object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <h3 className="font-semibold">
                          {d?.foodType || "Food"}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${cfg.color}`}
                        >
                          <StatusIcon className="inline h-3 w-3 mr-1" />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Quantity:{" "}
                          {d?.quantity || 0}
                        </div>
                        <div>
                          Pickup Time:{" "}
                          {d?.pickupTime
                            ? new Date(
                                d.pickupTime
                              ).toLocaleString()
                            : "Not scheduled"}
                        </div>
                        <div>
                          Address:{" "}
                          {d?.address
                            ? d.address.slice(
                                0,
                                30
                              )
                            : "No address"}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="flex mt-4 gap-1">
                        {statusSteps.map(
                          (step, i) => (
                            <div
                              key={step}
                              className={`h-2 flex-1 rounded ${
                                i <= currentStep
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          )
                        )}
                      </div>

                      {/* Admin Controls */}
                      {user.role === "admin" &&
                        safeStatus !==
                          "delivered" && (
                          <div className="mt-4 flex gap-2">
                            {statusSteps
                              .slice(
                                currentStep + 1
                              )
                              .map((next) => (
                                <Button
                                  key={next}
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateDonationStatus?.(
                                      d.id,
                                      next
                                    )
                                  }
                                >
                                  Mark as{" "}
                                  {
                                    statusConfig[
                                      next
                                    ].label
                                  }
                                </Button>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
