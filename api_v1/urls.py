from django.urls import path
from api_v1 import views

app_name = "api_v1"

urlpatterns = [
    path('weather/', views.GetForecastWeatherAPIView.as_view(), name='weather'),
]
