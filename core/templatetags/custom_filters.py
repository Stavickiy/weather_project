from django import template
from datetime import datetime

register = template.Library()

@register.filter
def unix_to_datetime(value, date_format="%Y-%m-%d %H:%M:%S"):
    """
    Преобразует Unix timestamp в объект datetime и форматирует его по заданному шаблону.
    :param value: Unix timestamp
    :param date_format: Шаблон для форматирования даты и времени
    :return: Отформатированная строка даты и времени
    """
    try:
        dt = datetime.utcfromtimestamp(value)
        return dt.strftime(date_format)
    except (ValueError, TypeError):
        return value


@register.filter
def multiply(value: int | float, arg: int | float) -> int:
    """Возвращает значение, умноженное на аргумент."""
    try:
        return round(float(value) * float(arg))
    except (ValueError, TypeError):
        return round(value)
