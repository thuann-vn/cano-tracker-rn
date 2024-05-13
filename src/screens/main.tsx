import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';

import { services, useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useStores } from '@app/stores';
import { Icon } from '@app/components/icon';

const timeInterval = 5 //Call API to up location per 5s

export const Main: NavioScreen = observer(({ }) => {
  useAppearance();
  const { ui } = useStores();
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
      title: auth.is_admin ? "CANO NGUYỄN HIỀN" : "CANO NGUYỄN HIỀN"
    })

    if (mapRef.current) {
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
        getCurrentPositionAsync()
        if (currentInterval === 0) {
          setCurrentInterval(timeInterval)
        }
      }, 1000)
    }

    return () => {
      clearInterval(myInterval)
    }
  }, [currentInterval, setCurrentInterval, auth.is_admin])

  const getCurrentPositionAsync = async () => {
    let location = await Location.getCurrentPositionAsync({});

    setCurrentPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
    });

    mapRef.current.fitToCoordinates([
      location.coords
    ], {
      edgePadding: { top: 150, bottom: 150, left: 150, right: 150 }
    })

    //Call API
    console.log(currentInterval)
    if (currentInterval === 0) {
      console.log('Call API')
      updateLocation(location.coords)
    }
  }

  //Fetch users locations
  const fetchUsers = async () => {
    const users = await api.auth.getUsers()
    const filteredUsers = users.data.filter((user: { lat: any; lng: any; is_admin: any; }) => user.lat && user.lng && !user.is_admin);
    setUsers(filteredUsers)
    centerMapByCoordinates(filteredUsers)
  }

  //Make map center
  const centerMapByCoordinates = (users: any[]) => {
    var markers = users.map((user: { lat: string; lng: string; }) => ({
      latitude: parseFloat(user.lat),
      longitude: parseFloat(user.lng),
    }))
    mapRef.current.fitToCoordinates(markers, {
      edgePadding: { top: 150, bottom: 150, left: 150, right: 150 }
    })
  }

  //Call API update location
  const updateLocation = async (location: { latitude: any; longitude: any; altitude?: number | null; accuracy?: number | null; altitudeAccuracy?: number | null; heading?: number | null; speed?: number | null; }) => {
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
        zoomTapEnabled={true}
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
        showsScale={true}
      >
        {
          !auth.is_admin && currentPosition ? (
            <Marker.Animated
              coordinate={{
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image source={require('../../assets/cano_icon.png')} style={{
                width: 60,
                height: 30,
                resizeMode: "contain"
                // transform: [{
                //   rotate: `${currentPosition.heading}deg`
                // }]
              }} />
            </Marker.Animated>
          ) : null
        }
        {
          users.map((user, index) => (
            <Marker.Animated
              key={user.id}
              coordinate={{
                latitude: parseFloat(user.lat),
                longitude: parseFloat(user.lng),
              }}
              style={{ alignItems: 'center' }}
              onCalloutPress={() => Linking.openURL('tel://' + user.phone)}
            >
              <Text center={true} textAlign="center" style={{ fontWeight: "bold", color: '#4155FF' }}>
                {user.name}
              </Text>
              <Image source={require('../../assets/cano_icon.png')} style={{
                width: 60,
                height: 30,
                resizeMode: "contain"
              }} />
              <Callout onPress={() => {
                Linking.openURL('tel://' + user.phone)
              }}>
                <View style={{ width: 200, paddingVertical: 10 }}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}>
                    <Icon name='person-circle' color={Colors.grey40} />
                    <Text style={{ fontWeight: 'bold', marginLeft: 5, color: '#4155FF' }}>{user.name}</Text>
                  </View>
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Icon name='phone-portrait-outline' color={Colors.grey40} />
                    <Text style={{ fontWeight: 'bold', marginLeft: 5, color: '#4155FF' }}>{user.phone}</Text>
                  </View>
                </View>
              </Callout>
            </Marker.Animated>
          ))
        }

      </MapView>
    </View>
  );
});
Main.options = () => ({
  title: services.t.do('home.title'),
});
