import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";

import { GET_TODOS, TOGGLE_TODO } from "../../graphql/todoQueries";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import type { Todo } from "../../types/todo";

function formatMonthYear(date: Date) {
  return date
    .toLocaleDateString("en-MY", {
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function formatFullDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateKey(date: Date) {
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

export default function CalendarScreen() {
  const [weekOffset, setWeekOffset] = useState(0);

  const { user } = useAuth();
  const { isDarkMode } = useThemeMode();

  if (!user) {
    return <Redirect href="/login" />;
  }

  const { data, loading, error, refetch } = useQuery<any>(GET_TODOS, {
    skip: !user,
    pollInterval: 3000,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: false,
  });

  const [toggleTodo] = useMutation<any>(TOGGLE_TODO);

  const todos: Todo[] = data?.todos || [];
  const weekDates = getWeekDates(weekOffset);
  const firstDateOfWeek = weekDates[0];

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo({
        variables: { id },
      });

      refetch();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        <View>
          <Text style={[styles.smallTitle, isDarkMode && styles.darkMutedText]}>
            Calendar View
          </Text>

          <Text style={[styles.monthTitle, isDarkMode && styles.darkText]}>
            {formatMonthYear(firstDateOfWeek)}
          </Text>
        </View>

        <View style={styles.weekControls}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setWeekOffset((prev) => prev - 1)}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setWeekOffset(0)}
          >
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setWeekOffset((prev) => prev + 1)}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekDateRow}
        >
          {weekDates.map((date) => {
            const dateKey = toDateKey(date);
            const dayTodos = todos.filter((todo) => todo.dueDate === dateKey);

            return (
              <View
                style={[
                  styles.weekDateChip,
                  isDarkMode && styles.darkWeekDateChip,
                ]}
                key={dateKey}
              >
                <Text
                  style={[
                    styles.weekDayText,
                    isDarkMode && styles.darkMutedText,
                  ]}
                >
                  {date.toLocaleDateString("en-MY", { weekday: "narrow" })}
                </Text>

                <Text
                  style={[styles.weekDateText, isDarkMode && styles.darkText]}
                >
                  {date.getDate()}
                </Text>

                {dayTodos.length > 0 && <View style={styles.dot} />}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && !data && <ActivityIndicator size="large" />}

        {error && <Text style={styles.errorText}>{error.message}</Text>}

        {weekDates.map((date) => {
          const dateKey = toDateKey(date);
          const dayTodos = todos.filter((todo) => todo.dueDate === dateKey);

          return (
            <View style={styles.daySection} key={dateKey}>
              <View style={styles.dayLabel}>
                <Text style={[styles.dayNumber, isDarkMode && styles.darkText]}>
                  {date.getDate()}
                </Text>

                <Text
                  style={[styles.dayName, isDarkMode && styles.darkMutedText]}
                >
                  {date.toLocaleDateString("en-MY", { weekday: "short" })}
                </Text>
              </View>

              <View style={styles.taskList}>
                {dayTodos.length === 0 && (
                  <View
                    style={[
                      styles.emptyTaskCard,
                      isDarkMode && styles.darkEmptyTaskCard,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emptyText,
                        isDarkMode && styles.darkMutedText,
                      ]}
                    >
                      No tasks
                    </Text>
                  </View>
                )}

                {dayTodos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[
                      styles.taskCard,
                      isDarkMode && styles.darkTaskCard,
                      todo.completed && styles.completedTaskCard,
                      isDarkMode &&
                        todo.completed &&
                        styles.darkCompletedTaskCard,
                    ]}
                  >
                    <View style={styles.taskInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          isDarkMode && styles.darkText,
                          todo.completed && styles.completedTaskTitle,
                        ]}
                      >
                        {todo.title}
                      </Text>

                      <Text
                        style={[
                          styles.taskMeta,
                          isDarkMode && styles.darkMutedText,
                        ]}
                      >
                        Due: {formatFullDate(todo.dueDate)}
                      </Text>

                      {todo.checklistItems?.length > 0 && (
                        <Text
                          style={[
                            styles.taskMeta,
                            isDarkMode && styles.darkMutedText,
                          ]}
                        >
                          Checklist:{" "}
                          {
                            todo.checklistItems.filter((item) => item.completed)
                              .length
                          }
                          /{todo.checklistItems.length}
                        </Text>
                      )}
                    </View>

                    <View style={styles.taskRight}>
                      <Text
                        style={[
                          styles.statusText,
                          todo.completed
                            ? styles.completedStatus
                            : styles.inProgressStatus,
                        ]}
                      >
                        {todo.completed ? "Completed" : "In Progress"}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.taskButton,
                          todo.completed
                            ? styles.undoButton
                            : styles.doneButton,
                        ]}
                        onPress={() => handleToggleTodo(todo.id)}
                      >
                        <Text style={styles.taskButtonText}>
                          {todo.completed ? "Undo" : "Done"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  fixedHeader: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  smallTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 4,
  },

  monthTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: 0.5,
  },

  weekControls: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },

  arrowButton: {
    width: 44,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  todayButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  todayText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  weekDateRow: { gap: 8 },

  weekDateChip: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  weekDayText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 4,
  },

  weekDateText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    marginTop: 6,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  daySection: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
  },

  dayLabel: {
    width: 48,
    alignItems: "center",
    paddingTop: 6,
  },

  dayNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
  },

  dayName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    marginTop: 2,
  },

  taskList: {
    flex: 1,
    gap: 10,
  },

  emptyTaskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
  },

  taskCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#0ea5e9",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },

  completedTaskCard: {
    backgroundColor: "#dcfce7",
    borderLeftColor: "#16a34a",
  },

  taskInfo: { flex: 1 },

  taskTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },

  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: "#64748b",
  },

  taskMeta: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },

  taskRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  inProgressStatus: { color: "#d97706" },
  completedStatus: { color: "#16a34a" },

  taskButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  doneButton: { backgroundColor: "#16a34a" },
  undoButton: { backgroundColor: "#f59e0b" },

  taskButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },

  errorText: {
    color: "#dc2626",
    marginBottom: 12,
  },

  darkContainer: { backgroundColor: "#020617" },
  darkHeader: {
    backgroundColor: "#0f172a",
    borderBottomColor: "#334155",
  },
  darkText: { color: "#f8fafc" },
  darkMutedText: { color: "#cbd5e1" },
  darkWeekDateChip: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
  },
  darkEmptyTaskCard: {
    backgroundColor: "#111827",
    borderColor: "#334155",
  },
  darkTaskCard: {
    backgroundColor: "#1e3a8a",
    borderLeftColor: "#60a5fa",
  },
  darkCompletedTaskCard: {
    backgroundColor: "#14532d",
    borderLeftColor: "#22c55e",
  },
});
