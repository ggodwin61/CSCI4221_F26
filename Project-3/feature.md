# Campus Map Feature

**Name:** Garret Godwin  
**Group number:** Group 1

## Classroom Search

### Description

Classroom Search helps users find a specific classroom inside a campus building. It supports new professors such as Dr. Phillip Journey who know their assigned room number but are unfamiliar with the building’s floor and room layout. A building name or abbreviation distinguishes classrooms with the same room number.

### Input Action Output

- **Input:** A classroom number, a building name or abbreviation when needed, and selection of a matching classroom.
- **Action:** The app finds matching classrooms and displays the selected classroom’s building, floor, and room location.
- **Output:** Matching classrooms labeled by building and room number. The selected result shows the full building name, floor, and classroom number, with the room highlighted on an available indoor floor map. If no map is available, the app displays the recorded location information and states that the map is unavailable. If no classroom matches, it asks the user to check the room number or building.

### Feature Characteristics

- **Independence:** Users can search directly for a classroom without first activating another feature. Results do not depend on the order of activation or implementation of other features.
- **Coherence:** The feature serves one purpose: identifying and locating a classroom. The building, floor, and indoor map provide context for that task. Searching does not change classroom records or user settings.
- **Relevance:** Finding an assigned classroom is a normal task for a new professor preparing to teach on an unfamiliar campus.

### Derivation from the Scenario

In [Dr. Journey’s scenario](scenario.md), he needs to **search** for a classroom, **select** the correct result, and **view** its floor and indoor location. These actions identify the functionality Classroom Search must provide. Accurate classroom records and floor maps support the feature. My remaining data preparation task is to map BCB’s first floor and record room numbers and locations for the backend. Live indoor positioning and turn-by-turn guidance are outside this feature’s scope.

