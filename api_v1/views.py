from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api_v1.serializers import CityDataSerializer
from core.views import get_forecast_weather, get_wind_direction


class GetForecastWeatherAPIView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = CityDataSerializer(data=request.data)
        if serializer.is_valid():
            city = serializer.validated_data['city']
            latitude = serializer.validated_data['latitude']
            longitude = serializer.validated_data['longitude']

            new_data = {'city': city, 'latitude': latitude, 'longitude': longitude}

            # Получаем историю из сессии
            search_history = request.session.get('search_history', [])

            # Удаляем город из истории, если он уже существует
            search_history = [item for item in search_history if item != new_data]

            # Добавляем новый город в начало списка
            search_history.insert(0, new_data)

            # Ограничиваем историю 5 последними запросами
            search_history = search_history[:5]

            # Сохраняем историю в сессии
            request.session['search_history'] = search_history

            location = {
                "lat": latitude,
                "lon": longitude
            }
            params = {
                "units": "metric",
                "exclude": "minutely,alerts,hourly",
            }
            weather_data = get_forecast_weather(location, params)
            weather_data["current"]["wind_deg"] = get_wind_direction(weather_data["current"]["wind_deg"])

            response_data = {
                "status": "success",
                "data": {
                    "weather_data": weather_data,
                    "default_city": city,
                    'search_history': search_history
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error', 'message': 'Invalid data', 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)
