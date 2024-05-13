import 'expo-dev-client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LogBox} from 'react-native';

import * as Linking from 'expo-linking';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {NavioApp} from '@app/navio';
import {
  configureDesignSystem,
  getNavigationTheme,
  getStatusBarBGColor,
  getStatusBarStyle,
} from '@app/utils/designSystem';
import {hydrateStores, useStores} from '@app/stores';
import {initServices} from '@app/services';
import {AppProvider} from '@app/utils/providers';
import {useAppearance} from '@app/utils/hooks';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import axiosService from '@app/utils/axiosService';

const LOCATION_TASK_NAME = 'background-location-task';
var lastLocationUpdate = new Date().getTime();
const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    // do something with the locations captured in the background
    if(lastLocationUpdate + 5000 > new Date().getTime()) {
      return;
    }
    console.log('locations',locations);
    lastLocationUpdate = new Date().getTime();
    axiosService.post('member/update', {
      lat: locations[0].coords.latitude,
      lng: locations[0].coords.longitude
    }).then(res => {
      console.log('res',res);
    }).catch(err => {
      console.log('err',err);
    })
  }
});

LogBox.ignoreLogs([
  'Require',
  'Found screens with the same name nested inside one another.', // for navio in some cases
]);

export default (): JSX.Element => {
  useAppearance();
  const [ready, setReady] = useState(false);
  const {auth} = useStores();

  useEffect(() => {
    requestPermissions();
  }, [])
  

  // `onLaunch` performs actions that have to be done on app launch before displaying app UI.
  // If you need to make some api requests, load remote config, or some other "heavy" actions, you can use `@app/services/onLaunch.tsx`.
  const onLaunch = useCallback(async () => {
    await SplashScreen.preventAutoHideAsync();

    await hydrateStores();
    configureDesignSystem();
    await initServices();

    setReady(true);
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    onLaunch();
  }, [onLaunch]);

  const NotReady = useMemo(() => {
    // [Tip]
    // You can show loading state here.
    return <></>;
  }, [ready]);

  if (!ready) return NotReady;
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppProvider>
        <StatusBar style={getStatusBarStyle()} backgroundColor={getStatusBarBGColor()} />
        <NavioApp
          navigationContainerProps={{
            theme: getNavigationTheme(),
            linking: {
              prefixes: [Linking.createURL('/')],
            },
          }}

          // [Tip]
          // You can use `root` to change the root of the app depending on global state changes.
          root={auth.state != 'logged-in' ? 'stacks.AuthFlow' : 'tabs.AppTabs'}
        />
      </AppProvider>
    </GestureHandlerRootView>
  );
};
