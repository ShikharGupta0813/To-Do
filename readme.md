# 📝 Kanban Task Management App

A full-stack **Kanban Task Management Application** that helps users to manage their tasks visually. It includes **Smart Assignment** of tasks, **Drag-and-Drop** task handling, **Conflict Detection**,**Priority of Tasks**, **Activity Logs**, and **Authentication**.

---

## 🚀 Project Overview

This project is a feature-rich Kanban Board where users can:

* **Create**, **Edit**, **Delete** tasks
* Drag-and-drop tasks between columns (Todo, In Progress, Done)
* Set Priority for tasks (High, Medium, Low)
* Smartly assign tasks to the user with the **fewest active tasks**
* Tasks inside each column are shown in **decreasing priority order** (High first)
* Tasks have title validations — cannot match column names and must be unique
* Track all actions in a **Live Activity Log** (real-time via sockets)
* Handle task **conflicts** smartly (with options to Keep Server Version or Overwrite with My Changes) during **edits or drag-and-drop**

---

## 🛠️ Tech Stack Used

### Frontend:

* **React.js** (Vite + React Router + Axios)
* **Socket.io-client**
* **React-Toastify** (for notifications)
* **CSS** (Vanilla CSS)

### Backend:

* **Node.js** + **Express.js**
* **MongoDB** + **Mongoose**
* **Socket.io** (for real-time updates)
* **JWT Authentication**
* **Render** (Backend Deployment)
* **Vercel** (Frontend Deployment)

---

## ⚙️ Setup & Installation (Run Locally)

### ✅ 1. Clone the Repo:

```bash
git clone https://github.com/your-username/kanban-task-app.git
cd kanban-task-app
```

### ✅ 2. Install Backend Dependencies:

```bash
cd backend
npm install
```

### ✅ 3. Configure Backend `.env`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### ✅ 4. Start Backend Server:

```bash
npm start
```

### ✅ 5. Install Frontend Dependencies:

```bash
cd ../frontend
npm install
```

### ✅ 6. Configure Frontend `.env`:

```
VITE_API_URL=http://localhost:5000
```

### ✅ 7. Start Frontend:

```bash
npm run dev
```
## 🛰️ Deployment

### Frontend Deployment (Vercel)

- Connect repository on Vercel  
- Set the project root directory to `my-next-app`  
- Set environment variable `NEXT_PUBLIC_API_URL` to your backend URL  
- Deploy

### Backend Deployment (Render)

- Create new Web Service on Render  
- Connect repository  
- Set root directory to `backend`  
- Add environment variables:
  - PORT
  - DATABASE_URL
  - JWT_SECRET  
- Add build & start commands if required  
- Deploy

---

## ✅ Features List & Usage Guide:

| Feature                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| User Authentication    | Users can login/register                                                    |
| Create Task            | Add tasks with title, description, and priority                             |
| Edit/Delete Task       | Modify or remove existing tasks                                             |
| Drag-and-Drop          | Move tasks across Todo, In Progress, and Done columns                       |
| Smart Assignment       | Automatically assigns task to the user with the fewest active tasks         |
| Conflict Handling      | Detects concurrent edits & offers merge or overwrite options                |
| Real-Time Activity Log | Logs actions such as task creation, deletion, status change, and edits (via socket.io) |
| Priority Levels        | Assign and update task priority (Low, Medium, High)                         |
| Priority Ordering      | Tasks in each column are automatically sorted by priority (High to Low)     |
| Task Title Validation  | Prevents duplicate task titles and disallows titles same as column names     |

---

## 🔍 Logic Explanations:

### ✅ Smart Assign Logic:

* Backend checks all users.
* Counts their *active* tasks (tasks not marked 'Done').
* Assigns task to the user with **fewest active tasks**.

```js
const users = await User.find({});
for (let user of users) {
  const count = await Task.countDocuments({ assignedUser: user._id, status: { $ne: 'Done' } });
  if (count < minTasks) targetUser = user;
}
```

### ✅ Conflict Handling Logic:

* When updating, version check is done to avoid overwriting newer data.
* If conflict detected, app shows modal with two choices:

  1. **Keep Server Version**
  2. **Overwrite With My Changes**
* Resolves according to user’s choice.

```js
if (req.body.version !== undefined && task.version !== req.body.version) {
  return res.status(409).json({ message: 'Conflict detected', currentTask: task });
}
```

---

## 🔗 Live Demo & Video

* **🔴 Live App:** [Live App Link](https://to-do-mindvistas-projects.vercel.app)
* **🎥 Demo Video:** [Demo Video Link](https://www.loom.com/share/5deb2f159e034ce99633cc818aa1889d?sid=d3bd3f72-232f-40cf-828a-07c56a685aa4)

---

## 📌 Author

Made with ❤️ by [Shikhar Gupta](https://github.com/ShikharGupta0813)

---
