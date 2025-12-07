# base image
FROM python:3.12-slim

# set work directory
WORKDIR /app

# install system dependencies
RUN apt-get update && apt-get install -y \
	gcc \
	postgresql-client \
	curl \
	&& rm -rf /var/lib/apt/lists/*

# install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

# expose port
EXPOSE 8000

# run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]