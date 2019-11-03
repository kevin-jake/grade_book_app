# Grade_book_Application
-------------
Overview
-------------

The Grade Book Application is an application (for Tiffy) that takes a file or data from the user by pasting it on the text area on the site. It will then output the results of the their final grades of students that is sorted by their first name based from the formula or method that Tiffy is using.

---------------------
Technical Description
---------------------

In this application the developer used NodeJS and JS programming. The database used is cloud Mongodb database (https://cloud.mongodb.com) and for the styling the user used bootstrap.

--------------
Pseudo Code
--------------

NOTE: NodeJS must be installed on your local machine

- Go to the root directory of the project folder and run an npm start command on your terminal.
- Open a browser and go to http://localhost:3000/
- Once the page is loaded user can now paste the grade data on the text area field.
- For the best use of the application user must paste the data on a specific format (Please see example below)

Example Data:
Quarter 1, 2019
Susan Smith H 75 88 94 95 84 68 91 74 100 82 93 T 73 82 81 92 85
John Wright H 86 55 96 78 T 82 89 93 70 74 H 93 85 80 74 76 82 62
Jane Jones T 88 94 100 82 95 H 84 66 74 98 92 85 100 95 96 42 88
Suzy Johnson H 65 72 78 80 82 74 76 0 85 75 76 T 74 79 70 83 78
Mang Tomas H 65 72 78 80 82 74 76 0 85 75 76 T 74 79 70 83 78
Jimmy Doe H 73 99 98 83 85 92 100 60 74 98 92 T 84 96 79 91 95

- User can also upload a .txt file on the browser and see the file loaded on the text area.
- Clicking the "Get Final Grade Average" button will display the final grade results and save it on the cloud database.
- If a certain record or name is pasted again on the text area that record will only be updated on the database and not create a new record.
