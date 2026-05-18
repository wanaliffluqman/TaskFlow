import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@apollo/client/react";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  ADD_CHECKLIST_ITEM,
  ADD_TODO,
  DELETE_CHECKLIST_ITEM,
  DELETE_TODO,
  GET_TODOS,
  TOGGLE_CHECKLIST_ITEM,
  TOGGLE_TODO,
} from "../../graphql/todoQueries";

import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import type { Todo } from "../../types/todo";

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checklistInputs, setChecklistInputs] = useState<
    Record<string, string>
  >({});
  const [editChecklistTodoId, setEditChecklistTodoId] = useState<string | null>(
    null,
  );

  const { user, logoutUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useThemeMode();

  const { data, loading, error, refetch } = useQuery<any>(GET_TODOS, {
    skip: !user,
    pollInterval: 3000,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: false,
  });

  const [addTodo] = useMutation<any>(ADD_TODO);
  const [deleteTodo] = useMutation<any>(DELETE_TODO);
  const [toggleTodo] = useMutation<any>(TOGGLE_TODO);

  const [addChecklistItem] = useMutation<any>(ADD_CHECKLIST_ITEM);
  const [toggleChecklistItem] = useMutation<any>(TOGGLE_CHECKLIST_ITEM);
  const [deleteChecklistItem] = useMutation<any>(DELETE_CHECKLIST_ITEM);

  const todos: Todo[] = data?.todos || [];

  const handleAddTodo = async () => {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert("Validation Error", "Please enter task title and due date.");
      return;
    }

    if (!isValidDateInput(dueDate)) {
      Alert.alert("Invalid Due Date", "Please use YYYY-MM-DD format.");
      return;
    }

    try {
      await addTodo({
        variables: {
          title,
          dueDate,
        },
      });

      setTitle("");
      setDueDate("");
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo({
        variables: { id },
      });

      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo({
              variables: { id },
            });

            refetch();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const handleChecklistInputChange = (todoId: string, value: string) => {
    setChecklistInputs((prev) => ({
      ...prev,
      [todoId]: value,
    }));
  };

  const handleAddChecklistItem = async (todoId: string) => {
    const itemTitle = checklistInputs[todoId];

    if (!itemTitle || !itemTitle.trim()) return;

    try {
      await addChecklistItem({
        variables: {
          todoId,
          title: itemTitle,
        },
      });

      setChecklistInputs((prev) => ({
        ...prev,
        [todoId]: "",
      }));

      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleToggleChecklistItem = async (
    todoId: string,
    checklistItemId: string,
  ) => {
    try {
      await toggleChecklistItem({
        variables: {
          todoId,
          checklistItemId,
        },
      });

      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDeleteChecklistItem = async (
    todoId: string,
    checklistItemId: string,
  ) => {
    try {
      await deleteChecklistItem({
        variables: {
          todoId,
          checklistItemId,
        },
      });

      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();

    setTitle("");
    setDueDate("");
    setChecklistInputs({});
    setEditChecklistTodoId(null);

    router.replace("/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleDarkMode}
            >
              <Text style={styles.themeIconText}>
                {isDarkMode ? "☀️" : "🌙"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            TaskFlow
          </Text>

          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
            Logged in as {user?.email}
          </Text>

          <View style={styles.todoForm}>
            <View style={styles.taskInputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                New Task
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.todoInput,
                  isDarkMode && styles.darkInput,
                ]}
                placeholder="Enter new task..."
                placeholderTextColor={isDarkMode ? "#94a3b8" : "#64748b"}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.dateInputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Due Date
              </Text>

              <TouchableOpacity
                style={[
                  styles.input,
                  styles.todoInput,
                  styles.datePickerInput,
                  isDarkMode && styles.darkInput,
                ]}
                onPress={() => setShowDatePicker((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.datePickerText,
                    !dueDate && styles.placeholderText,
                    isDarkMode && styles.darkText,
                    !dueDate && isDarkMode && styles.darkPlaceholderText,
                  ]}
                >
                  {dueDate ? formatDisplayDate(dueDate) : "Select due date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View
                  style={[
                    styles.datePickerWrapper,
                    isDarkMode && styles.darkDatePickerWrapper,
                  ]}
                >
                  <DateTimePicker
                    value={dueDate ? new Date(dueDate) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "calendar"}
                    themeVariant={isDarkMode ? "dark" : "light"}
                    onValueChange={(event, selectedDate) => {
                      if (selectedDate) {
                        const year = selectedDate.getFullYear();
                        const month = String(
                          selectedDate.getMonth() + 1,
                        ).padStart(2, "0");
                        const day = String(selectedDate.getDate()).padStart(
                          2,
                          "0",
                        );

                        setDueDate(`${year}-${month}-${day}`);
                      }

                      if (Platform.OS !== "ios") {
                        setShowDatePicker(false);
                      }
                    }}
                    onDismiss={() => setShowDatePicker(false)}
                  />

                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.doneDateButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {loading && !data && <ActivityIndicator size="large" />}
          {error && <Text style={styles.errorText}>{error.message}</Text>}

          {todos.length === 0 && (
            <Text
              style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}
            >
              No tasks yet.
            </Text>
          )}

          {todos.map((item) => (
            <View
              key={item.id}
              style={[styles.todoItem, isDarkMode && styles.darkTodoItem]}
            >
              <View style={styles.todoTopRow}>
                <Text
                  style={[
                    styles.todoText,
                    isDarkMode && styles.darkText,
                    item.completed && styles.completedTodoText,
                  ]}
                >
                  {item.title}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    item.completed
                      ? styles.completedBadge
                      : styles.inProgressBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.completed ? "Completed" : "In Progress"}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.dateText, isDarkMode && styles.darkSubtitle]}
              >
                Created: {formatDateTime(item.createdAt)}
              </Text>

              <Text
                style={[styles.dateText, isDarkMode && styles.darkSubtitle]}
              >
                Due: {formatDate(item.dueDate)}
              </Text>

              {item.completedAt && (
                <Text
                  style={[styles.dateText, isDarkMode && styles.darkSubtitle]}
                >
                  Completed: {formatDateTime(item.completedAt)}
                </Text>
              )}

              <View
                style={[
                  styles.checklistSection,
                  isDarkMode && styles.darkChecklistSection,
                ]}
              >
                <View style={styles.checklistHeader}>
                  <Text
                    style={[
                      styles.checklistTitle,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Checklist
                  </Text>

                  <TouchableOpacity
                    style={styles.editChecklistButton}
                    onPress={() =>
                      setEditChecklistTodoId(
                        editChecklistTodoId === item.id ? null : item.id,
                      )
                    }
                  >
                    <Text style={styles.buttonText}>
                      {editChecklistTodoId === item.id
                        ? "Done"
                        : item.checklistItems?.length > 0
                          ? "Edit"
                          : "+ Add"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {editChecklistTodoId === item.id && (
                  <View style={styles.checklistAddRow}>
                    <TextInput
                      style={[
                        styles.checklistInput,
                        isDarkMode && styles.darkInput,
                      ]}
                      placeholder="Add checklist item..."
                      placeholderTextColor={isDarkMode ? "#94a3b8" : "#64748b"}
                      value={checklistInputs[item.id] || ""}
                      onChangeText={(value) =>
                        handleChecklistInputChange(item.id, value)
                      }
                    />

                    <TouchableOpacity
                      style={styles.addChecklistButton}
                      onPress={() => handleAddChecklistItem(item.id)}
                    >
                      <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.checklistItems?.length === 0 && (
                  <Text
                    style={[
                      styles.checklistEmpty,
                      isDarkMode && styles.darkSubtitle,
                    ]}
                  >
                    No checklist items yet.
                  </Text>
                )}

                {item.checklistItems?.map((checklistItem) => (
                  <View style={styles.checklistItem} key={checklistItem.id}>
                    <TouchableOpacity
                      style={styles.checklistCheck}
                      onPress={() =>
                        handleToggleChecklistItem(item.id, checklistItem.id)
                      }
                    >
                      <Text style={styles.checklistCheckText}>
                        {checklistItem.completed ? "☑" : "☐"}
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.checklistItemText,
                        isDarkMode && styles.darkText,
                        checklistItem.completed &&
                          styles.checklistCompletedText,
                      ]}
                    >
                      {checklistItem.title}
                    </Text>

                    {editChecklistTodoId === item.id && (
                      <TouchableOpacity
                        style={styles.checklistDeleteButton}
                        onPress={() =>
                          handleDeleteChecklistItem(item.id, checklistItem.id)
                        }
                      >
                        <Text style={styles.buttonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.todoActions}>
                <TouchableOpacity
                  style={[
                    styles.smallButton,
                    item.completed ? styles.undoButton : styles.completeButton,
                  ]}
                  onPress={() => handleToggleTodo(item.id)}
                >
                  <Text style={styles.buttonText}>
                    {item.completed ? "Undo" : "Complete"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, styles.deleteButton]}
                  onPress={() => handleDeleteTodo(item.id)}
                >
                  <Text style={styles.buttonText}>Delete Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef6ff" },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 120 },

  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },

  themeIconText: { fontSize: 18 },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },

  buttonText: { color: "#ffffff", fontWeight: "700" },

  logoutButton: {
    backgroundColor: "#64748b",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  todoForm: { gap: 10, marginBottom: 16 },
  taskInputGroup: { width: "100%" },
  dateInputGroup: { width: "100%" },
  todoInput: { marginBottom: 0 },

  addButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  todoItem: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  todoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },

  todoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },

  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  inProgressBadge: { backgroundColor: "#f59e0b" },
  completedBadge: { backgroundColor: "#16a34a" },

  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },

  dateText: { color: "#64748b", fontSize: 12, marginBottom: 4 },

  checklistSection: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  checklistTitle: { fontSize: 14, fontWeight: "800", color: "#334155" },

  editChecklistButton: {
    backgroundColor: "#64748b",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  checklistAddRow: { flexDirection: "row", gap: 8, marginBottom: 10 },

  checklistInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },

  addChecklistButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
  },

  checklistEmpty: { color: "#64748b", fontSize: 13 },

  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },

  checklistCheck: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  checklistCheckText: { color: "#2563eb", fontSize: 18, fontWeight: "800" },

  checklistItemText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },

  checklistCompletedText: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },

  checklistDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },

  todoActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 12,
    flexWrap: "wrap",
  },

  smallButton: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  completeButton: { backgroundColor: "#16a34a" },
  undoButton: { backgroundColor: "#f59e0b" },
  deleteButton: { backgroundColor: "#ef4444" },

  emptyText: {
    textAlign: "center",
    color: "#64748b",
    padding: 18,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
  },

  errorText: { color: "#dc2626", marginBottom: 12 },

  darkContainer: { backgroundColor: "#020617" },
  darkCard: { backgroundColor: "#0f172a" },
  darkText: { color: "#f8fafc" },
  darkSubtitle: { color: "#cbd5e1" },

  darkInput: {
    backgroundColor: "#020617",
    borderColor: "#475569",
    color: "#f8fafc",
  },

  darkTodoItem: { backgroundColor: "#111827", borderColor: "#334155" },
  darkChecklistSection: { backgroundColor: "#1e293b", borderColor: "#334155" },
  darkEmptyText: { backgroundColor: "#111827", color: "#cbd5e1" },
  datePickerInput: {
    justifyContent: "center",
  },

  datePickerText: {
    color: "#0f172a",
    fontSize: 15,
  },

  placeholderText: {
    color: "#64748b",
  },

  darkPlaceholderText: {
    color: "#94a3b8",
  },

  datePickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 1,
    marginBottom: 14,
  },

  darkDatePickerWrapper: {
    backgroundColor: "#020617",
  },

  doneDateButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
});
