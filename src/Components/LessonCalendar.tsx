import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

// ==========================================
// LOCALIZER
// ==========================================

const localizer = momentLocalizer(moment);

// ==========================================
// LESSON EVENT
// ==========================================

export interface LessonEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

// ==========================================
// SLOT INFORMATION
// ==========================================

export interface LessonSlotInfo {
  start: Date;
  end: Date;
}

// ==========================================
// PROPS
// ==========================================

interface Props {
  lessons: LessonEvent[];

  onSelectEvent?: (
    event: LessonEvent
  ) => void;

  onSelectSlot?: (
    slotInfo: LessonSlotInfo
  ) => void;
}

// ==========================================
// LESSON CALENDAR
// ==========================================

export default function LessonCalendar({
  lessons,
  onSelectEvent,
  onSelectSlot,
}: Props) {
  // ==========================================
  // SELECT EXISTING LESSON
  // ==========================================

  const handleSelectEvent = (
    event: LessonEvent
  ) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  // ==========================================
  // SELECT EMPTY TIME SLOT
  // ==========================================

  const handleSelectSlot = (
    slotInfo: LessonSlotInfo
  ) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  // ==========================================
  // EVENT STYLE
  // ==========================================

  const eventPropGetter = () => ({
    style: {
      backgroundColor: "#1976d2",
      color: "white",
      borderRadius: 6,
      border: "none",
      padding: "4px",
      fontSize: "13px",
      fontWeight: 500,
    },
  });

  // ==========================================
  // CALENDAR
  // ==========================================

  return (
    <Calendar
      localizer={localizer}
      events={lessons}
      startAccessor="start"
      endAccessor="end"
      defaultView={Views.WEEK}
      views={[
        Views.DAY,
        Views.WEEK,
        Views.MONTH,
        Views.AGENDA,
      ]}
      step={30}
      timeslots={2}
      popup
      selectable
      style={{
        height: 750,
        marginTop: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
      }}
      onSelectEvent={handleSelectEvent}
      onSelectSlot={handleSelectSlot}
      eventPropGetter={eventPropGetter}
    />
  );
}