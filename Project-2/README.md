# Project 2: Prototyping and Scrum Method

**Contributor:** Garret Godwin  
**Course:** CSCI 4221 — Software Engineering  
**Group:** 1  
**Product:** Campus map application; confirm the scope against the group's Project 1.

## Group and Scrum roles

- Group 1: Garret Godwin, Jada Rodgers, and Amirah Muhammad.
- Product owners and team: all group members.
- ScrumMaster: the instructor.
- Sprint: Sprint 2 corresponds to Course Project 2.
- Weekly Scrum: group meetings to review the backlog and update progress.
- Potential shippable increment: the Project 2 prototype and supporting submission.

## My work

I am working on the settings-page prototype in Figma and developing the backend prototype using Node.js, Express, and SQLite on DragonOS. The prototype covers campus selection, map appearance, location preferences, accessibility, notifications, and help/privacy options.

I agreed to handle backend development on September 22 and started development with Node.js and SQLite on September 29. The backend prototype supports building and indoor-location data for a single-floor map. The actual DragonOS source and database are included in `school-map-backend/`. JavaScript syntax and database integrity checks passed; live API response evidence is still pending. The Figma settings design is an additional contribution.

## My meeting records

I met with the group on September 22, 2026, and September 29, 2026, from 10:45 a.m. to 11:45 a.m. on both dates. The minutes in this folder contain only my notes; other group members write their own files. My first meeting records my backend responsibility; my second records the start of Node.js and SQLite development.

## Files

| File | Purpose | Current status |
| --- | --- | --- |
| [prototype-design.md](prototype-design.md) | Describes the settings prototype, users, and navigation | Draft; confirm with the team |
| [backend_prototype.md](backend_prototype.md) | Verified backend prototype description and API inventory | Source, syntax, and database checks complete |
| [school-map-backend/README.md](school-map-backend/README.md) | Original backend files and run instructions | Source and sample database included |
| [backend-notes.md](backend-notes.md) | Backend development summary and API work | Source and database inspected; live API testing pending |
| [minutes_1.md](minutes_1.md) | Garret's individual first-meeting minutes and PBI table | September 22, 2026; 10:45–11:45 a.m.; backend role recorded |
| [minutes_2.md](minutes_2.md) | Garret's individual second-meeting minutes and progress updates | September 29, 2026; 10:45–11:45 a.m.; development start recorded |
| prototypes/settings.png | Export of the final settings prototype | Not yet added |

[Group 1 Figma design](https://www.figma.com/design/KLO3v6UELNYGNn7ymmxZA8/SE-F26-%7C-Group-1?node-id=33-33&t=BqqVxLNIdWxKKX7t-1)

## Repository workflow from the assignment

Start in VS Code by cloning the instructor's combined [Fall26_G1 repository](https://github.com/CSCI4221ASU/Fall26_G1), which contains the group's Project 1 work. Preserve that work and add Project 2 materials.

The assignment also directs each student to commit and push to their own GitHub repository and submit that repository link in GeorgiaVIEW. The instructor will combine the students' submissions for Project 3. Confirm the local Git remote points to the intended submission repository before pushing; cloning the instructor's repository alone does not establish a connection to a personal repository.

The Project-2 materials are prepared for both local repositories: `CSCI4221_F26` and `GP1`. Copying files into those folders does not commit or push them to GitHub.

## Submission checklist

- [ ] Confirm Project 1 product scope and use the Group 1 combined repository as the starting point.
- [x] Document the two meetings held on September 22 and September 29.
- [ ] Complete individual minutes with Garret Godwin on the first line.
- [ ] Include PBI, Status, Sprint, Estimate, Assigned, and Reviewer columns in each meeting record.
- [ ] Document prototype discussions, user types, usage, and task assignments at the first meeting.
- [ ] Document task status updates at subsequent meetings.
- [x] Record my backend task assignment.
- [x] Add backend source files and sample database.
- [ ] Add live API response evidence of task completion.
- [ ] Review the settings prototype and add its PNG export and design description.
- [ ] Include or link the group's main-screen and click-through prototypes as appropriate.
- [ ] Commit and push the completed materials to my submission repository.
- [ ] Submit my GitHub repository link to Project 2 in GeorgiaVIEW.
- [ ] Confirm the announcement date and due date: the assignment states 10 days after announcement.

## Grading

| Criterion | Points |
| --- | --- |
| Following instructions | 10 |
| Writing minutes | 30 |
| Assigned a task | 20 |
| Completed the task | 40 |
| Total | 100 |
