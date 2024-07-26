from rest_framework import serializers


class CityDataSerializer(serializers.Serializer):
    city = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
