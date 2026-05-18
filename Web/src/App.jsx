import { useEffect, useState, useRef } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import CalendarView from "./components/CalendarView";

const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      message
      user {
        id
        email
      }
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      message
      user {
        id
        email
      }
    }
  }
`;

const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($title: String!, $dueDate: String!) {
    addTodo(title: $title, dueDate: $dueDate) {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

const ADD_CHECKLIST_ITEM = gql`
  mutation AddChecklistItem($todoId: ID!, $title: String!) {
    addChecklistItem(todoId: $todoId, title: $title) {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

const TOGGLE_CHECKLIST_ITEM = gql`
  mutation ToggleChecklistItem($todoId: ID!, $checklistItemId: ID!) {
    toggleChecklistItem(todoId: $todoId, checklistItemId: $checklistItemId) {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

const DELETE_CHECKLIST_ITEM = gql`
  mutation DeleteChecklistItem($todoId: ID!, $checklistItemId: ID!) {
    deleteChecklistItem(todoId: $todoId, checklistItemId: $checklistItemId) {
      id
      title
      completed
      createdAt
      completedAt
      dueDate
      checklistItems {
        id
        title
        completed
      }
    }
  }
`;

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function App() {
  const [viewMode, setViewMode] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const dueDateInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [checklistInputs, setChecklistInputs] = useState({});
  const [editChecklistTodoId, setEditChecklistTodoId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_TODOS, {
    skip: !user,
    pollInterval: 3000,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: false,
  });

  const [signup] = useMutation(SIGNUP);
  const [login] = useMutation(LOGIN);
  const [addTodo] = useMutation(ADD_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [toggleTodo] = useMutation(TOGGLE_TODO);

  const [addChecklistItem] = useMutation(ADD_CHECKLIST_ITEM);
  const [toggleChecklistItem] = useMutation(TOGGLE_CHECKLIST_ITEM);
  const [deleteChecklistItem] = useMutation(DELETE_CHECKLIST_ITEM);

  const todos = data?.todos || [];

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = isSignup
        ? await signup({ variables: { email, password } })
        : await login({ variables: { email, password } });

      const authData = isSignup ? result.data.signup : result.data.login;

      setUser(authData.user);
      localStorage.setItem("user", JSON.stringify(authData.user));
      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !dueDate) {
      setErrorMessage("Please enter task title and due date.");
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
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleDeleteTodo = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmDelete) return;

    try {
      await deleteTodo({
        variables: { id },
      });

      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      await toggleTodo({
        variables: { id },
      });

      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleChecklistInputChange = (todoId, value) => {
    setChecklistInputs((prev) => ({
      ...prev,
      [todoId]: value,
    }));
  };

  const handleAddChecklistItem = async (todoId) => {
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
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleChecklistItem = async (todoId, checklistItemId) => {
    try {
      await toggleChecklistItem({
        variables: {
          todoId,
          checklistItemId,
        },
      });

      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleDeleteChecklistItem = async (todoId, checklistItemId) => {
    try {
      await deleteChecklistItem({
        variables: {
          todoId,
          checklistItemId,
        },
      });

      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");

    setEmail("");
    setPassword("");
    setTitle("");
    setDueDate("");
    setErrorMessage("");

    setChecklistInputs({});
    setEditChecklistTodoId(null);
    setViewMode("home");
  };

  if (!user) {
    return (
      <main className={isDarkMode ? "container dark" : "container"}>
        <div className="card">
          <div className="card-top">
            <button
              type="button"
              className="theme-icon-button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <h1>TaskFlow</h1>
          <p className="subtitle">Your tasks, all in one placer</p>

          <form onSubmit={handleAuth}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errorMessage && <p className="error">{errorMessage}</p>}

            <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
          </form>

          <button
            className="link-button"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup
              ? "Already have an account? Login"
              : "No account? Sign up"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className={
        isDarkMode ? "dashboard-container dark" : "dashboard-container"
      }
    >
      <div className="app-shell">
        <aside className="sidebar">
          <div>
            <h2 className="sidebar-title">TaskFlow</h2>
            <p className="sidebar-subtitle">Your tasks, all in one placer</p>

            <nav className="sidebar-nav">
              <button
                type="button"
                className={
                  viewMode === "home"
                    ? "sidebar-link active-sidebar-link"
                    : "sidebar-link"
                }
                onClick={() => setViewMode("home")}
              >
                📝 Home
              </button>

              <button
                type="button"
                className={
                  viewMode === "calendar"
                    ? "sidebar-link active-sidebar-link"
                    : "sidebar-link"
                }
                onClick={() => setViewMode("calendar")}
              >
                📅 Calendar
              </button>
            </nav>
          </div>

          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-link"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button className="sidebar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className="card dashboard-card">
          <div className="header">
            <div>
              <h1>{viewMode === "home" ? "My To-Do List" : "Calendar View"}</h1>
              <p className="subtitle">Logged in as {user.email}</p>
            </div>
          </div>

          {loading && !data && <p>Loading tasks...</p>}
          {error && <p className="error">{error.message}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}

          {viewMode === "home" && (
            <>
              <form onSubmit={handleAddTodo} className="todo-form">
                <div className="form-group task-field">
                  <label htmlFor="taskTitle">New Task</label>
                  <input
                    id="taskTitle"
                    type="text"
                    placeholder="Enter new task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group due-field">
                  <label htmlFor="taskDueDate">Due Date</label>

                  <div
                    className="date-input-wrapper"
                    onClick={() => {
                      dueDateInputRef.current?.showPicker?.();
                      dueDateInputRef.current?.focus();
                    }}
                  >
                    <input
                      ref={dueDateInputRef}
                      id="taskDueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="due-date-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit">Add</button>
              </form>

              <div className="todo-list">
                {todos.length === 0 && <p className="empty">No tasks yet.</p>}

                {todos.map((todo) => (
                  <div className="todo-item" key={todo.id}>
                    <div className="todo-top-row">
                      <span
                        className={
                          todo.completed ? "todo-title completed" : "todo-title"
                        }
                      >
                        {todo.title}
                      </span>

                      <span
                        className={
                          todo.completed
                            ? "status-badge completed-badge"
                            : "status-badge in-progress-badge"
                        }
                      >
                        {todo.completed ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <p className="date-text">
                      Created: {formatDateTime(todo.createdAt)}
                    </p>

                    {todo.dueDate && (
                      <p className="date-text">
                        Due: {formatDate(todo.dueDate)}
                      </p>
                    )}

                    {todo.completedAt && (
                      <p className="date-text">
                        Completed: {formatDateTime(todo.completedAt)}
                      </p>
                    )}

                    <div className="checklist-section">
                      <div className="checklist-header">
                        <p className="checklist-title">Checklist</p>

                        <button
                          type="button"
                          className="edit-checklist-button"
                          onClick={() =>
                            setEditChecklistTodoId(
                              editChecklistTodoId === todo.id ? null : todo.id,
                            )
                          }
                        >
                          {editChecklistTodoId === todo.id
                            ? "Done"
                            : todo.checklistItems?.length > 0
                              ? "Edit"
                              : "+ Add Checklist"}
                        </button>
                      </div>

                      {editChecklistTodoId === todo.id && (
                        <div className="checklist-add-row">
                          <input
                            type="text"
                            placeholder="Add checklist item..."
                            value={checklistInputs[todo.id] || ""}
                            onChange={(e) =>
                              handleChecklistInputChange(
                                todo.id,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddChecklistItem(todo.id);
                              }
                            }}
                          />

                          <button
                            type="button"
                            className="add-checklist-button"
                            onClick={() => handleAddChecklistItem(todo.id)}
                          >
                            Add
                          </button>
                        </div>
                      )}

                      {todo.checklistItems?.length === 0 && (
                        <p className="checklist-empty">
                          No checklist items yet.
                        </p>
                      )}

                      {todo.checklistItems?.map((item) => (
                        <div className="checklist-item" key={item.id}>
                          <button
                            type="button"
                            className="checklist-check"
                            onClick={() =>
                              handleToggleChecklistItem(todo.id, item.id)
                            }
                          >
                            {item.completed ? "☑" : "☐"}
                          </button>

                          <span
                            className={
                              item.completed ? "checklist-completed" : ""
                            }
                          >
                            {item.title}
                          </span>

                          {editChecklistTodoId === todo.id && (
                            <button
                              type="button"
                              className="checklist-delete"
                              onClick={() =>
                                handleDeleteChecklistItem(todo.id, item.id)
                              }
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="todo-actions">
                      <button
                        type="button"
                        className={
                          todo.completed ? "undo-button" : "complete-button"
                        }
                        onClick={() => handleToggleTodo(todo.id)}
                      >
                        {todo.completed ? "Undo" : "Complete"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        Delete Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {viewMode === "calendar" && (
            <CalendarView todos={todos} onToggleTodo={handleToggleTodo} />
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
