import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView } from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';

import { services, useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useStores } from '@app/stores';

const timeInterval = 5 //Call API to up location per 5s
var centerMapTimeout = null

export const Main: NavioScreen = observer(({ }) => {
  useAppearance();
  const navigation = useNavigation();
  const { api } = useServices();
  const { auth } = useStores();
  // State (local)
  const [loading, setLoading] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(timeInterval)
  const [currentPosition, setCurrentPosition] = useState<any>(null)
  const [users, setUsers] = useState([])

  const mapRef = useRef()
  useEffect(() => {
    navigation.setOptions({
      title: auth.is_admin ? "Vị trí cano" : "Vị trí của bạn"
    })

    if(mapRef.current){
      if (auth.is_admin) {
        fetchUsers()
      } else {
        getCurrentPositionAsync();
      }
    }
  }, [mapRef])

  useEffect(() => {
    let myInterval = null
    if (auth.is_admin) {
      myInterval = setInterval(async () => {
        fetchUsers()
      }, 10000)
    } else {
      myInterval = setInterval(async () => {
        if (currentInterval > 0) {
          setCurrentInterval(currentInterval - 1)
        }
        if (currentInterval === 0) {
          getCurrentPositionAsync()
          setCurrentInterval(timeInterval)
        }
      }, 10000)
    }

    return () => {
      clearInterval(myInterval)
    }
  })

  const getCurrentPositionAsync = async () => {
    let location = await Location.getCurrentPositionAsync({});

    setCurrentPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

    mapRef.current.fitToCoordinates([
      location.coords
    ], {
      edgePadding: { top: 150, bottom: 150, left: 150, right: 150 }
    })

    //Call API
    updateLocation(location.coords)
  }

  //Fetch users locations
  const fetchUsers = async () => {
    const users = await api.auth.getUsers()
    setUsers(users.data)
    centerMapByCoordinates(users.data)
  }

  //Make map center
  const centerMapByCoordinates = (users) => {
    mapRef.current.fitToCoordinates(users.filter(user => user.lat && user.lng).map(user => ({
      latitude: parseFloat(user.lat),
      longitude: parseFloat(user.lng),
    })), {
      edgePadding: { top: 150, bottom: 150, left: 150, right: 150 }
    })
  }

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
      setCurrentPosition(location.coords);
    })();
  }, []);

  return (
    <View flex bg-bgColor>
      <MapView
        zoomEnabled={true}
        zoomControlEnabled={true}
        minZoomLevel={12}
        maxZoomLevel={16}
        ref={mapRef}
        style={{
          height: '100%'
        }}
        initialRegion={{
          ...currentPosition,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider='google'
        showsCompass={true}
        showsBuildings={true}
        followsUserLocation={true}
      >
        {
          !auth.is_admin && currentPosition ? (
            <Marker.Animated
              coordinate={{
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
              }}

            >
              <Image source={require('../../assets/location_icon.png')} style={{ width: 40, height: 40 }} />
            </Marker.Animated>
          ) : null
        }
        {
          users.filter(user => user.lat && user.lng && !user.is_admin).map((user, index) => (
            <Marker
              key={user.id}
              coordinate={{
                latitude: parseFloat(user.lat),
                longitude: parseFloat(user.lng),
              }}
            >
              <Text center={true}  textAlign="center" style={{fontWeight: "bold"}}>
                {user.name}
              </Text>
              <Image source={require('../../assets/location_icon.png')} style={{ width: 40, height: 40 }} />
              <Callout>
                  <View style={{width: 150}}>
                      <Text>Họ và tên: {user.name}</Text>
                      <Text>SDT: {user.phone}</Text>
                  </View>
              </Callout>
            </Marker>
          ))
        }

      </MapView>
    </View>
  );
});
Main.options = () => ({
  title: services.t.do('home.title'),
});
