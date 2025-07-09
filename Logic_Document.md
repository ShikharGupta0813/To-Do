# Logic_Document.md

##  Smart Assign Logic 

In my project, I wanted to make task assignment easier by automatically assigning tasks to users who have fewer tasks. For this, I built a **Smart Assign** feature.

Here’s how it works:

- When I click on the **Smart Assign** button for a task, it sends a request to the backend.
- The backend goes through all the users in the system and counts the number of active tasks assigned to them (active tasks are the ones that are not marked as "Done").
- It then finds the user with the **least number of active tasks**.
- That user is automatically assigned to the task.
- This action also gets logged in the activity log to keep track of who was assigned the task and by whom.

This ensures fair distribution of tasks and prevents overloading any single user.


---

## Conflict Handling Logic 

While working on the Kanban board, I realized that conflicts could happen when multiple people try to update the same task at the same time. To avoid any accidental data loss or overwriting, I implemented a **conflict resolution** system.

Here’s how it works:

- Each task has a **version number** that tracks its current state.
- Whenever I try to update a task (whether I’m changing its status, editing its details, or updating its priority), I send the task’s current version along with my update request.
- If the version of the task in the database has changed (because someone else updated it before me), the backend detects this as a **conflict**.
- In such a case, a **Conflict Modal** pops up showing:
  - My version (the data I tried to save).
  - The latest server version (the most up-to-date version from the database).
- I can then decide between:
  1. **Keep Server Version** — This cancels my changes and reloads the latest version of the task.
  2. **Overwrite with My Change** — This forces my changes to be saved on top of the latest version.

### Example:
Suppose I am editing a task’s title and description, but at the same time, another user changes its priority and saves it. When I try to save my changes, the version won’t match, triggering a conflict.

I’ll then get the choice to either:
- Keep the server’s latest version and cancel my edits.
- Overwrite with my changes (which will apply my edits, replacing the server’s latest version).

This system helps to prevent unintentional data loss and gives full control to users during conflicts.

---
