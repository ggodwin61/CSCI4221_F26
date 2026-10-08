Garret Godwin

# Project 2 — My Meeting 3 Notes

**Group:** 1  
**Sprint:** 2 — Project 2  
**Meeting date:** October 8, 2026 (confirm)  
**Time:** 10:45 a.m.–11:45 a.m. (confirm)  
**Duration:** 1 hour  
**Author:** Garret Godwin

## My meeting notes

I continued developing the campus map backend assigned at the first meeting. The prototype now has Node.js and Express routes for building data and indoor locations, with SQLite storing the prototype data. JavaScript syntax checks and a database integrity check passed. Live API testing and frontend integration are still pending, and the database does not yet contain indoor-location records. These are development updates, not claims that all backend work is complete.

## My product backlog item

| PBI | Status | Sprint | Estimate | Assigned | Reviewer |
| --- | --- | --- | --- | --- | --- |
| Develop the campus map backend prototype | In progress; source and database checks passed, live API testing pending | 2 — Project 2 | Not recorded | Garret Godwin | Not recorded |

## Backend development detail

The prototype uses Node.js with Express and SQLite. It supports listing, searching, retrieving, creating, and updating buildings, along with retrieving and adding indoor locations for a building's single-floor map. The supplied database contains Billy C. Black Building; the indoor-location table is currently empty. The checks performed so far validate JavaScript syntax and database integrity, but do not verify live API responses. See [backend-notes.md](backend-notes.md) for the implementation details and remaining work.

## My follow-up action

Run the backend and verify its API responses, then add verified sample indoor-location data if needed to demonstrate the map workflow.