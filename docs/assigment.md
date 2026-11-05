NRS Fullstack Assignment: Please develop a web application using either React JS or VueJS 3 that consumes JSON APIs to retrieve and present data about U.S. states and their populations.


Application Requirements:

The app should include:

1. State Lists

• A scrollable list of state names.

• On single click of a state:

• Display a details panel showing:

State name

Total state population

Number of counties

List of counties with their populations

Sum of county populations

Indication whether county population totals match the state population record

• On double click:

Toggle highlighted/unhighlighted state status in the list


2. Duplicate State List

A second scrollable list of states

Should reflect highlighted states

Should also support single-click and double-click interactions


3. Search / Filter

• A filter box that applies only to the second list

• Filtering should:

Be case-insensitive

Match partial text anywhere in the state name

Update in real time while typing

• Example:

• Searching "ne" should match:

Maine

Nevada

etc.

Screen Layout

The UI should contain 4 areas:

Scrollable State List #1

Scrollable State List #2

Search box (for list #2 only)

Scrollable detail panel

Keep the state list areas physically small enough to require scrolling.

Data Sources

State list endpoint:

http://localhost:nnn/states

Each state object contains a detail link which should be used to retrieve detailed state information.

 

Backend Requirements:

Build the backend using one of the following:

Node.js + Express

PHP 8 + Slim

Additional Requirements:

1. Provide a PostgreSQL schema representing the tables required for:

States

Counties

2. Import the provided JSON data into PostgreSQL.

3. Implement the APIs required to support:

State list retrieval

State detail retrieval

4. The solution should be:

Runnable

Shippable

Preferably containerized with Docker

5. Submit the assignment as a Git repository (GitHub, Bitbucket, etc.)