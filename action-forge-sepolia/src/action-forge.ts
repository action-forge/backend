import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ActionExecuted as ActionExecutedEvent,
  ActionForgeRegistered as ActionForgeRegisteredEvent,
  ETHReceived as ETHReceivedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RequestFulfilled as RequestFulfilledEvent,
  RequestSent as RequestSentEvent,
  Response as ResponseEvent
} from "../generated/ActionForge/ActionForge"
import {
  ActionExecuted,
  ActionForgeRegistered,
  ETHReceived,
  OwnershipTransferred,
  RequestFulfilled,
  RequestSent,
  Response
} from "../generated/schema"

export function handleActionExecuted(event: ActionExecutedEvent): void {
  let entity = new ActionExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.option = event.params.option
  entity.actionType = event.params.actionType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleActionForgeRegistered(
  event: ActionForgeRegisteredEvent
): void {
  let entity = new ActionForgeRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.actionForgeId = event.params.actionForgeId
  entity.upkeepId = event.params.upkeepId
  entity.createdBy = event.params.createdBy
  entity.proposal_snapshotId = event.params.proposal.snapshotId
  entity.proposal_actionForgeId = event.params.proposal.actionForgeId
  entity.proposal_endTime = event.params.proposal.endTime
  entity.proposal_action_types = event.params.proposal.actions.map<BigInt>(a => BigInt.fromI32(a.actionType))
  entity.proposal_action_txData = event.params.proposal.actions.map<Bytes>(a => a.txData)
  entity.proposal_executed = event.params.proposal.executed
  entity.proposal_winnerOption = event.params.proposal.winnerOption

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleETHReceived(event: ETHReceivedEvent): void {
  let entity = new ETHReceived(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRequestFulfilled(event: RequestFulfilledEvent): void {
  let entity = new RequestFulfilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ActionForge_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRequestSent(event: RequestSentEvent): void {
  let entity = new RequestSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ActionForge_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResponse(event: ResponseEvent): void {
  let entity = new Response(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.response = event.params.response
  entity.err = event.params.err

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
