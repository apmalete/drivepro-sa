type DashboardCardProps = {
  title: string;
  value: string | number;
};

function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  // ==========================================
  // CARD COLOUR
  // ==========================================

  const getColor = () => {
    if (title.includes("Students")) {
      return "#2563EB";
    }

    if (title.includes("Instructors")) {
      return "#16A34A";
    }

    if (title.includes("Vehicles")) {
      return "#F59E0B";
    }

    if (title.includes("Lessons")) {
      return "#8B5CF6";
    }

    if (title.includes("Income")) {
      return "#059669";
    }

    if (title.includes("Outstanding")) {
      return "#DC2626";
    }

    return "#1E3A8A";
  };

  // ==========================================
  // DESCRIPTION
  // ==========================================

  const getDescription = () => {
    if (title.includes("Total Students")) {
      return "Registered Students";
    }

    if (title.includes("Students")) {
      return "Student Records";
    }

    if (title.includes("Instructors")) {
      return "Active Instructors";
    }

    if (title.includes("Vehicles")) {
      return "Training Vehicles";
    }

    if (title.includes("Today's Lessons")) {
      return "Lessons Scheduled Today";
    }

    if (title.includes("Booked")) {
      return "Lessons Awaiting Completion";
    }

    if (title.includes("Completed")) {
      return "Successfully Completed";
    }

    if (title.includes("Cancelled")) {
      return "Cancelled Lessons";
    }

    if (title.includes("Upcoming")) {
      return "Future Bookings";
    }

    if (title.includes("Total Lessons")) {
      return "All Scheduled Lessons";
    }

    if (title.includes("Income")) {
      return "Current Month Income";
    }

    if (title.includes("Outstanding")) {
      return "Outstanding Student Fees";
    }

    return "DrivePro-SA";
  };

  // ==========================================
  // CARD
  // ==========================================

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px",
        width: "100%",
        minHeight: "175px",
        boxSizing: "border-box",
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.08)",
        borderTop:
          `6px solid ${getColor()}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease",
      }}

      // ========================================
      // MOUSE HOVER
      // ========================================

      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-6px)";

        e.currentTarget.style.boxShadow =
          "0 18px 35px rgba(0,0,0,0.15)";
      }}

      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";

        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0,0,0,0.08)";
      }}
    >
      {/* ======================================
          TITLE
      ======================================= */}

      <div>
        <h3
          style={{
            margin: 0,
            color: "#555",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            color: "#888",
            fontSize: "14px",
          }}
        >
          {getDescription()}
        </p>
      </div>

      {/* ======================================
          VALUE
      ======================================= */}

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "42px",
            color: getColor(),
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {value}
        </h1>

        {/* ====================================
            PROGRESS DECORATION
        ===================================== */}

        <div
          style={{
            marginTop: 12,
            width: "100%",
            height: "6px",
            borderRadius: "6px",
            background: "#f1f5f9",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "75%",
              height: "100%",
              background: getColor(),
              borderRadius: "6px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;