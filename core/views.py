from typing import Dict, List

import requests

from django.views.generic import TemplateView
from decouple import config
from requests import Response


def get_wind_direction(deg: int) -> str:
    directions: List[str] = [
        "North", "North-Northeast", "Northeast", "East-Northeast",
        "East", "East-Southeast", "Southeast", "South-Southeast",
        "South", "South-Southwest", "Southwest", "West-Southwest",
        "West", "West-Northwest", "Northwest", "North-Northwest"
    ]
    idx: int = round(deg / 22.5) % 16
    return directions[idx]


def get_forecast_weather(location: Dict[str, float], params: Dict[str, str | int]) -> Dict[str, dict]:
    url: str = "https://api.openweathermap.org/data/2.5/onecall"
    app_id: str = config('WEATHER_API_KEY')
    params: str = "&".join([f"{k}={v}" for k, v in params.items()])
    location: str = "&".join([f"{k}={v}" for k, v in location.items()])

    request_url: str = f"{url}?{location}&{params}&appid={app_id}"
    response: Response = requests.get(request_url)
    return response.json()


class IndexPage(TemplateView):
    template_name = 'core/index.html'
    extra_context = {'title': 'Weather forecast site'}

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['GOOGLE_PLACE_KEY_API'] = config('GOOGLE_PLACE_KEY_API')

        # Получаем историю из сессии
        search_history: list = self.request.session.get('search_history', [])
        if search_history:
            last_city: Dict[str, str | int] = search_history[0]
            context["default_city"] = last_city["city"]
            location: Dict[str, float] = {
                "lat": last_city["latitude"],
                "lon": last_city["longitude"]
            }
        else:
            context["default_city"] = "Турин"  # По умолчанию Турин
            location: Dict[str, float] = {
                "lat": 45.070312,
                "lon": 7.686856499999999
            }
        params: Dict[str, str] = {
            "units": "metric",
            "exclude": "minutely,alerts,hourly",
            "forecast_days": 7
        }
        weather_data = get_forecast_weather(location, params)
        context["error"] = ''
        if "current" in weather_data:
            weather_data["current"]["wind_deg"] = get_wind_direction(weather_data["current"]["wind_deg"])
            context['weather_data'] = weather_data
            context['search_history'] = search_history
        else:
            context["error"] = f"There's some problem with weather API!"
        return context
