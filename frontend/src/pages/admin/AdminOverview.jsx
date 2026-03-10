import { useGetAdminDashboardQuery } from "../../features/admin/adminApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { useState, useEffect } from "react";

export default function AdminOverview() {
  const { data, isLoading } = useGetAdminDashboardQuery(undefined, { pollingInterval: 30000 });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <Spinner size={36} />
    </div>
  );

  const s = data?.data?.stats || {};
  const blood = data?.data?.bloodAvailability || {};
  const donations = data?.data?.monthlyDonations || [];
  const requests = data?.data?.monthlyRequests || [];
  const max = Math.max(...donations.map((d) => d.count), ...requests.map((r) => r.count), 1);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Responsive grid columns
  const getStatsGridColumns = () => {
    if (windowWidth < 640) return "1fr";
    if (windowWidth < 768) return "repeat(2, 1fr)";
    if (windowWidth < 1024) return "repeat(3, 1fr)";
    if (windowWidth < 1280) return "repeat(4, 1fr)";
    return "repeat(5, 1fr)";
  };

  const getBloodGridColumns = () => {
    if (windowWidth < 480) return "repeat(2, 1fr)";
    if (windowWidth < 640) return "repeat(2, 1fr)";
    if (windowWidth < 1024) return "repeat(3, 1fr)";
    return "repeat(4, 1fr)";
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: isMobile ? "16px" : "24px",
      padding: isMobile ? "0px" : "24px"
    }}>
      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: getStatsGridColumns(), 
        gap: isMobile ? "12px" : "14px" 
      }}>
        <StatCard 
          icon="👥" 
          label="Total Users" 
          value={s.totalUsers?.toLocaleString()} 
          sub="Registered users" 
          color="#3B82F6" 
        />
        <StatCard 
          icon="🏥" 
          label="Hospitals" 
          value={s.totalHospitals?.toLocaleString()} 
          sub={`${s.pendingHospitals || 0} pending`} 
          color="#22C55E" 
        />
        <StatCard 
          icon="📋" 
          label="Blood Requests" 
          value={s.totalRequests?.toLocaleString()} 
          sub={`${s.pendingRequests || 0} pending`} 
          color="#F59E0B" 
        />
        <StatCard 
          icon="🩸" 
          label="Available Units" 
          value={s.availableUnits?.toLocaleString()} 
          sub="Across all hospitals" 
          color="#E8192C" 
        />
        <StatCard 
          icon="💉" 
          label="Total Donations" 
          value={s.totalDonations?.toLocaleString()} 
          sub="All time" 
          color="#8B5CF6" 
        />
      </div>

      {/* Pending Approval Alert */}
      {s.pendingHospitals > 0 && (
        <div style={{ 
          background: "rgba(245,158,11,0.08)", 
          border: "1px solid rgba(245,158,11,0.2)", 
          borderRadius: "12px", 
          padding: isMobile ? "16px" : "16px 20px",
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center", 
          gap: isMobile ? "12px" : "16px"
        }}>
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ 
              fontWeight: 700, 
              color: "#F59E0B", 
              fontSize: isMobile ? "14px" : "16px",
              marginBottom: "4px"
            }}>
              {s.pendingHospitals} Hospital(s) Awaiting Approval
            </p>
            <p style={{ 
              fontSize: isMobile ? "12px" : "13px", 
              color: "#8E8E9A",
              margin: 0
            }}>
              Review hospital registrations in the Hospitals section.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/hospitals?status=pending'}
            style={{
              width: isMobile ? "100%" : "auto",
              background: "#F59E0B",
              color: "white",
              border: "none",
              padding: isMobile ? "10px 16px" : "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#D97706"}
            onMouseLeave={(e) => e.target.style.background = "#F59E0B"}
          >
            Review Now
          </button>
        </div>
      )}

      {/* Blood Availability */}
      <Card>
        <h3 style={{ 
          fontFamily: "'Syne', sans-serif", 
          fontSize: isMobile ? "16px" : "18px", 
          fontWeight: 700, 
          marginBottom: isMobile ? "16px" : "20px" 
        }}>
          Blood Availability (All Hospitals)
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: getBloodGridColumns(), 
          gap: isMobile ? "8px" : "12px" 
        }}>
          {Object.entries(blood).map(([grp, units]) => (
            <div
              key={grp}
              style={{
                background: "#1F1F24",
                borderRadius: "12px",
                padding: isMobile ? "12px 8px" : "14px",
                textAlign: "center",
                border: `1px solid ${units < 5 ? "rgba(232,25,44,0.3)" : "#2A2A30"}`,
              }}
            >
              <BloodBadge group={grp} />
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: 800,
                color: units < 5 ? "#FF4D5E" : units < 15 ? "#F59E0B" : "#F5F5F7",
                margin: "8px 0 4px 0"
              }}>
                {units}
              </p>
              <div style={{
                height: "4px",
                background: "#2A2A30",
                borderRadius: "999px",
                overflow: "hidden",
                margin: "6px 0 4px 0"
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min((units / 50) * 100, 100)}%`,
                  background: units < 5 ? "#E8192C" : units < 15 ? "#F59E0B" : "#22C55E",
                  borderRadius: "999px",
                }} />
              </div>
              <p style={{
                fontSize: isMobile ? "10px" : "11px",
                color: "#8E8E9A",
                margin: 0
              }}>
                units
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Trend Chart */}
      <Card>
        <h3 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: isMobile ? "16px" : "18px",
          fontWeight: 700,
          marginBottom: isMobile ? "16px" : "20px"
        }}>
          Monthly Trend
        </h3>
        
        {/* Chart Container */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: isMobile ? "4px" : "8px",
          height: isMobile ? "120px" : "140px",
          overflowX: "auto",
          paddingBottom: "4px"
        }}>
          {donations.slice(isMobile ? -5 : -7).map((d, i) => {
            const index = isMobile ? donations.length - 5 + i : donations.length - 7 + i;
            const r = requests[index] || { count: 0 };
            const month = MONTHS[(d._id?.month || 1) - 1];
            
            const donationHeight = (d.count / max) * (isMobile ? 100 : 120);
            const requestHeight = (r.count / max) * (isMobile ? 100 : 120);

            return (
              <div
                key={i}
                style={{
                  flex: "1 0 auto",
                  minWidth: isMobile ? "40px" : "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  gap: "4px"
                }}
              >
                <div style={{
                  width: "100%",
                  display: "flex",
                  gap: isMobile ? "2px" : "3px",
                  alignItems: "flex-end",
                  justifyContent: "center"
                }}>
                  <div
                    title={`Donations: ${d.count}`}
                    style={{
                      width: isMobile ? "12px" : "16px",
                      height: `${Math.max(donationHeight, 2)}px`,
                      background: "linear-gradient(to top, rgba(34,197,94,0.8), rgba(34,197,94,0.3))",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <div
                    title={`Requests: ${r.count}`}
                    style={{
                      width: isMobile ? "12px" : "16px",
                      height: `${Math.max(requestHeight, 2)}px`,
                      background: "linear-gradient(to top, rgba(232,25,44,0.8), rgba(232,25,44,0.3))",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                </div>
                <span style={{
                  fontSize: isMobile ? "9px" : "11px",
                  color: "#8E8E9A",
                  whiteSpace: "nowrap"
                }}>
                  {month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: "flex",
          gap: isMobile ? "12px" : "18px",
          marginTop: isMobile ? "12px" : "16px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "3px",
              background: "#22C55E"
            }} />
            <span style={{ fontSize: isMobile ? "11px" : "12px", color: "#8E8E9A" }}>
              Donations
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "3px",
              background: "#E8192C"
            }} />
            <span style={{ fontSize: isMobile ? "11px" : "12px", color: "#8E8E9A" }}>
              Requests
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}