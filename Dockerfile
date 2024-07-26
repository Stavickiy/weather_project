# Указываем базовый образ
FROM python:3.12

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Создаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt /app/

# Устанавливаем зависимости
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Копируем проект
COPY . /app/

# Собираем статические файлы
RUN python manage.py collectstatic --noinput

# Прописываем команду запуска
CMD ["gunicorn", "weather_project.wsgi:application", "--bind", "0.0.0.0:8000"]