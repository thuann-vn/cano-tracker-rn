import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView } from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';

import { services, useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { AuthApi } from '@app/services/api/auth';
import { useStores } from '@app/stores';

const timeInterval = 5 //Call API to up location per 5s
var centerMapTimeout = null

export const Main: NavioScreen = observer(({ }) => {
  useAppearance();
  const navigation = useNavigation();
  const { api } = useServices();
  const { auth } = useStores();
  console.log(auth)
  // State (local)
  const [loading, setLoading] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(timeInterval)
  const [currentPosition, setCurrentPosition] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [users, setUsers] = useState([])

  const mapRef = useRef()
  useEffect(() => {
    navigation.setOptions({
      title: "Vị trí của bạn"
    })
  }, [])

  useEffect(() => {
    let myInterval = null
    if (auth.is_admin) {
      myInterval = setInterval(async () => {
        //Load users
        const users = await api.auth.getUsers()
        console.log(users)
        setUsers(users)
      }, 10000)
    } else {
      myInterval = setInterval(async () => {
        if (currentInterval > 0) {
          setCurrentInterval(currentInterval - 1)
        }
        if (currentInterval === 0) {
          if (currentPosition) {
            let location = await Location.getCurrentPositionAsync({});
            setCurrentPosition({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });

            mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }, 500)

            //Call API
            updateLocation(location.coords)
          }
          setCurrentInterval(timeInterval)
        }
      }, 10000)
    }

    return () => {
      clearInterval(myInterval)
    }
  })


  //Call API update location
  const updateLocation = async (location) => {
    api.auth.updateProfile({
      lat: location.latitude,
      lng: location.longitude,
    })
  }

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Vui lòng kiểm tra lại cài đặt vị trí của bạn!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentPosition(location);
    })();
  }, []);

  return (
    <View flex bg-bgColor>
      <MapView
        zoomEnabled={true}
        zoomControlEnabled={true}
        minZoomLevel={15}
        maxZoomLevel={20}
        ref={mapRef}
        style={{
          height: '100%'
        }}
        initialRegion={currentPosition}
      >
        {
          currentPosition ? (
            <Marker.Animated
              coordinate={currentPosition}
            >
              <Image source={require('../../assets/location_icon.png')} style={{ width: 40, height: 40 }} />
            </Marker.Animated>
          ) : null
        }

      </MapView>
    </View>
  );
});
Main.options = () => ({
  title: services.t.do('home.title'),
});
