Garret Godwin

# Project 4 Campus Map Meeting 4

**Meeting date:** October 22, 2026  
**Time:** 11:00 a.m.–12:00 p.m.  
**Duration:** 1 hour  
**Format:** Meeting  
**Participants:** Garret, Amirah, and Jada  
**Sprint:** 4 — Project 4

## Meeting Summary

The group met to discuss progress on Project 4, the measured campus map database integration, and the remaining work needed to verify and use the map data.

## Garret Godwin Completed Work

- Added a SQLite schema for map metadata, hallways, source locations, raw measurements, and locations awaiting correction.
- Added import scripts to load the workbook's measured map data into the database while preserving manual corrections and verification statuses across re-imports.
- Added API endpoints to list maps, retrieve map details and measurements, and serve the map's reference image.
- Added automated checks for repeat imports, correction preservation, database integrity, and map API handlers.
- Added a README with setup instructions, API examples, data limitations, and remaining verification needs.

## Remaining Work

- Reconcile conflicting measurements and hallway origins before placing rooms or creating routes.
- Confirm room numbers for the pending right-wing labels; do not treat labels from the incorrect map as verified room names.
- Install dependencies and run the project tests and server locally, then verify the API responses.

## Product Backlog

| PBI | Status | Sprint | Assigned |
| --- | --- | --- | --- |
| Integrate measured BCB first-floor map data with the campus-map backend | Backend schema, import workflow, map API, documentation, and test checks implemented; data verification and local runtime testing remain | 4 — Project 4 | Garret Godwin |
