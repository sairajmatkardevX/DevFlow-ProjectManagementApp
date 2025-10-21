"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number; 
}

interface CustomGanttProps {
  tasks: GanttTask[];
  viewMode: "month" | "week" | "day";
  isReadOnly?: boolean; 
}

export const CustomGantt: React.FC<CustomGanttProps> = ({ tasks, viewMode, isReadOnly = false }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Theme-aware colors
  const colors = {
    bar: isDark ? "#1e40af" : "#1d4ed8",
    progress: isDark ? "#60a5fa" : "#93c5fd", 
    background: isDark ? "#0b1220" : "#ffffff",
    text: isDark ? "#f9fafb" : "#0f172a",
    grid: isDark ? "#1f2937" : "#e6e7ea",
    border: isDark ? "#374151" : "#e5e7eb",
    today: isDark ? "#fb7185" : "#ef4444",
   
    readonlyBar: isDark ? "#4b5563" : "#9ca3af", 
    readonlyProgress: isDark ? "#6b7280" : "#d1d5db", 
  };

  
  const PROJECT_COL_W = 240;
  const DATE_COL_W = 110;

  
  const UNIT_MIN_W = viewMode === "month" ? 120 : viewMode === "week" ? 80 : 40;

  // ---------- Date helpers ----------
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  // ISO week: Monday as start
  const startOfISOWeek = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const endOfISOWeek = (d: Date) => {
    const s = startOfISOWeek(d);
    const end = new Date(s);
    end.setDate(s.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  
  const isoWeekNumber = (d: Date) => {
    const target = new Date(d.valueOf());
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    firstThursday.setHours(0, 0, 0, 0);
    const diff = target.getTime() - firstThursday.getTime();
    return 1 + Math.round(diff / 604800000);
  };

  
  const { units, unitCount, unitStartDates, overallStart, overallEnd } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      const now = new Date();
      const s = startOfMonth(now);
      return { units: [s], unitCount: 1, unitStartDates: [s], overallStart: s, overallEnd: endOfMonth(s) };
    }

   
    const minT = new Date(Math.min(...tasks.map((t) => t.start.getTime())));
    const maxT = new Date(Math.max(...tasks.map((t) => t.end.getTime())));

    // normalize range depending on viewMode
    let curStart: Date;
    let finalUnitStart: Date;
    if (viewMode === "month") {
      curStart = startOfMonth(minT);
      finalUnitStart = startOfMonth(maxT);
    } else if (viewMode === "week") {
      curStart = startOfISOWeek(minT);
      finalUnitStart = startOfISOWeek(maxT);
    } else {
      // day
      curStart = startOfDay(minT);
      finalUnitStart = startOfDay(maxT);
    }

    const units: Date[] = [];
    const unitStartDates: Date[] = [];
    const cur = new Date(curStart);

    while (cur <= finalUnitStart) {
      unitStartDates.push(new Date(cur));
      units.push(new Date(cur));
      if (viewMode === "month") {
        cur.setMonth(cur.getMonth() + 1);
        cur.setDate(1);
      } else if (viewMode === "week") {
        cur.setDate(cur.getDate() + 7);
      } else {
        cur.setDate(cur.getDate() + 1);
      }
    }

    // compute overall range end (end of last unit)
    let overallEnd: Date;
    if (viewMode === "month") {
      overallEnd = endOfMonth(unitStartDates[unitStartDates.length - 1]);
    } else if (viewMode === "week") {
      overallEnd = endOfISOWeek(unitStartDates[unitStartDates.length - 1]);
    } else {
      overallEnd = endOfDay(unitStartDates[unitStartDates.length - 1]);
    }

    return {
      units,
      unitCount: units.length,
      unitStartDates,
      overallStart: unitStartDates[0],
      overallEnd,
    };
  }, [tasks, viewMode]);

  // ---------- Unit label formatting ----------
  const unitLabel = (d: Date) => {
    if (viewMode === "month") {
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else if (viewMode === "week") {
      const w = isoWeekNumber(d);
      const y = d.getFullYear();
      return `W${w} ${y}`;
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    }
  };

  // ---------- Build unit start/end ranges for checks ----------
  const unitRanges = useMemo(() => {
    return unitStartDates.map((s) => {
      if (viewMode === "month") {
        return { start: startOfMonth(s), end: endOfMonth(s) };
      } else if (viewMode === "week") {
        return { start: startOfISOWeek(s), end: endOfISOWeek(s) };
      } else {
        return { start: startOfDay(s), end: endOfDay(s) };
      }
    });
  }, [unitStartDates, viewMode]);

 
  type Span = { startIndex: number; endIndex: number; coveredCount: number } | null;
  const spans = useMemo(() => {
    const map: Record<string, Span> = {};
    tasks.forEach((task) => {
      let first = -1;
      let last = -1;
      for (let i = 0; i < unitRanges.length; i++) {
        const u = unitRanges[i];
        if (task.start <= u.end && task.end >= u.start) {
          if (first === -1) first = i;
          last = i;
        }
      }
      if (first === -1) map[task.id] = null;
      else map[task.id] = { startIndex: first, endIndex: last, coveredCount: last - first + 1 };
    });
    return map;
  }, [tasks, unitRanges]);

 
  const todayPercent = useMemo(() => {
    const today = new Date();
    if (today.getTime() < overallStart.getTime() || today.getTime() > overallEnd.getTime()) return null;

    let elapsed = 0;
    for (let i = 0; i < unitRanges.length; i++) {
      const u = unitRanges[i];
      if (today.getTime() < u.start.getTime()) break;
      if (today.getTime() > u.end.getTime()) {
        elapsed += 1;
      } else {
        const frac = (today.getTime() - u.start.getTime()) / (u.end.getTime() - u.start.getTime());
        elapsed += frac;
        break;
      }
    }
    return (elapsed / unitRanges.length) * 100;
  }, [unitRanges, overallStart, overallEnd]);

  
  const formatShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

 
  const getBarColors = () => {
    if (isReadOnly) {
      return {
        bar: colors.readonlyBar,
        progress: colors.readonlyProgress,
      };
    }
    return {
      bar: colors.bar,
      progress: colors.progress,
    };
  };

  const barColors = getBarColors();

  // ---------- Render ----------
  if (!tasks || tasks.length === 0) {
    return (
      <div
        className="p-6 rounded-md border"
        style={{ background: colors.background, borderColor: colors.border, color: colors.text }}
      >
        No tasks to display
      </div>
    );
  }

  
  const minTotalWidth = PROJECT_COL_W + DATE_COL_W * 2 + unitCount * UNIT_MIN_W;

  return (
    <div className="w-full">
      <div
        className={`overflow-x-auto rounded-md border ${isReadOnly ? 'cursor-default' : 'cursor-grab'}`} // DIFFERENT CURSOR BASED ON ROLE
        style={{ borderColor: colors.border, background: colors.background }}
      >
        <div className="min-w-max" style={{ minWidth: minTotalWidth }}>
          {/* Header */}
          <div className="flex items-stretch border-b" style={{ borderColor: colors.border }}>
            <div
              className="flex items-center px-4 font-medium text-sm whitespace-nowrap"
              style={{
                width: PROJECT_COL_W,
                minWidth: PROJECT_COL_W,
                borderRight: `1px solid ${colors.border}`,
                color: colors.text,
                background: colors.background,
              }}
            >
              Project
            </div>

            <div
              className="flex items-center px-3 font-medium text-sm text-center whitespace-nowrap"
              style={{
                width: DATE_COL_W,
                minWidth: DATE_COL_W,
                borderRight: `1px solid ${colors.border}`,
                color: colors.text,
                background: colors.background,
              }}
            >
              Start
            </div>

            <div
              className="flex items-center px-3 font-medium text-sm text-center whitespace-nowrap"
              style={{
                width: DATE_COL_W,
                minWidth: DATE_COL_W,
                borderRight: `1px solid ${colors.border}`,
                color: colors.text,
                background: colors.background,
              }}
            >
              End
            </div>

            <div className="flex" style={{ minWidth: unitCount * UNIT_MIN_W }}>
              {unitStartDates.map((u, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-xs text-center whitespace-nowrap border-r"
                  style={{
                    minWidth: UNIT_MIN_W,
                    borderRight: `1px solid ${colors.border}`,
                    color: colors.text,
                    background: colors.background,
                  }}
                >
                  {unitLabel(u)}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div>
            {tasks.map((task) => {
              const span = spans[task.id];
              return (
                <div
                  key={task.id}
                  className="flex items-center relative"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  {/* Project column */}
                  <div
                    className="px-4 py-3 text-sm truncate"
                    style={{
                      width: PROJECT_COL_W,
                      minWidth: PROJECT_COL_W,
                      borderRight: `1px solid ${colors.border}`,
                      color: colors.text,
                      background: colors.background,
                    }}
                    title={task.name}
                  >
                    {task.name}
                  </div>

                  {/* Start */}
                  <div
                    className="px-3 py-3 text-sm text-center whitespace-nowrap"
                    style={{
                      width: DATE_COL_W,
                      minWidth: DATE_COL_W,
                      borderRight: `1px solid ${colors.border}`,
                      color: colors.text,
                      background: colors.background,
                    }}
                  >
                    {formatShort(task.start)}
                  </div>

                  {/* End */}
                  <div
                    className="px-3 py-3 text-sm text-center whitespace-nowrap"
                    style={{
                      width: DATE_COL_W,
                      minWidth: DATE_COL_W,
                      borderRight: `1px solid ${colors.border}`,
                      color: colors.text,
                      background: colors.background,
                    }}
                  >
                    {formatShort(task.end)}
                  </div>

                  {/* Timeline grid */}
                  <div className="relative flex" style={{ minWidth: unitCount * UNIT_MIN_W }}>
                    {/* grid cells */}
                    {unitStartDates.map((_, i) => (
                      <div
                        key={i}
                        className="px-3 py-3 border-r"
                        style={{
                          minWidth: UNIT_MIN_W,
                          borderRight: `1px solid ${colors.border}`,
                          background: colors.background,
                        }}
                        aria-hidden
                      />
                    ))}

                 
                    {span && (
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded-md z-10 flex items-center overflow-hidden ${
                          isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-90'
                        }`} 
                        style={{
                          left: `${(span.startIndex / unitCount) * 100}%`,
                          width: `${(span.coveredCount / unitCount) * 100}%`,
                          marginLeft: 4,
                          marginRight: 4,
                          minWidth: 20,
                          background: barColors.bar,
                          color: "white",
                         
                          opacity: isReadOnly ? 0.8 : 1,
                        }}
                        title={`${task.name}: ${task.start.toDateString()} → ${task.end.toDateString()} ${
                          isReadOnly ? '(Read-only)' : ''
                        }`}
                        onClick={(e) => {
                          if (isReadOnly) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          
                          console.log('Task clicked:', task.id);
                        }}
                      >
                        {/* Progress overlay */}
                        <div
                          className="absolute left-0 top-0 h-full rounded-l-md"
                          style={{
                            width: `${Math.min(Math.max(task.progress, 0), 100)}%`,
                            background: barColors.progress,
                            zIndex: 11,
                          }}
                        />

                        {/* progress text on top */}
                        <div className="relative z-20 px-3 text-xs font-medium truncate" style={{ pointerEvents: "none" }}>
                          {task.progress}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today vertical line */}
          {todayPercent != null && (
            <div
              aria-hidden
              className="absolute top-0 bottom-0 z-30"
              style={{
                left: PROJECT_COL_W + DATE_COL_W * 2 + (todayPercent / 100) * (unitCount * UNIT_MIN_W),
                width: 2,
                background: colors.today,
                opacity: 0.95,
              }}
            />
          )}
        </div>
      </div>
      
      {/* Read-only indicator */}
      {isReadOnly && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Timeline view only - No modifications allowed
        </div>
      )}
    </div>
  );
};