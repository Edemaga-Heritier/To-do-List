/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "TODO";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  // Référence pour focus automatique
  const inputRef = useRef();

  // Filtrage des tâches
  const getFilteredTodos = () => {
    switch (filter) {
      case "completed":
        return todos.filter((t) => completedTodos.includes(t.id));
      case "pending":
        return todos.filter((t) => !completedTodos.includes(t.id));
      default:
        return todos;
    }
  };

  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(savedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const isNearDeadline = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    const diffInHours = (taskDate - today) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours > 0;
  };

  const onAction = (formData) => {
    const todoText = formData.get("todo");
    const dueDate = formData.get("dueDate");
    const finDate = formData.get("finDate");

    if (todoText && todoText.trim() !== "") {
      const newTodo = {
        id: Date.now(),
        text: todoText,
        dueDate,
        finDate,
      };

      setTodos([...todos, newTodo]);

      if (isNearDeadline(dueDate)) {
        alert(
          `⏰ Attention ! La tâche "${todoText}" arrive bientôt à échéance.`
        );
      }

      // Focus sur le champ de saisie
      inputRef.current.focus();
    }
  };

  const moveTodo = (dragIndex, hoverIndex) => {
    const updatedTodos = [...todos];
    const [draggedTodo] = updatedTodos.splice(dragIndex, 1);
    updatedTodos.splice(hoverIndex, 0, draggedTodo);
    setTodos(updatedTodos);
  };

  const toggleComplete = (id) => {
    if (completedTodos.includes(id)) {
      setCompletedTodos(completedTodos.filter((t) => t !== id));
    } else {
      setCompletedTodos([...completedTodos, id]);
    }
  };

  const editTodo = (id, newText) => {
    if (!newText) return;
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: newText } : todo
    );
    setTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    setCompletedTodos(completedTodos.filter((t) => t !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          Task Manager
        </h1>

        {/* Compteurs des tâches */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-lg font-semibold w-full max-w-4xl">
          <p className="bg-gray-100 rounded-lg p-3 text-center shadow">
            Total: {todos.length}
          </p>
          <p className="bg-yellow-100 rounded-lg p-3 text-center shadow">
            En cours: {todos.length - completedTodos.length}
          </p>
          <p className="bg-green-100 rounded-lg p-3 text-center shadow">
            Terminées: {completedTodos.length}
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onAction(formData);
            e.target.reset();
          }}
          className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-4xl"
        >
          <input
            ref={inputRef}
            name="todo"
            className="border rounded-md px-3 py-2 flex-1 shadow"
            placeholder="Enter a task"
            required
          />
          <input
            type="datetime-local"
            name="dueDate"
            className="border rounded-md px-3 py-2 shadow"
            required
          />
          <input
            type="datetime-local"
            name="finDate"
            className="border rounded-md px-3 py-2 shadow"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
          >
            Add
          </button>
        </form>

        {/* Liste des tâches */}
        <ul className="space-y-4 w-full max-w-4xl">
          {getFilteredTodos().map((todo, index) => (
            <TodoItem
              key={todo.id}
              index={index}
              todo={todo}
              moveTodo={moveTodo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
              editTodo={editTodo}
              isNearDeadline={isNearDeadline}
              completed={completedTodos.includes(todo.id)}
            />
          ))}
        </ul>

        {/* Boutons de filtre */}
        <div className="flex gap-2 mt-5">
          {["all", "completed", "pending"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md transition-all ${
                filter === type
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

function TodoItem({
  todo,
  index,
  moveTodo,
  toggleComplete,
  deleteTodo,
  editTodo,
  isNearDeadline,
  completed,
}) {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item) => {
      if (item.index !== index) {
        moveTodo(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <li
      ref={(node) => ref(drop(node))}
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-md transition-all ${
        completed
          ? "bg-gray-200 line-through text-gray-500"
          : isNearDeadline(todo.dueDate)
          ? "bg-yellow-50"
          : "bg-white"
      }`}
    >
      <div>
        <p className="font-semibold">{todo.text}</p>
        <p className="text-sm text-gray-500">Due: {todo.dueDate}</p>
      </div>

      <input
        type="checkbox"
        checked={completed}
        onChange={() => toggleComplete(todo.id)}
        className="m-2"
      />

      <div className="flex gap-2">
        <button
          onClick={() => deleteTodo(todo.id)}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-all"
        >
          Delete
        </button>
        <button
          onClick={() => editTodo(todo.id, prompt("Edit Todo", todo.text))}
          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-all"
        >
          Edit
        </button>
      </div>
    </li>
  );
}
