const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const EventEmitter = require('events');

const todosFile = path.join(__dirname, 'todos.json');
const logsFile = path.join(__dirname, 'logs.txt');

// Logger 
const emitter = new EventEmitter();
emitter.on('log', (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFile(logsFile, `${timestamp} - ${message}\n`, (err) => {
    if (err) console.error('Logging failed:', err);
  });
});


function readTodos(callback) {
  fs.readFile(todosFile, 'utf8', (err, data) => {
    if (err) return callback([]);
    try {
      const todos = JSON.parse(data);
      callback(todos);
    } catch {
      callback([]);
    }
  });
}

function writeTodos(todos, callback) {
  fs.writeFile(todosFile, JSON.stringify(todos, null, 2), callback);
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Server
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/todos') {
    readTodos((todos) => {
      const { completed } = parsed.query;
      if (completed !== undefined) {
        const filtered = todos.filter(todo => String(todo.completed) === completed);
        sendJSON(res, 200, filtered);
      } else {
        sendJSON(res, 200, todos);
      }
      emitter.emit('log', `GET /todos`);
    });
  }

  else if (method === 'GET' && pathname.startsWith('/todos/')) {
    const id = parseInt(pathname.split('/')[2]);
    readTodos((todos) => {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        sendJSON(res, 200, todo);
      } else {
        sendJSON(res, 404, { message: 'Todo not found' });
      }
      emitter.emit('log', `GET /todos/${id}`);
    });
  }

  else if (method === 'POST' && pathname === '/todos') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { title, completed = false } = JSON.parse(body);
        if (!title) return sendJSON(res, 400, { message: 'Title is required' });

        readTodos((todos) => {
          const newTodo = {
            id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
            title,
            completed
          };
          todos.push(newTodo);
          writeTodos(todos, (err) => {
            if (err) return sendJSON(res, 500, { message: 'Failed to write data' });
            sendJSON(res, 201, newTodo);
            emitter.emit('log', `POST /todos`);
          });
        });
      } catch {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
  }

  else if (method === 'PUT' && pathname.startsWith('/todos/')) {
    const id = parseInt(pathname.split('/')[2]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        readTodos((todos) => {
          const index = todos.findIndex(t => t.id === id);
          if (index === -1) return sendJSON(res, 404, { message: 'Todo not found' });

          todos[index] = { ...todos[index], ...updates };
          writeTodos(todos, (err) => {
            if (err) return sendJSON(res, 500, { message: 'Failed to update todo' });
            sendJSON(res, 200, todos[index]);
            emitter.emit('log', `PUT /todos/${id}`);
          });
        });
      } catch {
        sendJSON(res, 400, { message: 'Invalid JSON' });
      }
    });
  }

  else if (method === 'DELETE' && pathname.startsWith('/todos/')) {
    const id = parseInt(pathname.split('/')[2]);
    readTodos((todos) => {
      const index = todos.findIndex(t => t.id === id);
      if (index === -1) return sendJSON(res, 404, { message: 'Todo not found' });

      todos.splice(index, 1);
      writeTodos(todos, (err) => {
        if (err) return sendJSON(res, 500, { message: 'Failed to delete todo' });
        sendJSON(res, 200, { message: 'Todo deleted' });
        emitter.emit('log', `DELETE /todos/${id}`);
      });
    });
  }

  else {
    sendJSON(res, 404, { message: 'Route not found' });
  }
});


server.listen(3000, 'localhost', () => {
  console.log(`Server running at http://localhost:3000/`);
});
