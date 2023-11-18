var query = `query Proposal($id: String) {
    proposal(id: $id) {
      state
      scores
    }
  }`
var id = args[0];
const snapshotAPIRequest = Functions.makeHttpRequest({
  url: 'https://hub.snapshot.org/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  data: JSON.stringify({query, variables: {id}}),
  timeout: 6000
});

const snapshotAPIResponse = await snapshotAPIRequest;
if (snapshotAPIResponse.error) {
  throw Error('Request failed');
}

const proposalResponse = snapshotAPIResponse['data']['data']['proposal'];
const isClosed = proposalResponse.state == 'closed';
if(isClosed){
  const scores = proposalResponse.scores;
  const winner = getWinner(scores)
  if(winner >= 0){
      return Functions.encodeUint256(winner);
  }else{
      throw Error(`Proposal ${id} is tied`);
  }
}else{
  throw Error(`Voting ongoing for ${id}`);
}

function getWinner(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return -1;
  }

  let maxScore = scores[0];
  let maxIndex = 0;
  let isTie = false;

  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      maxIndex = i;
      isTie = false;
    } else if (scores[i] === maxScore) {
      isTie = true;
    }
  }

  return isTie ? -1 : maxIndex;
}