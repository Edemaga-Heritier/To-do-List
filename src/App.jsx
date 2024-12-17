import { useState, useEffect } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  // Charger les tâches depuis le localStorage
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(savedTodos);
  }, []);

  // Sauvegarder les tâches dans le localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Filtrer les tâches
  const getFilteredTodos = () => {
    if (filter === "completed")
      return todos.filter((t) => completedTodos.includes(t));
    if (filter === "pending")
      return todos.filter((t) => !completedTodos.includes(t));
    return todos;
  };

  // Ajouter une tâche avec date
  const onAction = (formData) => {
    const todoText = formData.get("todo");
    const dueDate = formData.get("dueDate");

    if (todoText && todoText.trim() !== "") {
      setTodos([...todos, { text: todoText, dueDate }]);
    }
  };

  // Marquer/démarquer une tâche comme complète
  const toggleComplete = (todo) => {
    if (completedTodos.includes(todo)) {
      setCompletedTodos(completedTodos.filter((t) => t !== todo));
    } else {
      setCompletedTodos([...completedTodos, todo]);
    }
  };

  // Modifier une tâche
  const editTodo = (oldTodo, newText) => {
    if (!newText) return;
    const updatedTodos = todos.map((t) =>
      t === oldTodo ? { ...t, text: newText } : t
    );
    setTodos(updatedTodos);
  };

  // Supprimer une tâche
  const deleteTodo = (todoToDelete) => {
    setTodos(todos.filter((t) => t !== todoToDelete));
    setCompletedTodos(completedTodos.filter((t) => t !== todoToDelete));
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Formulaire pour ajouter une tâche */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onAction(formData);
          e.target.reset();
        }}
        className="flex items-center gap-2"
      >
        <input
          name="todo"
          className="border rounded-md px-2 py-3 flex-1"
          placeholder="Enter a task"
          required
        />
        <input type="date" name="dueDate" required />
        <button
          type="submit"
          className="border rounded-md px-4 py-3 bg-zinc-900 text-white"
        >
          Add
        </button>
      </form>

      {/* Liste des tâches */}
      <ul className="flex flex-col gap-4">
        {getFilteredTodos().map((todo, index) => (
          <li
            key={index}
            className={`bg-zinc-200 px-4 py-2 flex items-center rounded-md ${
              completedTodos.includes(todo) ? "line-through text-gray-500" : ""
            }`}
          >
            <div className="flex-1">
              <span>{todo.text}</span> -{" "}
              <span className="text-sm text-gray-600">
                Due: {todo.dueDate || "No date"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={completedTodos.includes(todo)}
              onChange={() => toggleComplete(todo)}
              className="mr-2"
            />
            <button
              onClick={() => deleteTodo(todo)}
              className="border border-zinc-800 px-2 py-1 text-zinc-900 rounded-md bg-emerald-200 ml-2"
            >
              Delete
            </button>
            <button
              onClick={() => editTodo(todo, prompt("Edit Todo", todo.text))}
              className="border border-zinc-800 px-2 py-1 text-zinc-900 rounded-md bg-amber-200 ml-2"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      {/* Boutons de filtre */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className="border rounded-md px-2 py-1 bg-red-500 text-white"
        >
          All
        </button>
        <button
          onClick={() => setFilter("completed")}
          className="border rounded-md px-2 py-1 bg-green-500 text-white"
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className="border rounded-md px-2 py-1 bg-blue-500 text-white"
        >
          Pending
        </button>
      </div>

      {/* Statistiques */}
      <div className="flex justify-between text-sm mt-2">
        <p>Total Tasks: {todos.length}</p>
        <p>Completed: {completedTodos.length}</p>
        <p>Pending: {todos.length - completedTodos.length}</p>
      </div>
    </div>
  );
}
