import axiosService from '@app/utils/axiosService';
import {Auth$Login$Response} from '@app/utils/types/api';

export class AuthApi {
  login = async (phone: string, password: string): Promise<Auth$Login$Response> => {
    // faking request
    const result = await axiosService.post('login', {
      phone, 
      password
    });
    console.log(result)
    if(result){

      return {
        status: 'success',
        data: {
          'some-session-info?': {},
        },
      };
    }else{
      return {
        status: 'fail',
        data:{
          'some-session-info?': {},
        }
      };
    }

  };
}
