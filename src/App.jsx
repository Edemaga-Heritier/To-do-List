import { useState } from "react";

export default function App() {
  // Initialiser l'état avec un tableau contenant des valeurs par défaut
  const [todos, setTodos] = useState([]);

  const onAction = async (formData) => {
    const todo = formData.get("todo");

    // Vérification pour éviter d'ajouter des valeurs vides
    if (todo && todo.trim() !== "") {
      setTodos([...todos, todo]); // Ajouter le nouvel élément dans le tableau
    }
  };

  const [completedTodos, setCompletedTodos] = useState([]);
  const toggleComplete = (todo) => {
    if (completedTodos.includes(todo)) {
      setCompletedTodos(completedTodos.filter((t) => t.trim() !== todo));
    } else {
      setCompletedTodos([...completedTodos, todo]);
    }
  };

  const editTodo = (oldTodo, newTodo) => {
    const updatedTodos = todos.map((t) => (t === oldTodo ? newTodo : t));
    setTodos(updatedTodos);
  };

  const deleteTodo = (text) => {
    const newTodos = todos.filter((t) => t !== text);
    setTodos(newTodos);
  };
  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Formulaire pour ajouter une tâche */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Empêcher le rechargement de la page
          const formData = new FormData(e.target);
          onAction(formData);
          e.target.reset(); // Réinitialiser le formulaire après ajout
        }}
        className="flex items-center gap-2"
      >
        <input
          name="todo"
          className="border rounded-md px-2 py-3 flex-1"
          placeholder="Enter a task"
        />
        <button
          type="submit"
          className="border rounded-md px-4 py-3 bg-zinc-900 text-white"
        >
          Add
        </button>
      </form>

      {/* Affichage des tâches */}
      <ul className="flex flex-col gap-4 ">
        {todos.map((todo, index) => (
          <li
            key={index} // Utiliser l'index comme clé si les valeurs ne sont pas uniques
            className={`bg-zinc-200 px-4 py-2 flex items-center rounded-md ${
              completedTodos.includes(todo) ? " line-through text-gray-500" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={completedTodos.includes(todo)}
              onChange={() => toggleComplete(todo)}
              className="mr-2"
            />
            <span className="flex-1">{todo}</span>
            <button
              onClick={() => deleteTodo(todo)}
              className="border border-zinc-800 px-2 py-1 text-zinc-900 rounded-md bg-emerald-200"
            >
              Delete
            </button>
            <button
              onClick={() => editTodo(todo, prompt("Edit Todo", todo))}
              className="border border-zinc-800 px-2 py-1 text-zinc-900 rounded-md bg-amber-200 m-2"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
