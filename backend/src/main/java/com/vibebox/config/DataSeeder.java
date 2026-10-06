package com.vibebox.config;

import com.vibebox.domain.*;
import com.vibebox.repository.CategoryRepository;
import com.vibebox.repository.ProjectRepository;
import com.vibebox.repository.SnippetRepository;
import com.vibebox.repository.TagRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final SnippetRepository snippetRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public DataSeeder(SnippetRepository snippetRepository,
                      ProjectRepository projectRepository,
                      CategoryRepository categoryRepository,
                      TagRepository tagRepository) {
        this.snippetRepository = snippetRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public void run(String... args) {
        if (snippetRepository.count() > 0) {
            return;
        }

        Category basicUi = category("Basic UI");
        Category fullModule = category("Full Module");

        Project playground = project("Playground", "Scratch space for experiments");

        Tag tailwind = tag("Tailwind");
        Tag hooks = tag("Hooks");
        Tag button = tag("Button");
        Tag ai = tag("AI-generated");

        Snippet gradientButton = new Snippet();
        gradientButton.setTitle("Gradient Button");
        gradientButton.setDescription("A rounded button with an indigo-to-purple gradient and hover lift.");
        gradientButton.setType(SnippetType.COMPONENT);
        gradientButton.setCategory(basicUi);
        gradientButton.setProject(playground);
        gradientButton.getTags().addAll(List.of(button, tailwind));
        gradientButton.setEntryFile("/App.js");
        file(gradientButton, "/App.js", """
                import './styles.css';

                export default function App() {
                  return (
                    <div className="wrap">
                      <button className="btn">Click me</button>
                    </div>
                  );
                }
                """);
        file(gradientButton, "/styles.css", """
                .wrap {
                  min-height: 100vh;
                  display: grid;
                  place-items: center;
                  background: #0f1117;
                }
                .btn {
                  border: none;
                  padding: 12px 28px;
                  border-radius: 999px;
                  font-size: 16px;
                  font-weight: 600;
                  color: #fff;
                  cursor: pointer;
                  background: linear-gradient(135deg, #6366f1, #a855f7);
                  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                  transition: transform .15s ease, box-shadow .15s ease;
                }
                .btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 12px 26px rgba(99, 102, 241, 0.55);
                }
                """);
        snippetRepository.save(gradientButton);

        Snippet counter = new Snippet();
        counter.setTitle("Counter with Hooks");
        counter.setDescription("Minimal useState counter demonstrating state updates.");
        counter.setType(SnippetType.COMPONENT);
        counter.setCategory(basicUi);
        counter.getTags().addAll(List.of(hooks, ai));
        counter.setNotes("Uses the functional updater form of setState to avoid stale state.");
        counter.setEntryFile("/App.js");
        file(counter, "/App.js", """
                import { useState } from 'react';

                export default function App() {
                  const [count, setCount] = useState(0);
                  return (
                    <div style={{ fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
                      <h1>{count}</h1>
                      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
                    </div>
                  );
                }
                """);
        snippetRepository.save(counter);

        Snippet todo = new Snippet();
        todo.setTitle("Todo List Module");
        todo.setDescription("A small multi-file module: list + item components with add/toggle.");
        todo.setType(SnippetType.MODULE);
        todo.setCategory(fullModule);
        todo.getTags().add(hooks);
        todo.setEntryFile("/App.js");
        file(todo, "/App.js", """
                import { useState } from 'react';
                import TodoList from './TodoList';

                export default function App() {
                  const [items, setItems] = useState([
                    { id: 1, text: 'Learn Sandpack', done: false },
                    { id: 2, text: 'Build VibeBox', done: true },
                  ]);
                  const [text, setText] = useState('');

                  const add = () => {
                    if (!text.trim()) return;
                    setItems((prev) => [...prev, { id: Date.now(), text, done: false }]);
                    setText('');
                  };

                  const toggle = (id) =>
                    setItems((prev) =>
                      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
                    );

                  return (
                    <div style={{ fontFamily: 'sans-serif', maxWidth: 360, margin: '40px auto' }}>
                      <h2>Todos</h2>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={text} onChange={(e) => setText(e.target.value)} />
                        <button onClick={add}>Add</button>
                      </div>
                      <TodoList items={items} onToggle={toggle} />
                    </div>
                  );
                }
                """);
        file(todo, "/TodoList.js", """
                import TodoItem from './TodoItem';

                export default function TodoList({ items, onToggle }) {
                  return (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {items.map((item) => (
                        <TodoItem key={item.id} item={item} onToggle={onToggle} />
                      ))}
                    </ul>
                  );
                }
                """);
        file(todo, "/TodoItem.js", """
                export default function TodoItem({ item, onToggle }) {
                  return (
                    <li
                      onClick={() => onToggle(item.id)}
                      style={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? '#888' : '#111',
                      }}
                    >
                      {item.text}
                    </li>
                  );
                }
                """);
        snippetRepository.save(todo);
    }

    private Category category(String name) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category c = new Category();
            c.setName(name);
            return categoryRepository.save(c);
        });
    }

    private Project project(String name, String description) {
        return projectRepository.findByName(name).orElseGet(() -> {
            Project p = new Project();
            p.setName(name);
            p.setDescription(description);
            return projectRepository.save(p);
        });
    }

    private Tag tag(String name) {
        return tagRepository.findByName(name).orElseGet(() -> {
            Tag t = new Tag();
            t.setName(name);
            return tagRepository.save(t);
        });
    }

    private void file(Snippet snippet, String path, String code) {
        SnippetFile f = new SnippetFile();
        f.setPath(path);
        f.setCode(code);
        snippet.addFile(f);
    }
}
