import Axios from 'axios';

const ENDPOINT = process.env.REACT_APP_API_URL;
export const getSignedUrl = async (fileName: string) => {
  return await Axios.get(ENDPOINT + '/upload-url?fileName=' + fileName).then(
    (res) => {
      const { data } = res;
      return data.url;
    }
  );
};
