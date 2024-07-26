from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from api_v1 import views

app_name = "api_v1"

urlpatterns = [
    path('weather/', views.GetForecastWeatherAPIView.as_view(), name='weather'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
