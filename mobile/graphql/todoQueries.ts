import { gql } from "@apollo/client";

export const SIGNUP = gql`
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

export const LOGIN = gql`
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

export const GET_TODOS = gql`
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

export const ADD_TODO = gql`
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

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

export const TOGGLE_TODO = gql`
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

export const ADD_CHECKLIST_ITEM = gql`
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

export const TOGGLE_CHECKLIST_ITEM = gql`
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

export const DELETE_CHECKLIST_ITEM = gql`
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
