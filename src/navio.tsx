import {Navio} from 'rn-navio';

import {Main} from '@app/screens/main';
import {Playground} from '@app/screens/playground';
import {PlaygroundFlashList} from '@app/screens/playground/flash-list';
import {PlaygroundExpoImage} from '@app/screens/playground/expo-image';
import {Settings} from '@app/screens/settings';
import {Example} from '@app/screens/_screen-sample';

import {useAppearance} from '@app/utils/hooks';
import {
  screenDefaultOptions,
  tabScreenDefaultOptions,
  getTabBarIcon,
  drawerScreenDefaultOptions,
} from '@app/utils/designSystem';
import {AuthLogin} from './screens/auth/login';
import { services } from './services';

// NAVIO
export const navio = Navio.build({
  screens: {
    Main,
    Settings,

    Playground,

    // for auth flow
    AuthLogin,
  },
  stacks: {
    MainStack: ['Main'],
    PlaygroundStack: {
      screens: ['Playground'],
    },
    AuthFlow: ['AuthLogin'],
  },
  tabs: {
    // main 3 tabs
    AppTabs: {
      layout: {
        MainTab: {
          stack: 'MainStack',
          options: () => ({
            title: 'Trang chủ',
            tabBarIcon: getTabBarIcon('MainTab'),
          }),
        },
        PlaygroundTab: {
          stack: 'PlaygroundStack',
          options: () => ({
            title: 'Cài đặt',
            tabBarIcon: getTabBarIcon('SettingsTab'),
          }),
        },
        // SettingsTab: {
        //   stack: ['Settings'],
        //   options: () => ({
        //     title: services.t.do('settings.title'),
        //     tabBarIcon: getTabBarIcon('SettingsTab'),
        //     tabBarBadge: 23,
        //   }),
        // },
      },
    },
  },
  drawers: {
    // main drawer
    AppDrawer: {
      layout: {
        Main: {
          stack: 'MainStack',
          options: {
            drawerType: 'front',
          },
        },
        Example: {
          stack: ['Example'],
        },
        Playground: {
          stack: 'PlaygroundStack',
        },
        // Tabs: {
        //   tabs: 'TabsWithDrawer',
        // },
      },
    },
  },
  // root: 'AuthFlow',
  hooks: [useAppearance],
  defaultOptions: {
    stacks: {
      screen: screenDefaultOptions,
    },
    tabs: {
      screen: tabScreenDefaultOptions,
    },
    drawers: {
      screen: drawerScreenDefaultOptions,
    },
  },
});

export const getNavio = () => navio;
export const NavioApp = navio.App;
