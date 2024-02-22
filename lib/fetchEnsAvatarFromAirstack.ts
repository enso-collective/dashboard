import axios from 'axios';
import validateUrl from './validateUrl';

export async function getEnsAvatar(userAddress = '') {
  const queryObj = {
    query: `query MyQuery {
        Domains(input: {filter: {owner: {_eq: "${userAddress}"}}, blockchain: ethereum}) {
          Domain {
            avatar
          }
        }
      }
        `
  };
  const ensData = (await axios.post('https://api.airstack.xyz/gql', queryObj))
    .data;

  const urls = ensData.data.Domains.Domain.filter(
    (t: any) => t.avatar.length > 0 && validateUrl(t.avatar)
  );
  return urls[0]?.avatar;
}
