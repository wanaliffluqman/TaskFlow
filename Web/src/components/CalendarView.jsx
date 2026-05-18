import { useState } from "react";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDates(weekOffset = 0) {
  const today = new Date();
  const currentDay = today.getDay();

  const monday = new Date(today);
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  monday.setDate(today.getDate() + diffToMonday + weekOffset * 7);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function CalendarView({ todos, onToggleTodo }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const otherTodos = todos.filter(
    (todo) => !weekDates.some((date) => toDateKey(date) === todo.dueDate),
  );

  return (
    <div className="calendar-board">
      <div className="calendar-board-header">
        <div>
          <h2>Weekly Calendar</h2>
          <p>
            {formatDate(toDateKey(weekStart))} -{" "}
            {formatDate(toDateKey(weekEnd))}
          </p>
        </div>

        <div className="calendar-controls">
          <button type="button" onClick={() => setWeekOffset(weekOffset - 1)}>
            ‹
          </button>

          <button type="button" onClick={() => setWeekOffset(0)}>
            Today
          </button>

          <button type="button" onClick={() => setWeekOffset(weekOffset + 1)}>
            ›
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDates.map((date) => {
          const dateKey = toDateKey(date);
          const dayTodos = todos.filter((todo) => todo.dueDate === dateKey);

          return (
            <div className="calendar-column" key={dateKey}>
              <div className="calendar-column-header">
                <span>
                  {date.toLocaleDateString("en-MY", { weekday: "short" })}
                </span>
                <strong>{formatDate(dateKey)}</strong>
              </div>

              <div className="calendar-column-body">
                {dayTodos.length === 0 && (
                  <p className="calendar-empty">No tasks</p>
                )}

                {dayTodos.map((todo) => (
                  <div
                    className={
                      todo.completed
                        ? "calendar-task-card completed-calendar-task"
                        : "calendar-task-card"
                    }
                    key={todo.id}
                  >
                    <div>
                      <p>{todo.title}</p>
                      <span>
                        {todo.completed ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={
                        todo.completed
                          ? "calendar-undo-button"
                          : "calendar-complete-button"
                      }
                      onClick={() => onToggleTodo(todo.id)}
                    >
                      {todo.completed ? "Undo" : "Done"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-unscheduled">
        <h3>List of Tasks</h3>

        {otherTodos.length === 0 && (
          <p className="calendar-empty">No other tasks.</p>
        )}

        {otherTodos.map((todo) => (
          <div className="calendar-other-task" key={todo.id}>
            <div>
              <strong>{todo.title}</strong>
              <p>Due: {formatDate(todo.dueDate)}</p>
            </div>

            <span>{todo.completed ? "Completed" : "In Progress"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
