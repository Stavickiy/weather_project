# Используем базовый образ Python
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Устанавливаем зависимости для работы с PostgreSQL и netcat
RUN apt-get update && apt-get install -y \
    postgresql-client \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Обновляем pip
RUN pip install --upgrade pip

# Копируем файл зависимостей
COPY requirements.txt /app/

# Устанавливаем Python библиотеки
RUN pip install --no-cache-dir -r requirements.txt || { echo 'pip install failed'; exit 1; }

# Копируем остальные файлы приложения
COPY . /app/

# Копируем скрипт запуска
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Устанавливаем скрипт запуска как entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Открываем порт для приложения
EXPOSE 8000

# Команда по умолчанию (будет заменена entrypoint.sh)
CMD ["gunicorn", "weather_project.wsgi:application", "--bind", "0.0.0.0:8000"]