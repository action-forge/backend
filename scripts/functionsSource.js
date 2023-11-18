// Functions code for ActionForge
// Code breakdown:
// - get target proposal id from args
// - fetch data from Snapshot API (graphql)
// - validate that the voting period has ended, and that there is a winner (no ties)
// - call function on our contract that stores the winning vote option and executes actions tied to that


// query to fetch proposal data
var query = `query Proposal($id: String) {
    proposal(id: $id) {
      state
      scores
    }
  }`
// proposal id passed in args
var id = args[0];
// request object
const snapshotAPIRequest = Functions.makeHttpRequest({
  url: 'https://hub.snapshot.org/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  data: JSON.stringify({query, variables: {id}}),
  timeout: 6000
});

// Execute the API request (Promise)
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

// util function getWinner
// determines winner, or returns -1 in case of tie
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