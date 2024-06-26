import React, { useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { View, Text, Colors } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';

import { useStores } from '@app/stores';
import { useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import { BButton } from '@app/components/button';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';

export type Props = {
  type?: 'push';
};

export const AuthLogin: NavioScreen<Props> = observer(({ type = 'push' }) => {
  const {appearance} = useAppearance(); // for Dark Mode
  const { t, navio, api } = useServices();
  const { auth, ui } = useStores();
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  // Start
  useEffect(() => {
    configureUI();
  }, []);

  // API Methods
  const login = async () => {
    setLoading(true);

    try {
      const { status, data } = await api.auth.login(auth.email, password); // fake login

      if (status === 'success') {
        // marking that we are logged in
        auth.set('state', 'logged-in');
        auth.set('is_admin', data.user.is_admin);

        // navigating to main app
        navio.setRoot('tabs', 'AppTabs');
      }
    } catch (e) {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra lại thông tin đăng nhập.');
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // Methods
  const configureUI = () => {
    ui.set('appearance', 'light');
    navigation.setOptions({
      title: "Đăng nhập"
    });
  };

  const setEmail = (v: string) => auth.set('email', v);

  return (
    <View flex bg-bgColor>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <View>
          <View marginT-s6 centerH>
            <View
              paddingH-s4
              marginV-s10
              style={{ width: 300, borderWidth: 1, borderColor: Colors.grey50, borderRadius: 12 }}
            >
              <View paddingH-s3 paddingV-s2 marginV-s4>
                <TextInput
                  placeholder={'Số điện thoại'}
                  value={auth.email}
                  onChangeText={setEmail}
                  keyboardType="phone-pad"
                  inputMode="numeric"
                  placeholderTextColor={Colors.grey40}
                />
              </View>

              <View centerH>
                <View height={1} bg-grey50 style={{ width: '100%' }} />
              </View>

              <View paddingH-s3 paddingV-s2 marginV-s4>
                <TextInput
                  placeholder={'Mật khẩu'}
                  value={password}
                  onChangeText={setPassword}
                  keyboardType="visible-password"
                  secureTextEntry
                  placeholderTextColor={Colors.grey40}
                />
              </View>
            </View>

            <BButton label={loading ? 'Đang đăng nhập ...' : 'Đăng nhập'} onPress={login} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
AuthLogin.options = props => ({
  title: `Auth flow`,
});
