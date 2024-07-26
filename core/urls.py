from django.urls import path

from core import views

app_name = "core"

urlpatterns = [
    path('', views.IndexPage.as_view(), name='index'),
    # path('weather/', views.SaveCityDataView.as_view(), name='weather'),
]