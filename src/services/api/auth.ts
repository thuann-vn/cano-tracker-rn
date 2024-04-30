import axiosService from '@app/utils/axiosService';
import {Auth$Login$Response} from '@app/utils/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage'
export class AuthApi {
  login = async (phone: string, password: string): Promise<Auth$Login$Response> => {
    // faking request
    const result = await axiosService.post('login', {
      phone,
      password,
    });
    if (result.access_token) {
      AsyncStorage.setItem('token', result.access_token)
      return {
        status: 'success',
        data: {access_token: result.access_token, user: result.user},
      };
    } else {
      return {
        status: 'fail',
        data: {
          'some-session-info?': {},
        },
      };
    }
  };

  logout = async (): Promise<boolean> => {
    // faking request
    await AsyncStorage.removeItem('token')
    return true
  };

  updateProfile = async (data: any): Promise<boolean> => {
    const result = await axiosService.post('member/update', data);
    return true;
  }

  getUsers = async (): Promise<any> => {
    const result = await axiosService.get('users');
    return result;
  }
}
