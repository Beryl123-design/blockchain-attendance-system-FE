## Get Started

create a postgres database (i.e database _name = employee_attendance)
create an .env file in the blockchain-attendance-backend directory and populate with what is the example.env


For the DATABASE_URL
say:
- database_name=employee_attendance
- username=postgres
- password=postgres
- port_number=5432

The DATABASE_URL should be;
    
    DATABASE_URL="postgres://postgres:postgres@localhost:5432/empattnd"

## Run the Backend-Server
 In the blockchain-attendance-backend directory, 

 Run the following commands to start the server;
 
 ```bash
 npm install
 npm run dev
 ```