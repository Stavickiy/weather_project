#!/bin/bash

# Ожидание старта базы данных
echo "Waiting for postgres..."
until pg_isready -h $DATABASE_HOST -p $DATABASE_PORT; do
  echo "PostgreSQL is not ready yet"
  sleep 1
done
echo "PostgreSQL is ready"

# Выполнение миграций
echo "Applying migrations..."
python manage.py migrate

# Сбор статики
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Запуск сервера
echo "Starting server..."
exec gunicorn weather_project.wsgi:application --bind 0.0.0.0:8000