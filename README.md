https://drive.google.com/drive/folders/1i78FCyodKNCwlSdGdwgZl5KVcGgRbMyP?usp=sharing

This project is a simple RESTful API built using Node.js, the `http` and `fs` modules, and basic server-side JavaScript.  
It mimics the `todos` endpoint from JSONPlaceholder and performs full CRUD (Create, Read, Update, Delete) operations.

Todo data is stored in a local JSON file (`todos.json`), and API activity is logged to a `logs.txt` file using the `events` module.

Installation & Setup
1. Clone the Repository
git clone https://github.com/your-username/appdev2-midterm-project.git
cd appdev2-midterm-project

2. Install Node.js(if you haven't installed yet)
3. store data in todos.json
[
  { "id": 1, "title": "Learn Node.js", "completed": false },
  { "id": 2, "title": "Build an API", "completed": true }
]

How to Run
1. Use this command to start the server
   node server.js
2. You should see:
Server running at http://localhost:3000/
3. use postman to interact with API

Use this guide for the following endpoints:
GET
/todos
Fetch all todos (optional filtering by completed status)
GET
/todos/:id
Fetch a specific todo by ID
POST
/todos
Create a new todo
PUT
/todos/:id
Update a todo by ID
DELETE
/todos/:id
Delete a todo by ID


