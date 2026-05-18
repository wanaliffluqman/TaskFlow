const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let users = [];
let todos = [];
let currentUserId = null;

const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
  }

  type ChecklistItem {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    userId: ID!
    createdAt: String!
    completedAt: String
    dueDate: String
    checklistItems: [ChecklistItem!]!
  }

  type AuthPayload {
    user: User!
    message: String!
  }

  type Query {
    users: [User!]!
    todos: [Todo!]!
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addTodo(title: String!, dueDate: String!): Todo!
    deleteTodo(id: ID!): Boolean!
    toggleTodo(id: ID!): Todo!
    addChecklistItem(todoId: ID!, title: String!): Todo!
    toggleChecklistItem(todoId: ID!, checklistItemId: ID!): Todo!
    deleteChecklistItem(todoId: ID!, checklistItemId: ID!): Todo!
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return users.map((user) => ({
        id: user.id,
        email: user.email,
      }));
    },

    todos: () => {
      if (!currentUserId) return [];
      return todos.filter((todo) => todo.userId === currentUserId);
    },
  },

  Mutation: {
    signup: (_, { email, password }) => {
      const existingUser = users.find((user) => user.email === email);

      if (existingUser) {
        throw new Error("User already exists");
      }

      const newUser = {
        id: String(Date.now()),
        email,
        password,
      };

      users.push(newUser);
      currentUserId = newUser.id;

      return {
        user: newUser,
        message: "Signup successful",
      };
    },

    login: (_, { email, password }) => {
      const user = users.find(
        (user) => user.email === email && user.password === password,
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      currentUserId = user.id;

      return {
        user,
        message: "Login successful",
      };
    },

    addTodo: (_, { title, dueDate }) => {
      if (!currentUserId) {
        throw new Error("Please login first");
      }

      if (!dueDate) {
        throw new Error("Due date is required");
      }

      const newTodo = {
        id: String(Date.now()),
        title,
        completed: false,
        userId: currentUserId,
        createdAt: new Date().toISOString(),
        completedAt: null,
        dueDate,
        checklistItems: [],
      };

      todos.push(newTodo);
      return newTodo;
    },

    deleteTodo: (_, { id }) => {
      const beforeDelete = todos.length;
      todos = todos.filter((todo) => todo.id !== id);
      return todos.length < beforeDelete;
    },

    toggleTodo: (_, { id }) => {
      const todo = todos.find((todo) => todo.id === id);

      if (!todo) {
        throw new Error("Todo not found");
      }

      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;

      return todo;
    },

    addChecklistItem: (_, { todoId, title }) => {
      const todo = todos.find((todo) => todo.id === todoId);

      if (!todo) {
        throw new Error("Todo not found");
      }

      const newChecklistItem = {
        id: String(Date.now()),
        title,
        completed: false,
      };

      todo.checklistItems.push(newChecklistItem);
      return todo;
    },

    toggleChecklistItem: (_, { todoId, checklistItemId }) => {
      const todo = todos.find((todo) => todo.id === todoId);

      if (!todo) {
        throw new Error("Todo not found");
      }

      const checklistItem = todo.checklistItems.find(
        (item) => item.id === checklistItemId,
      );

      if (!checklistItem) {
        throw new Error("Checklist item not found");
      }

      checklistItem.completed = !checklistItem.completed;
      return todo;
    },

    deleteChecklistItem: (_, { todoId, checklistItemId }) => {
      const todo = todos.find((todo) => todo.id === todoId);

      if (!todo) {
        throw new Error("Todo not found");
      }

      todo.checklistItems = todo.checklistItems.filter(
        (item) => item.id !== checklistItemId,
      );

      return todo;
    },
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.get("/", (req, res) => {
    res.send("TaskFlow GraphQL Backend is running");
  });

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();
