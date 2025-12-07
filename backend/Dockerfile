# base image
FROM python:3.12-alpine

# set work directory
WORKDIR /app

# install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

# expose port
EXPOSE 8000

# run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]