import React, {useEffect, useMemo} from 'react';
import {Text, View} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {ScrollView} from 'react-native-gesture-handler';
import {Bounceable} from 'rn-bounceable';
import {If} from '@kanzitelli/if-component';

import {useStores} from '@app/stores';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {Row} from '@app/components/row';
import {Icon, IconName} from '@app/components/icon';
import {Section} from '@app/components/section';
import { useNavigation } from '@react-navigation/native';

type SectionData = {
  content: {
    title: string;
    subtitle?: string;
    icon: IconName;
    onPress: PureFunc;
  }[];
};

export const Playground: React.FC = observer(() => {
  useAppearance();
  const {navio} = useServices();
  const {auth} = useStores();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "Cài đặt"
    })
  }, [])
  

  const showAuthFlow = () => {
    // logging out from previous session
    if (auth.state === 'logged-in') {
      auth.logout();
      navio.setRoot('stacks', 'AuthFlow');
    } else {
      navio.setRoot('stacks', 'AuthFlow');
    }
  };

  // Memos
  const SectionsData: Record<string, SectionData> = {
    "Tài khoản": {
      content: [
        {
          title: 'Đăng xuất',
          icon: 'lock-closed-outline',
          subtitle: auth.stateStr,
          onPress: showAuthFlow,
        }
      ],
    },
  };

  // UI Methods
  const Sections = useMemo(() => {
    const keys = Object.keys(SectionsData) as (keyof typeof SectionsData)[];
    return keys.map(k => {
      const s = SectionsData[k];
      return (
        <Section key={k} title={null}>
          {s.content.map(content => {
            return (
              <View key={content.title} marginV-s1>
                <Bounceable onPress={content.onPress}>
                  <View bg-bg2Color padding-s3 br30>
                    <Row>
                      <Icon name={content.icon} size={34} />

                      <View flex marginH-s3>
                        <Text text60R textColor>
                          {content.title}
                        </Text>

                        {If({
                          _: !!content.subtitle,
                          _then: (
                            <Text text70 grey20>
                              {content.subtitle}
                            </Text>
                          ),
                        })}
                      </View>

                      <Icon name="chevron-forward" />
                    </Row>
                  </View>
                </Bounceable>
              </View>
            );
          })}
        </Section>
      );
    });
  }, [SectionsData]);

  return (
    <View flex bg-bgColor>
      <ScrollView contentInsetAdjustmentBehavior="always">{Sections}</ScrollView>
    </View>
  );
});
