First, install all the libraries used for the backend
Use the command:
    pip install -r requirements.txt

This will automatically install all dependencies.

Next, to run the server for FastAPI run this command. NOTE: you have to be in the backend directory to run this
    uvicorn main:app --reload

To run this command while in the root directory (outside of the backend directory) simply do this:
    uvicorn backend.main:app --reload

The normal port (should say in the terminal) should be 8000.
So, when connecting this to the frontend make sure that the ports match up when fetching.
Example:
    fetch("http://127.0.0.1:8000/api/analyze")
    
    The frontend will make calls like this (as well as params like method/header/body but for example sake we'll keep it simple)

NOTE:
After you run this code your machine will automatically create __pycache__, they not to push this or delete before pushing since we may be outside of 
different python interpreters. 
    For example mine says:
        main.cpython-312.pyc 
    Because I'm using 3.12 version of python. So, remember to delete or don't commit the __pycache__ directory.
